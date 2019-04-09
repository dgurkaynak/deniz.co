export async function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();

  return new Promise((resolve, reject) => {
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}


let readImageDataCanvas: HTMLCanvasElement;
export function readImageData(image: HTMLImageElement, offsetX = 0, offsetY = 0, width?: number, height?: number) {
  if (!readImageDataCanvas) readImageDataCanvas = document.createElement('canvas');
  const context = readImageDataCanvas.getContext('2d');
  readImageDataCanvas.width = image.width;
  readImageDataCanvas.height = image.height;
  context.clearRect(0, 0, image.width, image.height);
  width = width || image.width;
  height = height || image.height;
  context.drawImage(image, 0, 0);
  return context.getImageData(offsetX, offsetY, width, height);
}


let resizeImageDataCanvas: HTMLCanvasElement;
export async function resizeImage(image: HTMLImageElement, width?: number, height?: number): Promise<HTMLImageElement> {
  if (!resizeImageDataCanvas) resizeImageDataCanvas = document.createElement('canvas');
  const context = resizeImageDataCanvas.getContext('2d');
  width = width || image.width;
  height = height || image.height;
  resizeImageDataCanvas.width = width;
  resizeImageDataCanvas.height = height;
  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const newImage = new Image();
  const url = await canvasToURL(resizeImageDataCanvas);

  return new Promise((resolve, reject) => {
    newImage.onload = () => resolve(newImage);
    newImage.onerror = reject;
    newImage.src = url;
  });
}


export async function toBlobAsync(canvas: HTMLCanvasElement, ...args: any[]): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Polyfill
    if (!canvas.toBlob) {
      const dataString = canvas.toDataURL('image/png');
      resolve(dataURIToBlob(dataString));
      return;
    }

    try {
      canvas.toBlob(resolve, ...args);
    } catch (err) {
      reject(err);
    }
  });
}


export async function canvasToURL(canvas: HTMLCanvasElement) {
  const blob = await toBlobAsync(canvas);
  return URL.createObjectURL(blob);
}


// https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob#Polyfill
export function dataURIToBlob(dataURI: string) {
  const binStr = atob(dataURI.split(',')[1]);
  const arr = new Uint8Array(binStr.length);

  for (let i = 0; i < binStr.length; i++) {
    arr[i] = binStr.charCodeAt(i);
  }

  return new Blob([arr]);
}
