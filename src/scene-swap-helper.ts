import { init as initFaceApi } from './face-api';
import FaceSwapper from './face-swapper';
import { loadImage, getBase64OfImage } from './utils';
import denizImagePath from './assets/deniz.jpg';


let faceSwapper: FaceSwapper;


export async function init() {
  const [ _, denizImage ] = await Promise.all([
    initFaceApi(),
    loadImage(denizImagePath)
  ]);
  faceSwapper = new FaceSwapper(denizImage);
  await faceSwapper.init();
}


export async function processImage(url: string) {
  const image = await loadImage(url);
  return await faceSwapper.processImage(image);
}
