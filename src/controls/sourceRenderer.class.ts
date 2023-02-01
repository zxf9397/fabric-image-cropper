import { Control } from './controls.class';
import { createCropCorner, createCropXoYCorner, scaleMap } from './element';
import { CSSTransform } from '../utils/cssTransform.class';
import { createElement, findCornerQuadrant, setCSSProperties } from '../utils/tools';

import type { IControls, IControlType } from './data';
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

  controls: Partial<IControls> = {
    tl: new Control({ x: -1, y: -1, angle: 0, createElement: createCropCorner('tl'), actionName: 'crop' }),
    tr: new Control({ x: 1, y: -1, angle: 90, createElement: createCropCorner('tr'), actionName: 'crop' }),
    br: new Control({ x: 1, y: 1, angle: 180, createElement: createCropCorner('br'), actionName: 'crop' }),
    bl: new Control({ x: -1, y: 1, angle: 270, createElement: createCropCorner('bl'), actionName: 'crop' }),
    ml: new Control({ visible: false, x: -1, y: 0, angle: 90, createElement: createCropXoYCorner('ml'), actionName: 'crop' }),
    mr: new Control({ visible: false, x: 1, y: 0, angle: 90, createElement: createCropXoYCorner('mr'), actionName: 'crop' }),
    mt: new Control({ visible: false, x: 0, y: -1, angle: 0, createElement: createCropXoYCorner('mt'), actionName: 'crop' }),
    mb: new Control({ visible: false, x: 0, y: 1, angle: 0, createElement: createCropXoYCorner('mb'), actionName: 'crop' }),
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
      corner && upper.appendChild(corner);
    }

    root.append(lower, upper);

    return { root, image, lower, upper, border };
  }

  render = async (src: string, cropData: ICropData, sourceData: ISourceData) => {
    this.elements.image.src = src;
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
      control.render();
    });
  };
}
