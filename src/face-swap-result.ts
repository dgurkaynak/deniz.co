import FaceLandmarks from './face-landmarks';
import { resizeImage } from './utils';


export default class FaceSwapResult {
  faceBoundingBoxesUV: { x: number, y: number, width: number, height: number }[];


  constructor(
    public image: HTMLImageElement,
    public overlayImage: HTMLImageElement,
    public faces: FaceLandmarks[],
    public originalWidth?: number,
    public originalHeight?: number
  ) {
    this.originalWidth = originalWidth || image.width;
    this.originalHeight = originalHeight || image.height;

    // Bounding boxes are already calculated in faceLandmark, but they're cartesian coordinates
    // Convert them to UV coordinate system and cache
    this.faceBoundingBoxesUV = this.faces.map((faceLandmark) => {
      return {
        x: faceLandmark.boundingBox.x / this.width,
        width: faceLandmark.boundingBox.width / this.width,
        y: 1 - ((faceLandmark.boundingBox.y + faceLandmark.boundingBox.height) / this.height),
        height: faceLandmark.boundingBox.height / this.height
      };;
    });
  }


  async resize(width: number, height: number) {
    // We cannot parallelize these because of global cached canvas :/
    const newImage = await resizeImage(this.image, width, height);
    const newOverlayImage = await resizeImage(this.overlayImage, width, height);

    const scaleX = width / this.width;
    const scaleY = height / this.height;
    const newFaces = this.faces.map((face) => {
      const newPoints = face.points.map(([ x, y ]) => {
        return [
          x * scaleX,
          y * scaleY
        ] as [ number, number ];
      });

      return new FaceLandmarks(newPoints);
    });

    return new FaceSwapResult(
      newImage,
      newOverlayImage,
      newFaces,
      this.originalWidth,
      this.originalHeight
    );
  }


  get width() { return this.image.width; }
  get height() { return this.image.height; }
}
