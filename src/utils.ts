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


let base64Canvas: HTMLCanvasElement;
export function getBase64OfImage(image: HTMLImageElement) {
  if (!base64Canvas) base64Canvas = document.createElement('canvas');
  const context = base64Canvas.getContext('2d');
  base64Canvas.width = image.width;
  base64Canvas.height = image.height;
  context.clearRect(0, 0, image.width, image.height);
  context.drawImage(image, 0, 0, image.width, image.height);
  return base64Canvas.toDataURL('image/png');
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


export function getBoundingBox(points: [ number, number ][]) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;


  points.forEach(([x, y]) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}


export function getCenter(points: [ number, number ][]) {
  return points.reduce((acc, [x, y]) => {
    return [
      acc[0] + x / points.length,
      acc[1] + y / points.length
    ];
  }, [ 0, 0 ]);
}


export function getDistance(a: [ number, number ], b: [ number, number ]) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}


export function resizePoints(points: [ number, number ][], scale: number): [ number, number ][] {
  const center = getCenter(points);
  return points.map(([x, y]) => {
    const distance = getDistance([x, y], center);
    const newDistance = distance * scale;
    const angle = Math.atan2(y - center[1], x - center[0]);
    return [
      center[0] + newDistance * Math.cos(angle),
      center[1] + newDistance * Math.sin(angle)
    ];
  });
}
