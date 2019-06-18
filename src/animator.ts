let globalIns: Animator;


export default class Animator {
  private id: number;
  private handler: (time?: number) => void;
  private animateBinded: (time: number) => void;
  private shouldStop = false;
  private isAnimating = false;


  static setGlobal(animator: Animator) {
    globalIns = animator;
  }


  static getGlobal() {
    return globalIns;
  }


  constructor(handler: (time?: number) => void) {
    this.handler = handler;

    this.animateBinded = (time: number) => {
      this.handler(time);
      if (this.shouldStop) {
        this.stop();
      } else {
        this.animate();
      }
    };
  }


  private animate() {
    this.id = requestAnimationFrame(this.animateBinded);
  }


  start(justOneStep = false) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.shouldStop = justOneStep;
    this.animate();
  }


  stop() {
    if (!this.isAnimating) return;
    this.isAnimating = false;
    this.shouldStop = false;
    cancelAnimationFrame(this.id);
  }


  dispose() {
    this.stop();
    this.id = null;
    this.handler = null;
  }
}
