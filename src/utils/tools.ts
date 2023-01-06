import { fabric } from 'fabric';
import * as CSS from 'csstype';
import { IElementParam } from '../data.d';

export function setCSSProperties(element: HTMLElement, styles: CSS.PropertiesHyphen) {
  Object.entries(styles).forEach(([key, val]) => element.style.setProperty(key, val));
}

export function findCornerQuadrant(fabricObject: fabric.Object, control: fabric.Control) {
  const angle = fabricObject.angle || 0;

  const cornerAngle = angle + Math.atan2(control.y, control.x) / (Math.PI / 180) + 360;
  return Math.round((cornerAngle % 360) / 45);
}

export function createCornerSVG() {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(SVG_NS, 'svg');

  svg.setAttribute('viewBox', `0 0 32 32`);
  svg.setAttribute('width', `32`);
  svg.setAttribute('height', `32`);

  const path = document.createElementNS(SVG_NS, 'path');

  path.setAttribute('d', `M16 24 V16 H24`);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#fff');
  path.setAttribute('stroke-width', `4`);
  path.setAttribute('stroke-linecap', `round`);
  path.setAttribute('stroke-linejoin', `round`);
  path.setAttribute('filter', 'drop-shadow(0 0 2px rgba(37, 43, 49, 0.75))');

  svg.appendChild(path);

  return svg;
}

export function createElement<T extends keyof HTMLElementTagNameMap>(tagName: T, param?: IElementParam<T>) {
  const element = document.createElement(tagName);

  param?.classList?.length && element.classList.add(...param.classList);
  param?.style && setCSSProperties(element, param.style);

  return element;
}

export interface Point {
  x: number;
  y: number;
}

export interface LinearFunction {
  K: number;
  B: number;
  y(x: number): number;
  x(y: number): number;
}

export function createLinearFunction(p1: Point, p2: Point): Readonly<LinearFunction> {
  if (p1.y === p2.y) {
    const y = p1.y;
    return {
      K: 0,
      B: y,
      y: () => y,
      x: (x: number) => x,
    };
  }

  if (p1.x === p2.x) {
    const x = p1.x;
    return {
      K: Infinity,
      B: Infinity,
      y: (y: number) => y,
      x: () => x,
    };
  }

  const K = (p1.y - p2.y) / (p1.x - p2.x);
  const B = p1.y - K * p1.x;
  return {
    K,
    B,
    y: (x: number) => K * x + B,
    x: (y: number) => (y - B) / K,
  };
}

export function pedalPoint(point: fabric.IPoint, linear: LinearFunction): fabric.IPoint {
  if (linear.K === Infinity) {
    return { x: linear.x(0), y: point.y };
  }

  if (linear.K === 0) {
    return { x: point.x, y: linear.y(0) };
  }

  const x = (point.x + linear.K * point.y - linear.K * linear.B) / (linear.K * linear.K + 1);
  const y = (linear.K * linear.K * point.y + linear.K * point.x + linear.B) / (linear.K * linear.K + 1);
  return { x, y };
}

export function convertXYSystem(point: Point, rotate: number, origin?: Point) {
  const radians = degreesToRadians(rotate);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const x = point.x * cos - point.y * sin + (origin?.x || 0);
  const y = point.x * sin + point.y * cos + (origin?.y || 0);

  return { x, y };
}

export function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}
