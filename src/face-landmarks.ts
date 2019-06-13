import { getBoundingBox } from './utils';

// Just one face!
export default class FaceLandmarks {
  boundingBox: { x: number, y: number, width: number, height: number };


  static createFromFaceApiDetection(detection: {
    landmarks: {
      positions: {
        _x: number,
        _y: number
      }[]
    }
  }) {
    const points = detection.landmarks.positions.map(({ _x, _y }) => [ _x, _y ] as [ number, number ]);
    return new FaceLandmarks(points);
  }


  constructor(public points: [ number, number ][]) {
    this.boundingBox = getBoundingBox(points);
  }


  getBoundaryPath(): [ number, number ][] {
    return [].concat(
      this.points.slice(0, 17),
      this.points.slice(17, 27).reverse()
    );
  }


  getInnerMouthPath() {
    return this.points.slice(60, 68);
  }


  getBoundingBox() {
    return getBoundingBox(this.points);
  }
}
