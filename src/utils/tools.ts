import * as CSS from 'csstype';
import { IElementParam } from '../data.d';
import { Point } from './point.class';
import { Control } from '../controls/controls.class';

export function setCSSProperties(element: HTMLElement, styles: CSS.PropertiesHyphen) {
  Object.entries(styles).forEach(([key, val]) => element.style.setProperty(key, val));
}

export function findCornerQuadrant(angle: number, control: Control) {
  const cornerAngle = angle + Math.atan2(control.y, control.x) / (Math.PI / 180) + 360;
  return Math.round((cornerAngle % 360) / 45);
}

export function createElement<T extends keyof HTMLElementTagNameMap>(tagName: T, param?: IElementParam<T>) {
  const element = document.createElement(tagName);

  param?.classList?.length && element.classList.add(...param.classList);
  param?.style && setCSSProperties(element, param.style);

  return element;
}

export function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(num, max));
}

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
}

export function getCoords(box: Box) {
  const { left, top, width, height, angle } = box;
  const midW = width / 2,
    midH = height / 2;

  const tl = new Point({ x: left, y: top });
  return {
    tl: tl,
    mt: new Point({ x: midW, y: 0 }).rotate(angle).add(tl),
    tr: new Point({ x: width, y: 0 }).rotate(angle).add(tl),
    mr: new Point({ x: width, y: midH }).rotate(angle).add(tl),
    br: new Point({ x: width, y: height }).rotate(angle).add(tl),
    mb: new Point({ x: midW, y: height }).rotate(angle).add(tl),
    bl: new Point({ x: 0, y: height }).rotate(angle).add(tl),
    ml: new Point({ x: 0, y: midH }).rotate(angle).add(tl),
  };
}
