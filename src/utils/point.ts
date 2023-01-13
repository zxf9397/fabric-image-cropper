import { cosByDegree, degreeWithin0to360, sinByDegree } from './math';
import { degreesToRadians } from './tools';

export interface IPoint {
  x: number;
  y: number;
}

export class Point implements IPoint {
  x = 0;
  y = 0;

  constructor();
  constructor(point: IPoint);
  constructor(x: number, y: number);
  constructor(xOrPoint: number | IPoint = 0, y = 0) {
    if (typeof xOrPoint === 'object') {
      this.x = xOrPoint.x;
      this.y = xOrPoint.y;
    } else {
      this.x = xOrPoint;
      this.y = y;
    }
  }

  add(point: IPoint) {
    return new Point(this.x + point.x, this.y + point.y);
  }

  subtract(point: IPoint) {
    return new Point(this.x - point.x, this.y - point.y);
  }

  multiply(point: IPoint) {
    return new Point(this.x * point.x, this.y * point.y);
  }

  divide(point: IPoint) {
    return new Point(this.x / point.x, this.y / point.y);
  }

  interpolate(point: IPoint, interpolation = 0.5) {
    interpolation = Math.max(Math.min(1, interpolation), 0);
    return new Point(this.x + (point.x - this.x) * interpolation, this.y + (point.y - this.y) * interpolation);
  }

  flipX() {
    return new Point(-this.x, this.y);
  }

  flipY() {
    return new Point(this.x, -this.y);
  }

  distanceFrom(point: IPoint = originZero) {
    const dx = this.x - point.x,
      dy = this.y - point.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  midPointFrom(point: IPoint) {
    return this.interpolate(point);
  }

  rotate(degree: number, origin: IPoint = originZero) {
    degree = degreeWithin0to360(degree);

    const sin = sinByDegree(degree);
    const cos = cosByDegree(degree);

    const p = this.subtract(origin);
    return new Point(p.x * cos - p.y * sin, p.x * sin + p.y * cos).add(origin);
  }

  convertSystem(degree: number, origin: IPoint = originZero) {
    degree = degreeWithin0to360(degree);

    const sin = sinByDegree(degree);
    const cos = cosByDegree(degree);

    const x = this.x * cos - this.y * sin;
    const y = this.x * sin + this.y * cos;

    return new Point(x, y).add(origin);
  }
}

const originZero = new Point(0, 0);
