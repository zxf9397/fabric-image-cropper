import { Control } from './controls.class';
import { createCropCorner, scaleMap } from './element';
import { CSSTransform } from '../utils/cssTransform.class';
import { createElement, findCornerQuadrant, setCSSProperties } from '../utils/tools';

import type { IControls, IControlType } from './data.d';
import type { ICropData, ISourceData } from '../cropper/data.d';

export class CropRenderer {
  private elements!: {
    root: HTMLDivElement;
    image: HTMLImageElement;
  };
  get element() {
    return this.elements.root;
  }

  controls: Partial<IControls> = {
    tl: new Control({ x: -1, y: -1, angle: 0, createElement: createCropCorner('tl'), actionName: 'crop' }),
    tr: new Control({ x: 1, y: -1, angle: 90, createElement: createCropCorner('tr'), actionName: 'crop' }),
    br: new Control({ x: 1, y: 1, angle: 180, createElement: createCropCorner('br'), actionName: 'crop' }),
    bl: new Control({ x: -1, y: 1, angle: 270, createElement: createCropCorner('bl'), actionName: 'crop' }),
  };

  private imageLoad = () => {};
  private imageError = (e: ErrorEvent) => {};
  private onImageLoad = () => this.imageLoad();
  private onImageError = (e: ErrorEvent) => this.imageError(e);

  constructor() {
    this.elements = this.createElement();
  }

  private createElement() {
    const root = createElement('div', { classList: ['image-cropper-crop'] });

    const lower = createElement('div', { classList: ['fcc-lower-box'] });
    const image = createElement('img', { classList: ['lower-crop-image'] });

    image.addEventListener('load', this.onImageLoad);
    image.addEventListener('error', this.onImageError);
    lower.appendChild(image);

    const upper = createElement('div', { classList: ['fcc-upper-box'] });
    upper.appendChild(createElement('div', { classList: ['fcc-upper-box-border'] }));

    for (const key in this.controls) {
      const corner = this.controls[key as IControlType]?.element;
      corner && upper.appendChild(corner);
    }

    root.append(lower, upper);

    return { root, image };
  }

  render = async (src: string, cropData: ICropData, sourceData: ISourceData) => {
    this.elements.image.src = src;

    await new Promise<void>((resolve, reject) => {
      this.imageLoad = resolve;
      this.imageError = reject;
    });

    setCSSProperties(this.elements.root, {
      width: `${cropData.width * cropData.scaleX}px`,
      height: `${cropData.height * cropData.scaleY}px`,
      transform: new CSSTransform().translate3d(cropData.left, cropData.top, 0).rotate(cropData.angle).value,
    });

    setCSSProperties(this.elements.image, {
      width: `${sourceData.width * cropData.scaleX}px`,
      height: `${sourceData.height * cropData.scaleY}px`,
      transform: new CSSTransform()
        .translate3d(-cropData.cropX, -cropData.cropY)
        .scaleX(cropData.flipX ? -1 : 1)
        .scaleY(cropData.flipY ? -1 : 1).value,
    });

    Object.entries(this.controls).forEach(([corner, control]) => {
      control.cursorStyle = scaleMap[findCornerQuadrant(cropData.angle, control)] + '-resize';
      control.render();
    });
  };
}
