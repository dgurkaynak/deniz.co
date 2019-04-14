import faceapi from './face-api';
import FaceLandmarks from './face-landmarks';
import FaceDeformer from './face-deformer';
import PoissonBlenderWorker from 'worker-loader!./poisson-blender-worker';
import FaceSwapResult from './face-swap-result';
import { readImageData, resizeImage, resizePoints, getBoundingBox, canvasToURL } from './utils';

const MAX_IMAGE_SIZE = [ 1280, 1280 ];


export default class FaceSwapper {
  faceImage: HTMLImageElement
  faceLandmarks: FaceLandmarks;
  faceDeformer: FaceDeformer;

  poissonBlendMaskCanvas = document.createElement('canvas');
  poissonBlendCanvas = document.createElement('canvas');
  finalAlphaMaskCanvas = document.createElement('canvas');


  constructor(faceImage: HTMLImageElement) {
    this.faceImage = faceImage;
  }


  async init() {
    // faceapi must be inited
    const detections = await faceapi.detectAllFaces(this.faceImage, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks();

    if (detections.length == 0) {
      throw new Error('No face detected in source image');
    }

    this.faceLandmarks = FaceLandmarks.createFromFaceApiDetection(detections[0]);

    this.faceDeformer = new FaceDeformer(
      readImageData(this.faceImage),
      this.faceLandmarks.points,
      MAX_IMAGE_SIZE[0],
      MAX_IMAGE_SIZE[1]
    );
  }


  async processImage(image: HTMLImageElement, options: Partial<{
    resizeIfNecessary: boolean
  }> = {}) {
    if (options.resizeIfNecessary && (image.width > MAX_IMAGE_SIZE[0] || image.height > MAX_IMAGE_SIZE[1])) {
      const scaleX = MAX_IMAGE_SIZE[0] / image.width;
      const scaleY = MAX_IMAGE_SIZE[1] / image.height;
      const scale = Math.min(scaleX, scaleY);
      image = await resizeImage(image, image.width * scale, image.height * scale);
    }

    const detections = await faceapi.detectAllFaces(image, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks();
    const faces: FaceLandmarks[] = detections.map((d: any) => FaceLandmarks.createFromFaceApiDetection(d));
    faces.forEach(({ points }) => this.faceDeformer.deform(points));
    this.preparePoissonBlendMask(faces, image.width, image.height);

    const boundingBoxes = faces.map(({ points }) => {
      const { x, y, width, height } = getBoundingBox(points);
      return [ Math.floor(x), Math.floor(y), Math.ceil(width), Math.ceil(height) ]; // Crucial
    });

    // Set-up canvas and print original image
    this.poissonBlendCanvas.width = image.width;
    this.poissonBlendCanvas.height = image.height;
    const poissonBlendCC = this.poissonBlendCanvas.getContext('2d');
    // TODO: Benchmark below
    poissonBlendCC.drawImage(image, 0, 0);
    // poissonBlendCC.putImageData(readImageData(image), 0, 0);

    const poissonBlendMaskCC = this.poissonBlendMaskCanvas.getContext('2d');

    // For each face, perform a poisson blending in workers
    const faceBlendingTasks = boundingBoxes.map(async ([x, y, width, height]) => {
      const sourceImageData = this.faceDeformer.getPartialImageData(x, y, width, height);
      const destinationImageData = readImageData(image, x, y, width, height);
      const maskImageData = poissonBlendMaskCC.getImageData(x, y, width, height);

      const worker = new PoissonBlenderWorker();

      return new Promise((resolve) => {
        worker.onmessage = (event) => {
          const resultImageDataBuffer: ArrayBuffer = (event.data as any).resultImageDataBuffer;
          const resultImageDataArr = new Uint8ClampedArray(resultImageDataBuffer);
          poissonBlendCC.putImageData(new ImageData(resultImageDataArr, width, height), x, y);
          worker.terminate();
          resolve();
        };

        worker.postMessage({
          x,
          y,
          width,
          height,
          iteration: 30,
          sourceImageDataBuffer: sourceImageData.data.buffer,
          destinationImageDataBuffer: destinationImageData.data.buffer,
          maskImageDataBuffer: maskImageData.data.buffer,
        }, [
          sourceImageData.data.buffer,
          destinationImageData.data.buffer,
          maskImageData.data.buffer
        ]);
      });
    });
    await Promise.all(faceBlendingTasks);

    // Finally crop blended result with feather selection
    this.prepareFinalAlphaMask(faces, image.width, image.height);
    const finalAlphaMaskCC = this.finalAlphaMaskCanvas.getContext('2d');
    finalAlphaMaskCC.save();
    finalAlphaMaskCC.globalCompositeOperation = 'source-atop';
    finalAlphaMaskCC.drawImage(this.poissonBlendCanvas, 0, 0);
    finalAlphaMaskCC.restore();

    // TODO: Instead of creating image elements, what if we
    // directly load three.texture from canvas elements? Benchmark it.
    const overlayImage = new Image();
    overlayImage.src = await canvasToURL(this.finalAlphaMaskCanvas);

    this.faceDeformer.clear();

    return new FaceSwapResult(
      image,
      overlayImage,
      faces
    );
  }


  private preparePoissonBlendMask(faces: FaceLandmarks[], width: number, height: number) {
    this.poissonBlendMaskCanvas.width = width;
    this.poissonBlendMaskCanvas.height = height;
    const cc = this.poissonBlendMaskCanvas.getContext('2d');

    cc.fillStyle = '#000000';
    cc.fillRect(0, 0, width, height);

    faces.forEach((face) => {
      const path = face.getBoundaryPath();
      cc.beginPath();
      path.forEach(([x, y], i) => {
        if (i == 0) {
          cc.moveTo(x, y);
        } else {
          cc.lineTo(x, y);
        }
      });
      cc.closePath();
      cc.fillStyle = '#ffffff';
      cc.fill();
    });
  }


  private prepareFinalAlphaMask(faces: FaceLandmarks[], width: number, height: number, faceResizeFactor = 0.85, featherBlur = 10) {
    this.finalAlphaMaskCanvas.width = width;
    this.finalAlphaMaskCanvas.height = height;
    const cc = this.finalAlphaMaskCanvas.getContext('2d');

    cc.clearRect(0, 0, width, height);

    faces.forEach((face) => {
      const boundaryPath = face.getBoundaryPath();
      const resizedPath = resizePoints(boundaryPath, faceResizeFactor);
      const boundingBox = getBoundingBox(resizedPath);
      const offsetX = boundingBox.x + boundingBox.width;

      // draw outside of the canvas, we just want its shadow
      cc.beginPath();
      resizedPath.forEach(([x, y], i) => {
        if (i == 0) {
          cc.moveTo(x - offsetX, y);
        } else {
          cc.lineTo(x - offsetX, y);
        }
      });
      cc.closePath();
      cc.shadowColor = '#fff';
      cc.shadowBlur = featherBlur;
      cc.shadowOffsetX = offsetX;
      cc.fillStyle = '#fff';
      cc.fill();
    });
  }
}
