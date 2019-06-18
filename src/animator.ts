let globalIns: Animator;


export default class Animator {
  private id: number;
  private handler: (time?: number) => void;
  private animateBinded: (time: number) => void;
  private stopAfter = 0; // 0 means no-stop, go infinite. If otherwise must be timestamp.
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
      if (this.stopAfter && Date.now() >= this.stopAfter) {
        this.stop();
      } else {
        this.animate();
      }
    };
  }


  private animate() {
    this.id = requestAnimationFrame(this.animateBinded);
  }


  step() {
    this.start(0);
  }


  /**
   * start(-1) => go infinite
   * start(0) => render one-time and then stop
   * start(500) => render for 500ms
   */
  start(duration = -1) {
    if (this.isAnimating) {
      // If duration is set, delay it
      if (this.stopAfter && duration > 0) {
        this.stopAfter = Math.max(Date.now() + duration, this.stopAfter);
      }
      return;
    }

    this.isAnimating = true;
    this.stopAfter = duration == -1 ? 0 : Date.now() + duration;
    this.animate();
  }


  stop() {
    if (!this.isAnimating) return;
    this.isAnimating = false;
    this.stopAfter = 0;
    cancelAnimationFrame(this.id);
  }


  dispose() {
    this.stop();
    this.id = null;
    this.handler = null;
  }
}
