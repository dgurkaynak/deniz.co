import faceapi, { init as initFaceApi } from './face-api';
import FaceSwapper from './face-swapper';
import { loadImage } from './utils';


import denizImagePath from './assets/deniz.jpg';

import { originalImages } from './assets/swaps/index';


const RESIZE_TO = [ 512, 512 ] as [ number, number ];


window.onload = async () => {
  const [ _, denizImage ] = await Promise.all([
    initFaceApi(),
    loadImage(denizImagePath)
  ]);
  const faceSwapper = new FaceSwapper(denizImage);
  await faceSwapper.init();

  for (let imagePath of originalImages) {
    const image = await loadImage(imagePath);
    const result = await faceSwapper.processImage(image);
    const resultResized = await result.resize(...RESIZE_TO);

    const containerEl = document.createElement('div');
    containerEl.style.display = 'flex';
    containerEl.appendChild(resultResized.image);
    containerEl.appendChild(resultResized.overlayImage);
    const textarea = document.createElement('textarea');
    textarea.value = JSON.stringify({
      faces: resultResized.faces,
      originalWidth: resultResized.originalWidth,
      originalHeight: resultResized.originalHeight
    }, null, 4);
    containerEl.appendChild(textarea);

    document.body.appendChild(containerEl);
  }
};
