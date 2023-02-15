import type { Control } from '../components/control.class';

type AngleType = 'degree' | 'radian';

export const PiDivBy180 = Math.PI / 180;

export const degree2Radian = (degree: number) => degree * PiDivBy180;

export const radian2Degree = (radian: number) => radian / PiDivBy180;

export const degreeWithin0to360 = (degree: number) => {
  degree = degree % 360;
  return Math.sign(degree) < 0 ? degree + 360 : degree;
};

export const sinByDegree = (degree: number) => {
  switch (degree) {
    case 0:
    case 180:
      return 0;
    case 90:
      return 1;
    case 270:
      return -1;
    default:
      return Math.sin(degree2Radian(degree));
  }
};

export const cosByDegree = (degree: number) => {
  switch (degree) {
    case 0:
      return 1;
    case 180:
      return -1;
    case 90:
    case 270:
      return 0;
    default:
      return Math.cos(degree2Radian(degree));
  }
};

export function findCornerQuadrant(angle: number, control: Control) {
  const cornerAngle = angle + Math.atan2(control.y, control.x) / (Math.PI / 180) + 360;
  return Math.round((cornerAngle % 360) / 45);
}

export class Angle {
  private _degree = 0;
  private _radian = 0;
  private _sin = 0;
  private _cos = 0;

  public get degree() {
    return this._degree;
  }

  public get radian() {
    return this._radian;
  }

  public get sin() {
    return this._sin;
  }

  public get cos() {
    return this._cos;
  }

  constructor(angle: number, type: AngleType = 'degree') {
    this.set(angle, type);
  }

  public set(angle: number, type: AngleType = 'degree') {
    if (type === 'radian') {
      this._radian = angle;
      this._degree = radian2Degree(angle);
    } else {
      this._degree = angle;
      this._radian = degree2Radian(angle);
    }

    const deg = degreeWithin0to360(this._degree);
    this._sin = sinByDegree(deg);
    this._cos = cosByDegree(deg);
  }
}
