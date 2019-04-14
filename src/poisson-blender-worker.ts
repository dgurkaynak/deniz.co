const EPS = 1.0E-08;

onmessage = (event) => {
  const x: number = event.data.x;
  const y: number = event.data.y;
  const width: number = event.data.width;
  const height: number = event.data.height;
  const iteration: number = event.data.iteration;
  const sourceImageDataBuffer: ArrayBuffer = event.data.sourceImageDataBuffer;
  const destinationImageDataBuffer: ArrayBuffer = event.data.destinationImageDataBuffer;
  const maskImageDataBuffer: ArrayBuffer = event.data.maskImageDataBuffer;

  const sourceImageData = new Uint8ClampedArray(sourceImageDataBuffer);
  const destinationImageData = new Uint8ClampedArray(destinationImageDataBuffer);
  const maskImageData = new Uint8ClampedArray(maskImageDataBuffer);
  const resultImageData = new Uint8ClampedArray(destinationImageData);

  blend(sourceImageData, destinationImageData, maskImageData, resultImageData, width, height, iteration);
  postMessage({ x, y, width, height, resultImageDataBuffer: resultImageData.buffer }, [resultImageData.buffer] as any);
};


function blend(
  sourceImageData: Uint8ClampedArray,
  destinationImageData: Uint8ClampedArray,
  maskImageData: Uint8ClampedArray,
  resultImageData: Uint8ClampedArray,
  width: number,
  height: number,
  iteration = 10
) {
  let edge = false;
  let error = 0;
  let sumf = [0, 0, 0];
  let sumfstar = [0, 0, 0];
  let sumvq = [0, 0, 0];
  const fp = [];
  const fq = [];
  const gp = [];
  const gq = [];
  const subf = [];
  const subg = [];
  let naddr = [];
  const threshold = 128;
  let terminate = [];
  let step: number;
  let l: number;
  let m: number;

  for (let i = 0; i < iteration; i++) {
    terminate = [true, true, true];



    for (let y = 1; y < height - 1; y++) {
      step = y * width << 2;

      for (let x = 1; x < width - 1; x++) {
        l = step + (x << 2);
        m = 0;
        naddr = [l - (width << 2), l - 4, l + 4, l + (width << 2)];

        if (maskImageData[l] > threshold) {
          sumf = [0.0, 0.0, 0.0];
          sumfstar = [0.0, 0.0, 0.0];
          sumvq = [0.0, 0.0, 0.0];
          edge = false;

          for (let n = 0; n < 4; n++) {
            if (maskImageData[naddr[n]] <= threshold) {
              edge = true;
              break;
            }
          }

          if (!edge) {
            if (y >= 0 && x >= 0 && y < height && x < width) {
              for (let n = 0; n < 4; n++) {
                for (let c = 0; c < 3; c++) {
                  sumf[c] += resultImageData[naddr[n] + m + c];
                  sumvq[c] += sourceImageData[l + c] - sourceImageData[naddr[n] + c];
                }
              }
            }
          } else {
            if (y >= 0 && x >= 0 && y < height && x < width) {
              fp[0] = destinationImageData[l + m];
              fp[1] = destinationImageData[l + m + 1];
              fp[2] = destinationImageData[l + m + 2];
              gp[0] = sourceImageData[l];
              gp[1] = sourceImageData[l + 1];
              gp[2] = sourceImageData[l + 2];
              for (let n = 0; n < 4; n++) {
                for (let c = 0; c < 3; c++) {
                  fq[c] = destinationImageData[naddr[n] + m + c];
                  // modification : we ignore pixels outside face mask, since these cause artifacts
                  // gq[c] = blendingImageData[naddr[n] + c];
                  gq[c] = sourceImageData[l + c];
                  sumfstar[c] += fq[c];
                  subf[c] = fp[c] - fq[c];
                  subf[c] = subf[c] > 0 ? subf[c] : -subf[c];
                  subg[c] = gp[c] - gq[c];
                  subg[c] = subg[c] > 0 ? subg[c] : -subg[c];
                  if (subf[c] > subg[c]) {
                    sumvq[c] += subf[c];
                  } else {
                    sumvq[c] += subg[c];
                  }
                }
              }
            }
          }

          for (let c = 0; c < 3; c++) {
            fp[c] = (sumf[c] + sumfstar[c] + sumvq[c]) * 0.25; // division 4
            error = Math.floor(fp[c] - resultImageData[l + m + c]);
            error = error > 0 ? error : -error;
            if (terminate[c] && error > EPS * (1 + (fp[c] > 0 ? fp[c] : -fp[c]))) {
              terminate[c] = false;
            }
            resultImageData[l + m + c] = fp[c];
          }

        } // mask if
      } // x loop end
    } // y loop end


    if (terminate[0] && terminate[1] && terminate[2]) break;
  } // iteration loop

  return resultImageData;
}
