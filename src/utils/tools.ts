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

export function createElement<T extends keyof HTMLElementTagNameMap>(param: IElementParam<T>) {
  const element = document.createElement(param.tagName);

  param.classList?.length && element.classList.add(...param.classList);
  param.style && setCSSProperties(element, param.style);

  return element;
}
