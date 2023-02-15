import type { IElementParam } from '../data';
import type { IControlType, ICornerControlType, IMiddleControlType } from '../controls/data';

import { setCSSProperties } from './tools';
import { DEFAULT_CORNER } from '../const';

const SVG_NS = 'http://www.w3.org/2000/svg';

function createCornerPath(d: string, stroke: string, strokeWidth: number) {
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', `${stroke}`);
  path.setAttribute('stroke-width', `${strokeWidth}`);
  path.setAttribute('stroke-linecap', `round`);
  path.setAttribute('stroke-linejoin', `round`);
  return path;
}

function createCornerSVG() {
  const { width, height, lineWidth, lineLength, strokeWidth, fill, stroke } = DEFAULT_CORNER;

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', `${width}`);
  svg.setAttribute('height', `${height}`);
  svg.setAttribute('style', `display: block`);

  const { x, y } = { x: width / 2, y: height / 2 };
  const d = `M${x} ${y + lineLength} V${y} H${x + lineLength}`;

  const strokePath = createCornerPath(d, stroke, lineWidth + strokeWidth);
  const fillPath = createCornerPath(d, fill, lineWidth);

  svg.append(strokePath, fillPath);
  return { svg, strokePath, fillPath };
}

export const ScaleMapList: Readonly<string[]> = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne', 'e'];

export function createElement<T extends keyof HTMLElementTagNameMap>(tagName: T, param?: IElementParam<T>) {
  const element = document.createElement(tagName);

  if (param?.classList?.length) {
    element.classList.add(...param.classList.filter((item) => !!item));
  }

  if (param?.className) {
    element.classList.add(param.className);
  }

  param?.style && setCSSProperties(element, param.style);

  return element;
}

const ControlClassMap: Record<IControlType, string> = {
  tl: 'ic-corner-ctrl',
  mt: 'ic-middle-ctrl',
  tr: 'ic-corner-ctrl',
  mr: 'ic-middle-ctrl',
  br: 'ic-corner-ctrl',
  mb: 'ic-middle-ctrl',
  bl: 'ic-corner-ctrl',
  ml: 'ic-middle-ctrl',
};

export function createCornerCtrlEl(corner: ICornerControlType) {
  return () => {
    const element = createElement('div', { className: ControlClassMap[corner] });
    const { svg } = createCornerSVG();
    element.appendChild(svg);
    return element;
  };
}

export function createMiddleCtrlEl(corner: IMiddleControlType) {
  return () => {
    return createElement('div', { className: ControlClassMap[corner] });
  };
}
