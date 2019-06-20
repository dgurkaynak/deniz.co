// Derived from:
// https://github.com/tart/tartJS/blob/master/tart/events/GestureHandler.js


let globalIns: GestureHandler;


interface Touch {
  timestamp: number;
  x: number;
  y: number;
};


export default class GestureHandler {
  static getSingleton() {
    return globalIns;
  }


  static setSingleton(ins: GestureHandler) {
    globalIns = ins;
  }


  readonly element: Element;
  onTouchStart: (e: TouchEvent) => void = () => {};
  onTouchMove: (e: TouchEvent) => void = () => {};
  onTouchEnd: (e: TouchEvent) => void = () => {};
  onTap: (coordinates: { x: number, y: number }) => void = () => {};
  onThrow: () => void = () => {};

  private canTap = true;
  private touchStartTime: number;
  private touchStartX: number;
  private touchStartY: number;
  private latestTouches: Touch[] = [];



  constructor(element: Element) {
    this.element = element;

    this.element.addEventListener('touchstart', (e: TouchEvent) => this._onTouchStart(e), false);
    this.element.addEventListener('touchmove', (e: TouchEvent) => this._onTouchMove(e), false);
    this.element.addEventListener('touchend', (e: TouchEvent) => this._onTouchEnd(e), false);
  }


  private _onTouchStart(e: TouchEvent) {
    this.canTap = true;
    this.touchStartTime = e.timeStamp;
    const changedTouch = e.changedTouches[0];
    this.touchStartX = changedTouch.pageX;
    this.touchStartY = changedTouch.pageY;

    this.onTouchStart(e);
  }


  private _onTouchMove(e: TouchEvent) {
    const changedTouch = e.changedTouches[0];
    const touch = {
      timestamp: e.timeStamp,
      x: changedTouch.pageX,
      y: changedTouch.pageY
    };
    this.latestTouches.push(touch);
    if (this.latestTouches.length > 5) {
      this.latestTouches.shift();
    }

    if (
      this.canTap &&
      (Math.abs(changedTouch.pageX - this.touchStartX) > 20 ||
      Math.abs(changedTouch.pageY - this.touchStartY) > 20)
    ) {
      this.canTap = false;
    }

    this.onTouchMove(e);
  }


  private _onTouchEnd(e: TouchEvent) {
    const changedTouch = e.changedTouches[0];
    // `changedTouch` coordinates are alway same with the last one, but timeStamp is different

    if (this.canTap) {
      if ((Math.abs(changedTouch.pageX - this.touchStartX) <= 20 &&
        Math.abs(changedTouch.pageY - this.touchStartY) <= 20)) {
        const tapTime = e.timeStamp - this.touchStartTime;
        if (tapTime > 800) {
          // TODO: Long tap
        } else {
          this.onTap({ x: changedTouch.pageX, y: changedTouch.pageY });
        }
      }
    }

    const minTimestamp = e.timeStamp - 250;
    const recentTouches = this.latestTouches.filter(t => t.timestamp >= minTimestamp);
    if (recentTouches.length > 1) { // 1 is not enough to calculate velocity because coorinates are same
      const referenceTouch = recentTouches[recentTouches.length - 2];
      const deltaX = changedTouch.pageX - referenceTouch.x;
      const deltaY = changedTouch.pageY - referenceTouch.y;
      const deltaTime = e.timeStamp - referenceTouch.timestamp;
      const velocity = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)) / deltaTime; // px/ms

      if (velocity >= 0.5) {
        // TODO: Throw
      }
    }

    this.onTouchEnd(e);
  }
}
