import { Control } from './controls.class';
import { Border } from './border.class';
import { AttributesData } from './const';
import { createCornerCtrlEl, createMiddleCtrlEl, scaleMap } from './element';
import { CSSTransform } from '../utils/cssTransform.class';
import { createElement, findCornerQuadrant, setCSSProperties } from '../utils/tools';
import { Angle } from '../utils/angle.class';

import type { IControlType } from './data.d';
import type { ICropData, ISourceData } from '../cropper/data.d';

export class CropRenderer {
  public borderWidth = 2;
  public borderColor = 'tomato';
  public get element() {
    return this.elements.container;
  }

  private domScaleX = 1;
  private domScaleY = 1;
  private elements!: {
    lower: HTMLDivElement;
    image: HTMLImageElement;
    upper: HTMLDivElement;
    container: HTMLDivElement;
  };

  private controls = {
    tl: new Control({ x: -1, y: -1, angle: 0, createElement: createCornerCtrlEl('tl'), actionName: 'crop' }),
    tr: new Control({ x: 1, y: -1, angle: 90, createElement: createCornerCtrlEl('tr'), actionName: 'crop' }),
    br: new Control({ x: 1, y: 1, angle: 180, createElement: createCornerCtrlEl('br'), actionName: 'crop' }),
    bl: new Control({ x: -1, y: 1, angle: 270, createElement: createCornerCtrlEl('bl'), actionName: 'crop' }),
    ml: new Control({ x: -1, y: 0, angle: 90, createElement: createMiddleCtrlEl('ml'), actionName: 'crop' }),
    mr: new Control({ x: 1, y: 0, angle: 90, createElement: createMiddleCtrlEl('mr'), actionName: 'crop' }),
    mt: new Control({ x: 0, y: -1, angle: 0, createElement: createMiddleCtrlEl('mt'), actionName: 'crop' }),
    mb: new Control({ x: 0, y: 1, angle: 0, createElement: createMiddleCtrlEl('mb'), actionName: 'crop' }),
  };

  private borders = {
    mt: new Border({ y: -1, actionHandler: () => ({ scaleY: this.domScaleY, width: '100%', height: `${this.borderWidth}px` }), borderName: 'top' }),
    mr: new Border({ x: 1, actionHandler: () => ({ scaleX: this.domScaleX, width: `${this.borderWidth}px`, height: '100%' }), borderName: 'right' }),
    mb: new Border({ y: 1, actionHandler: () => ({ scaleY: this.domScaleY, width: '100%', height: `${this.borderWidth}px` }), borderName: 'bottom' }),
    ml: new Border({ x: -1, actionHandler: () => ({ scaleX: this.domScaleX, width: `${this.borderWidth}px`, height: '100%' }), borderName: 'left' }),
  };

  private imageLoad = () => {};
  private imageError = (e: ErrorEvent) => {};
  private onImageLoad = () => this.imageLoad();
  private onImageError = (e: ErrorEvent) => this.imageError(e);

  constructor() {
    this.elements = this.createElement();
  }

  private createElement() {
    const container = createElement('div', { classList: ['ic-crop-container'] });

    const lower = createElement('div', { classList: ['ic-crop-lower'] });

    const image = createElement('img', { classList: ['ic-crop-image'] });
    image.addEventListener('load', this.onImageLoad);
    image.addEventListener('error', this.onImageError);
    lower.append(image);

    const upper = createElement('div', { classList: ['ic-crop-upper'] });

    for (const key in this.borders) {
      const border = this.borders[key as keyof typeof this.borders].element;
      upper.appendChild(border);
    }

    for (const key in this.controls) {
      const corner = this.controls[key as IControlType]?.element;
      if (corner) {
        corner.setAttribute(AttributesData.CropCorner, key);
        upper.appendChild(corner);
      }
    }

    container.append(lower, upper);

    return { container, lower, image, upper };
  }

  render = async (src: string, cropData: ICropData, sourceData: ISourceData, angle: Angle, cropBackup: ICropData) => {
    this.elements.image.src = src;
    this.elements.upper.setAttribute(AttributesData.ActionCursor, 'move');
    this.elements.upper.setAttribute(AttributesData.ActionName, 'move');

    await new Promise<void>((resolve, reject) => {
      this.imageLoad = resolve;
      this.imageError = reject;
    });

    const cropScaleX = cropData.width / cropBackup.width;
    const cropScaleY = cropData.height / cropBackup.height;
    const scaleX = cropData.scaleX * cropScaleX;
    const scaleY = cropData.scaleY * cropScaleY;

    const containerStyle = {
      width: `${cropBackup.width}px`,
      height: `${cropBackup.height}px`,
      transform: new CSSTransform().matrix([
        angle.cos * scaleX,
        angle.sin * scaleX,
        -angle.sin * scaleY,
        angle.cos * scaleY,
        cropData.left,
        cropData.top,
      ]).value,
    };

    setCSSProperties(this.elements.lower, containerStyle);

    setCSSProperties(this.elements.upper, containerStyle);

    setCSSProperties(this.elements.image, {
      width: `${sourceData.width}px`,
      height: `${sourceData.height}px`,
      transform: new CSSTransform()
        .translate(
          -((cropData.cropX - (cropData.flipX ? sourceData.width : 0)) / cropScaleX),
          -((cropData.cropY - (cropData.flipY ? sourceData.height : 0)) / cropScaleY)
        )
        .scaleX((cropData.flipX ? -1 : 1) / cropScaleX)
        .scaleY((cropData.flipY ? -1 : 1) / cropScaleY).value,
    });

    this.domScaleX = 1 / scaleX;
    this.domScaleY = 1 / scaleY;

    Object.entries(this.controls).forEach(([corner, control]) => {
      control.cursorStyle = scaleMap[findCornerQuadrant(cropData.angle, control)] + '-resize';

      control.scaleX = this.domScaleX;
      control.scaleY = this.domScaleY;
      control.element?.setAttribute(AttributesData.ActionCursor, control.cursorStyle);
      control.render();
    });

    for (const key in this.borders) {
      const border = this.borders[key as keyof typeof this.borders];
      border.render();
    }
  };
}
