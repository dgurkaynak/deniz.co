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
