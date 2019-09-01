# [deniz.co](https://deniz.co)

My personal website which features face-swapping, perfomed completely in (modern-)browser-side, with some 3d glitchy transition animation.

[![Mouseover face-swapping demo](./demo-armstrong.gif)](https://deniz.co)

You can also drag & drop any face-image to try yourself.

## Build & Running

- Clone this repo
- `npm i` to install dependencies
- `npm start` to start development server
- `npm run build` to build in production mode

### Note to Self: Preprocessing face-swaps

- `npm run start:preprocessor` to start preprocessor application
- Drag & drop any face image to perform a face-swap
- Download as a zip file
- Put them under `src/assets/preprocessed` folder
- Run `./scripts/convert-proprocessed-base.png-to-jpg.sh` script to convert preprocessed image format from png to jpg
- Optimize newly added images with `ImageOptim`
