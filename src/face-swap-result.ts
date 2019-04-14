import FaceLandmarks from './face-landmarks';
import { resizeImage } from './utils';


export default class FaceSwapResult {
  constructor(
    public image: HTMLImageElement,
    public overlayImage: HTMLImageElement,
    public faces: FaceLandmarks[],
    public originalWidth?: number,
    public originalHeight?: number
  ) {
    this.originalWidth = originalWidth || image.width;
    this.originalHeight = originalHeight || image.height;
  }


  async resize(width: number, height: number) {
    // We cannot parallelize these because of global cached canvas :/
    const newImage = await resizeImage(this.image, width, height);
    const newOverlayImage = await resizeImage(this.overlayImage, width, height);

    const scaleX = width / this.image.width;
    const scaleY = height / this.image.height;
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
}
