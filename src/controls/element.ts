import { CornerType, MiddleCornerType, RightAngleCornerType } from '../data';
import { createElement } from '../utils/tools';

export const scaleMap = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne', 'e'];

function createRightAngleSVG() {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(SVG_NS, 'svg');

  svg.setAttribute('viewBox', `0 0 32 32`);
  svg.setAttribute('width', `32`);
  svg.setAttribute('height', `32`);
  svg.setAttribute('style', `display: block`);

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

const cornerStyleMap: Record<CornerType, { classList: string[] }> = {
  tl: { classList: ['ra-corner', 'tl'] },
  mt: { classList: ['md-corner', 'mt'] },
  tr: { classList: ['ra-corner', 'tr'] },
  mr: { classList: ['md-corner', 'mr'] },
  br: { classList: ['ra-corner', 'br'] },
  mb: { classList: ['md-corner', 'mb'] },
  bl: { classList: ['ra-corner', 'bl'] },
  ml: { classList: ['md-corner', 'ml'] },
};

export function createCropCorner(corner: RightAngleCornerType) {
  return () => {
    const element = createElement('div', { classList: cornerStyleMap[corner].classList });
    element.appendChild(createRightAngleSVG());
    return element;
  };
}

export function createSourceCorner() {}

export function createCropXoYCorner(corner: MiddleCornerType) {
  return () => {
    return createElement('div', { classList: cornerStyleMap[corner].classList });
  };
}

interface VElement {
  tag?: keyof HTMLElementTagNameMap;
  className?: string;
  children?: VElement[];
}

const vTree: VElement = {
  className: 'image-cropper-container',
  children: [
    {
      className: 'image-cropper-source',
      children: [
        {
          className: 'fcd-lower-box',
          children: [{ tag: 'img', className: 'fcd-lower-image' }],
        },
        {
          className: 'fcc-upper-box',
          children: [
            { className: 'fcc-upper-box-border' },
            { className: 'ra-corner' },
            { className: 'ra-corner' },
            { className: 'ra-corner' },
            { className: 'ra-corner' },
            { className: 'md-corner' },
            { className: 'md-corner' },
            { className: 'md-corner' },
            { className: 'md-corner' },
          ],
        },
      ],
    },
    {
      className: 'image-cropper-crop',
      children: [
        {
          className: 'fcd-lower-box',
          children: [{ tag: 'img', className: 'lower-crop-image' }],
        },
        {
          className: 'fcc-upper-box',
          children: [
            { className: 'fcc-upper-box-border' },
            { className: 'ra-corner' },
            { className: 'ra-corner' },
            { className: 'ra-corner' },
            { className: 'ra-corner' },
            { className: 'md-corner' },
            { className: 'md-corner' },
            { className: 'md-corner' },
            { className: 'md-corner' },
          ],
        },
      ],
    },
  ],
};
