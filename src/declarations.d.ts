declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.svg'
declare module '*.gif'
declare module '*.json'
declare module '*.weights'
declare module 'face-api.js'
declare module 'body-scroll-lock'
declare module 'baffle'
declare module 'blueimp-load-image'
declare module 'detect-it'

declare module '*/poisson-blender-worker' {
  class PoissonBlenderWorker extends Worker {
    constructor();
  }

  export = PoissonBlenderWorker;
}
