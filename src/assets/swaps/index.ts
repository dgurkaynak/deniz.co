import acdcOriginal from './acdc.original.jpg';
import acdcTexture from './acdc.texture.png';
import acdcOverlay from './acdc.overlay.png';
import apollo11Original from './apollo11.original.jpg';
import apollo11Texture from './apollo11.texture.png';
import apollo11Overlay from './apollo11.overlay.png';
import bsgOriginal from './bsg.original.jpg';
import bsgTexture from './bsg.texture.png';
import bsgOverlay from './bsg.overlay.png';
import friendsOriginal from './friends.original.jpg';
import friendsTexture from './friends.texture.png';
import friendsOverlay from './friends.overlay.png';
import gnrOriginal from './gnr.original.jpeg';
import gnrTexture from './gnr.texture.png';
import gnrOverlay from './gnr.overlay.png';
import hitmanOriginal from './hitman.original.jpg';
import hitmanTexture from './hitman.texture.png';
import hitmanOverlay from './hitman.overlay.png';
import matrixOriginal from './matrix.original.jpg';
import matrixTexture from './matrix.texture.png';
import matrixOverlay from './matrix.overlay.png';
import seinfeldOriginal from './seinfeld.original.jpg';
import seinfeldTexture from './seinfeld.texture.png';
import seinfeldOverlay from './seinfeld.overlay.png';
import shannonOriginal from './shannon.original.jpg';
import shannonTexture from './shannon.texture.png';
import shannonOverlay from './shannon.overlay.png';

import { loadImage } from '../../utils';
import FaceLandmarks from '../../face-landmarks';
import FaceSwapResult from '../../face-swap-result';


export const originalImages: string[] = [
  acdcOriginal,
  apollo11Original,
  bsgOriginal,
  friendsOriginal,
  gnrOriginal,
  hitmanOriginal,
  matrixOriginal,
  seinfeldOriginal,
  shannonOriginal
];



class Swap {
  constructor(
    public texturePath: string,
    public overlayPath: string,
    public metaLoader: () => any,
  ) {}

  async load() {
    const [
      textureImage,
      overlayImage,
      meta
    ] = await Promise.all([
      loadImage(this.texturePath),
      loadImage(this.overlayPath),
      this.metaLoader()
    ]);

    return new FaceSwapResult(
      textureImage,
      overlayImage,
      meta.faces.map((f: any) => new FaceLandmarks(f.points)),
      meta.originalWidth,
      meta.originalHeight
    );
  }
}


export const swaps: Swap[] = [
  new Swap(acdcTexture, acdcOverlay, () => import('./acdc.min.json')),
  new Swap(apollo11Texture, apollo11Overlay, () => import('./apollo11.min.json')),
  new Swap(bsgTexture, bsgOverlay, () => import('./bsg.min.json')),
  new Swap(friendsTexture, friendsOverlay, () => import('./friends.min.json')),
  new Swap(gnrTexture, gnrOverlay, () => import('./gnr.min.json')),
  new Swap(hitmanTexture, hitmanOverlay, () => import('./hitman.min.json')),
  new Swap(matrixTexture, matrixOverlay, () => import('./matrix.min.json')),
  new Swap(seinfeldTexture, seinfeldOverlay, () => import('./seinfeld.min.json')),
  new Swap(shannonTexture, shannonOverlay, () => import('./shannon.min.json'))
];
