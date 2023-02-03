import { Control } from './controls.class';
import { createCropCorner, createCropXoYCorner, scaleMap } from './element';
import { CSSTransform } from '../utils/cssTransform.class';
import { createElement, findCornerQuadrant, setCSSProperties } from '../utils/tools';

import type { IControlType } from './data';
import type { ICropData, ISourceData } from '../cropper/data';

export class SourceRenderer {
  public elements!: {
    root: HTMLDivElement;
    image: HTMLImageElement;
    lower: HTMLDivElement;
    upper: HTMLDivElement;
    border: HTMLDivElement;
  };

  get element() {
    return this.elements.root;
  }

  controls = {
    tl: new Control({ x: -1, y: -1, angle: 0, createElement: createCropCorner('tl'), actionName: 'scale' }),
    tr: new Control({ x: 1, y: -1, angle: 90, createElement: createCropCorner('tr'), actionName: 'scale' }),
    br: new Control({ x: 1, y: 1, angle: 180, createElement: createCropCorner('br'), actionName: 'scale' }),
    bl: new Control({ x: -1, y: 1, angle: 270, createElement: createCropCorner('bl'), actionName: 'scale' }),
    ml: new Control({ visible: false, x: -1, y: 0, angle: 90, createElement: createCropXoYCorner('ml'), actionName: 'scale' }),
    mr: new Control({ visible: false, x: 1, y: 0, angle: 90, createElement: createCropXoYCorner('mr'), actionName: 'scale' }),
    mt: new Control({ visible: false, x: 0, y: -1, angle: 0, createElement: createCropXoYCorner('mt'), actionName: 'scale' }),
    mb: new Control({ visible: false, x: 0, y: 1, angle: 0, createElement: createCropXoYCorner('mb'), actionName: 'scale' }),
  };

  private imageLoad = () => {};
  private imageError = (e: ErrorEvent) => {};
  private onImageLoad = () => this.imageLoad();
  private onImageError = (e: ErrorEvent) => this.imageError(e);

  constructor() {
    this.elements = this.createElement();
  }

  private createElement() {
    const root = createElement('div', { classList: ['image-cropper-source'] });

    const lower = createElement('div', { classList: ['fcd-lower-box'] });
    const image = createElement('img', { classList: ['fcd-lower-image'] });
    image.addEventListener('load', this.onImageLoad);
    image.addEventListener('error', this.onImageError);
    lower.appendChild(image);

    const upper = createElement('div', { classList: ['fcc-upper-box'] });
    const border = createElement('div', { classList: ['fcc-upper-box-border'] });
    upper.appendChild(border);

    for (const key in this.controls) {
      const corner = this.controls[key as IControlType]?.element;
      if (corner) {
        corner.setAttribute('data-scale-corner', key);
        upper.appendChild(corner);
      }
    }

    root.append(lower, upper);

    return { root, image, lower, upper, border };
  }

  render = async (src: string, cropData: ICropData, sourceData: ISourceData) => {
    this.elements.image.src = src;
    this.elements.upper.setAttribute('data-action-cursor', 'move');
    this.elements.upper.setAttribute('data-action-name', 'move');

    await new Promise<void>((resolve, reject) => {
      this.imageLoad = resolve;
      this.imageError = reject;
    });

    setCSSProperties(this.elements.root, {
      width: `${sourceData.width}px`,
      height: `${sourceData.height}px`,
      transform: `matrix(${cropData.scaleX}, 0, 0, ${cropData.scaleY}, ${sourceData.left}, ${sourceData.top}) rotate(${cropData.angle}deg)`,
    });

    setCSSProperties(this.elements.upper, {
      width: `${sourceData.width * cropData.scaleX}px`,
      height: `${sourceData.height * cropData.scaleY}px`,
      transform: new CSSTransform().scaleX(1 / cropData.scaleX).scaleY(1 / cropData.scaleY).value,
    });

    Object.entries(this.controls).forEach(([corner, control]) => {
      control.cursorStyle = scaleMap[findCornerQuadrant(cropData.angle, control)] + '-resize';
      control.element?.setAttribute('data-action-cursor', control.cursorStyle);
      control.render();
    });
  };
}
