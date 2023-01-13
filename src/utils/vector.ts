import { IPoint, Point } from './point';

export class Vector {
  start: IPoint;
  end: IPoint;

  constructor(startX: number, startY: number, endX: number, endY: number);
  constructor(start: IPoint, end: IPoint);
  constructor(startOrStartX: IPoint | number, endOrStartY: IPoint | number, endX?: number, endY?: number) {
    if (typeof startOrStartX === 'object' && typeof endOrStartY === 'object') {
      this.start = startOrStartX;
      this.end = endOrStartY;
    } else if (typeof startOrStartX === 'number' && typeof endOrStartY === 'number' && typeof endX === 'number' && typeof endY === 'number') {
      this.start = { x: startOrStartX, y: endOrStartY };
      this.end = { x: endX, y: endY };
    } else {
      throw new Error('Unvalid arguments');
    }
  }

  add() {}

  rotate(degree: number) {
    const end = new Point(this.end).rotate(degree);

    return new Vector(this.start, end);
  }

  transform(x = 0, y = 0) {
    return new Vector(this.start.x + x, this.start.y + y, this.end.x + x, this.end.y + y);
  }
}

const ab = new Vector(0, 0, 1, 0);
const bc = new Vector(1, 0, 1, 1);

const ac = new Vector(0, 0, 1, 1);
