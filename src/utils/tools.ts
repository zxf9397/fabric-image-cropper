import * as CSS from 'csstype';

import { Point } from './point.class';

type PickKey<T, U, K = keyof U | keyof T> = K extends keyof T ? K : never;

type AutoPick<T, U> = {
  [K in PickKey<T, U>]: T[K];
};

interface RectObject {
  left: number;
  top: number;
  width: number;
  height: number;
  angle?: number;
  scaleX?: number;
  scaleY?: number;
}

export function setCSSProperties(element: HTMLElement, styles: CSS.PropertiesHyphen) {
  Object.entries(styles).forEach(([key, val]) => element.style.setProperty(key, val));
}

export function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(num, max));
}

/**
 * Get the intersection of target and source, and merge them into a new target.
 */
export function pick<T, U>(target: T, source: U): AutoPick<T, U> {
  return Object.fromEntries(
    Object.entries(target).map(([key, val]) => {
      const sourceVal = (source as any)[key];

      return [key, sourceVal != null ? sourceVal : val];
    })
  ) as AutoPick<T, U>;
}

export function getCoords(box: RectObject) {
  let { left, top, width, height, angle = 0, scaleX = 1, scaleY = 1 } = box;

  width *= scaleX;
  height *= scaleY;

  const midW = width / 2;
  const midH = height / 2;

  const tl = new Point({ x: left, y: top });

  return {
    tl,
    mt: new Point({ x: midW, y: 0 }).rotate(angle).add(tl),
    tr: new Point({ x: width, y: 0 }).rotate(angle).add(tl),
    mr: new Point({ x: width, y: midH }).rotate(angle).add(tl),
    br: new Point({ x: width, y: height }).rotate(angle).add(tl),
    mb: new Point({ x: midW, y: height }).rotate(angle).add(tl),
    bl: new Point({ x: 0, y: height }).rotate(angle).add(tl),
    ml: new Point({ x: 0, y: midH }).rotate(angle).add(tl),
  };
}

export function getPxNumber(px: string) {
  return +(px.match(/(\d*.?\d*)px/)?.[1] || 0);
}
