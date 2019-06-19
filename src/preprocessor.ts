import faceapi, { init as initFaceApi } from './face-api';
import FaceSwapper from './face-swapper';
import { loadImage, getBase64OfImage } from './utils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import denizImagePath from './assets/deniz.jpg';


const RESIZE_TO = [ 512, 1024, 1536, 2048 ]; // Must be ordered
const DECIMAL_DIGIT_COUNT = 1;
const PRETTY_PRINT_JSON = false;

const messageElement = document.createElement('div');
messageElement.textContent = 'Initializing...';
messageElement.style.position = 'fixed';
messageElement.style.top = '0';
messageElement.style.left = '0';
messageElement.style.padding = '5px';
messageElement.style.zIndex = '1';
messageElement.style.background = '#fff';

const downloadZipButton = document.createElement('button');
downloadZipButton.textContent = 'Download ZIP';
downloadZipButton.style.position = 'fixed';
downloadZipButton.style.top = '0';
downloadZipButton.style.right = '0';
downloadZipButton.style.margin = '5px';
downloadZipButton.style.zIndex = '1';
downloadZipButton.addEventListener('click', onDownloadZipButtonClick, false);

let faceSwapper: FaceSwapper;
const zip = new JSZip();


async function main() {
  // Show wait message
  document.body.appendChild(messageElement);

  // Show download button
  document.body.appendChild(downloadZipButton);

  // Make body height 100%, so we can catch all the drag & drop events
  document.documentElement.style.height = '100%';
  document.body.style.height = '100%';

  // Listen for drag & drop events
  document.body.addEventListener('drop', onDrop);
  document.body.addEventListener('dragover', onDragOver);

  const [ _, denizImage ] = await Promise.all([
    initFaceApi(),
    loadImage(denizImagePath)
  ]);
  faceSwapper = new FaceSwapper(denizImage);
  await faceSwapper.init();

  // Show ready message
  messageElement.textContent = 'Ready, drag and drop images here';
};


async function processImages(images: { name: string, url: string }[]) {
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    await processImage(image.name, image.url);
  }
}


async function processImage(name: string, url: string) {
  messageElement.textContent = `Processing ${name}...`;

  const image = await loadImage(url);
  const result = await faceSwapper.processImage(image);
  const zipImageFolder = zip.folder(name.split('.')[0]);

  // If original image size is, let's say 1280x1280,
  // Export textures for 512, 1024 and 1536
  const targetSizes = RESIZE_TO.filter((size, index) => {
    if (image.width > size || image.height > size) {
      return true;
    }

    const previousSize = RESIZE_TO[index - 1];
    if (image.width > previousSize || image.height > previousSize) {
      return true;
    }

    return false;
  });

  for (let i = 0; i < targetSizes.length; i++) {
    const size = targetSizes[i];
    messageElement.textContent = `Processing ${name}... (${size}x${size})`;

    const zipImageSizeFolder = zipImageFolder.folder(`${size}x${size}`);
    const resultResized = await result.resize(size, size);
    const baseImageBase64 = getBase64OfImage(resultResized.image).replace('data:image/png;base64,', '');
    const overlayImageBase64 = getBase64OfImage(resultResized.overlayImage).replace('data:image/png;base64,', '');
    zipImageSizeFolder.file('base.png', baseImageBase64, { base64: true });
    zipImageSizeFolder.file('overlay.png', overlayImageBase64, { base64: true });

    const data = {
      faces: resultResized.faces,
      originalWidth: resultResized.originalWidth,
      originalHeight: resultResized.originalHeight
    };

    data.faces = data.faces.map((face) => {
      return {
        points: face.points.map(([x, y]) => {
          return [
            parseFloat(x.toFixed(DECIMAL_DIGIT_COUNT)),
            parseFloat(y.toFixed(DECIMAL_DIGIT_COUNT))
          ];
        })
      };
    }) as any;

    zipImageSizeFolder.file('data.json', PRETTY_PRINT_JSON ? JSON.stringify(data, null, 4) : JSON.stringify(data));
  }

  const containerEl = document.createElement('div');
  containerEl.style.width = `${result.image.width}px`;
  containerEl.style.height = `${result.image.height}px`;
  result.image.style.position = 'absolute';
  result.overlayImage.style.position = 'absolute';
  containerEl.appendChild(result.image);
  containerEl.appendChild(result.overlayImage);
  document.body.appendChild(containerEl);

  messageElement.textContent = `Done: ${name}`;
}


async function onDownloadZipButtonClick() {
  messageElement.textContent = `Generating zip file...`;
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'preprocessed.zip');
  messageElement.textContent = `Done`;
}


async function onDrop(event: DragEvent) {
  // Prevent default behavior (Prevent file from being opened)
  event.preventDefault();

  if (event.dataTransfer.items) {
    const images: { name: string, url: string }[] = [];
    // Use DataTransferItemList interface to access the file(s)
    for (let i = 0; i < event.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (event.dataTransfer.items[i].kind === 'file') {
        const file = event.dataTransfer.items[i].getAsFile();
        if (file.type.split('/')[0] == 'image') {
          images.push({
            name: file.name,
            url: URL.createObjectURL(file)
          });
        }
      }
    }

    processImages(images);
  } else {
    messageElement.textContent = 'Your browser is not supported bro, try latest Chrome'
  }
}


function onDragOver(event: DragEvent) {
  // Prevent default behavior (Prevent file from being opened)
  event.preventDefault();
}


window.onload = main;
