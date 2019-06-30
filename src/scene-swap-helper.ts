import { init as initFaceApi } from './face-api';
import FaceSwapper from './face-swapper';
import { loadImage } from './utils';
import denizImagePath from './assets/deniz.jpg';
import * as loadImageLib from 'blueimp-load-image';



let faceSwapper: FaceSwapper;


export async function init() {
  const [ _, denizImage ] = await Promise.all([
    initFaceApi(),
    loadImage(denizImagePath)
  ]);
  faceSwapper = new FaceSwapper(denizImage);
  await faceSwapper.init();
}


export async function processImage(imageFile: File) {
  const image = await fixOrientationAndLoadImage(imageFile);
  return await faceSwapper.processImage(image);
}


async function fixOrientationAndLoadImage(imageFile: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const loadingImage = loadImageLib(imageFile, (img: any, metadata: any) => {
      if (img.type == 'error') {
        reject(img);
      } else {
        resolve(img);
      }
    }, { orientation: true, maxWidth: 1024 });

    // If loadImage lib is not supported, fallback to normal usage
    if (!loadingImage) {
      const url = URL.createObjectURL(imageFile);
      resolve(loadImage(url));
    }
  });

}
