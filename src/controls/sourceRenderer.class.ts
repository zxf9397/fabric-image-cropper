import { Control } from './controls.class';
import { Border } from './border.class';
import { createCornerCtrlEl, createMiddleCtrlEl, scaleMap } from './element';
import { CSSTransform } from '../utils/cssTransform.class';
import { Angle } from '../utils/angle.class';
import { createElement, findCornerQuadrant, setCSSProperties } from '../utils/tools';

import type { IControlType, IMiddleControlType } from './data';
import type { ICropData, ISourceData } from '../cropper/data';
import { AttributesData } from './const';

export class SourceRenderer {
  private elements!: {
    container: HTMLDivElement;
    lower: HTMLDivElement;
    image: HTMLImageElement;
    upper: HTMLDivElement;
  };

  public borderWidth = 2;
  public borderColor = 'tomato';

  get element() {
    return this.elements.container;
  }

  controls = {
    tl: new Control({ x: -1, y: -1, angle: 0, createElement: createCornerCtrlEl('tl'), actionName: 'scale' }),
    tr: new Control({ x: 1, y: -1, angle: 90, createElement: createCornerCtrlEl('tr'), actionName: 'scale' }),
    br: new Control({ x: 1, y: 1, angle: 180, createElement: createCornerCtrlEl('br'), actionName: 'scale' }),
    bl: new Control({ x: -1, y: 1, angle: 270, createElement: createCornerCtrlEl('bl'), actionName: 'scale' }),
    ml: new Control({ visible: false, x: -1, y: 0, angle: 90, createElement: createMiddleCtrlEl('ml'), actionName: 'scale' }),
    mr: new Control({ visible: false, x: 1, y: 0, angle: 90, createElement: createMiddleCtrlEl('mr'), actionName: 'scale' }),
    mt: new Control({ visible: false, x: 0, y: -1, angle: 0, createElement: createMiddleCtrlEl('mt'), actionName: 'scale' }),
    mb: new Control({ visible: false, x: 0, y: 1, angle: 0, createElement: createMiddleCtrlEl('mb'), actionName: 'scale' }),
  };

  private domScaleX = 1;
  private domScaleY = 1;

  borders = {
    mt: new Border({
      x: 0,
      y: -1,
      width: '100%',
      height: `${this.borderWidth}px`,
      actionHandler: () => ({ scaleY: this.domScaleY }),
      borderName: 'top',
    }),
    mr: new Border({
      x: 1,
      y: 0,
      width: `${this.borderWidth}px`,
      height: '100%',
      actionHandler: () => ({ scaleX: this.domScaleX }),
      borderName: 'right',
    }),
    mb: new Border({
      x: 0,
      y: 1,
      width: '100%',
      height: `${this.borderWidth}px`,
      actionHandler: () => ({ scaleY: this.domScaleY }),
      borderName: 'bottom',
    }),
    ml: new Border({
      x: -1,
      y: 0,
      width: `${this.borderWidth}px`,
      height: '100%',
      actionHandler: () => ({ scaleX: this.domScaleX }),
      borderName: 'left',
    }),
  };

  private imageLoad = () => {};
  private imageError = (e: ErrorEvent) => {};
  private onImageLoad = () => this.imageLoad();
  private onImageError = (e: ErrorEvent) => this.imageError(e);

  constructor(options?: Partial<SourceRenderer>) {
    Object.assign(this, options);
    this.elements = this.createElement();
  }

  private createElement() {
    const container = createElement('div', { classList: ['ic-source-container'] });

    const lower = createElement('div', { classList: ['ic-source-lower'] });

    const image = createElement('img', { classList: ['ic-source-image'] });
    image.addEventListener('load', this.onImageLoad);
    image.addEventListener('error', this.onImageError);
    lower.appendChild(image);

    const upper = createElement('div', { classList: ['ic-source-upper'] });

    for (const key in this.borders) {
      const border = this.borders[key as IMiddleControlType]?.element;
      upper.appendChild(border);
    }

    for (const key in this.controls) {
      const corner = this.controls[key as IControlType]?.element;
      if (corner) {
        corner.setAttribute(AttributesData.ScaleCorner, key);
        upper.appendChild(corner);
      }
    }

    container.append(lower, upper);
    return { container, lower, image, upper };
  }

  render = async (src: string, cropData: ICropData, sourceData: ISourceData, angle: Angle, sourceBackup: ISourceData) => {
    this.elements.image.src = src;
    this.elements.upper.setAttribute(AttributesData.ActionCursor, 'move');
    this.elements.upper.setAttribute(AttributesData.ActionName, 'move');

    await new Promise<void>((resolve, reject) => {
      this.imageLoad = resolve;
      this.imageError = reject;
    });

    const domScaleX = cropData.scaleX;
    const domScaleY = cropData.scaleY;

    const containerStyle = {
      width: `${sourceData.width}px`,
      height: `${sourceData.height}px`,
      transform: new CSSTransform().matrix([
        angle.cos * cropData.scaleX,
        angle.sin * cropData.scaleX,
        -angle.sin * cropData.scaleY,
        angle.cos * cropData.scaleY,
        sourceData.left,
        sourceData.top,
      ]).value,
    };

    setCSSProperties(this.elements.lower, containerStyle);

    setCSSProperties(this.elements.upper, containerStyle);

    setCSSProperties(this.elements.image, {
      transform: new CSSTransform().scaleX(cropData.flipX ? -1 : 1).scaleY(cropData.flipY ? -1 : 1).value,
    });

    this.domScaleX = 1 / domScaleX;
    this.domScaleY = 1 / domScaleY;

    Object.entries(this.controls).forEach(([corner, control]) => {
      control.cursorStyle = scaleMap[findCornerQuadrant(cropData.angle, control)] + '-resize';
      control.element?.setAttribute(AttributesData.ActionCursor, control.cursorStyle);

      control.scaleX = this.domScaleX;
      control.scaleY = this.domScaleY;
      control.render();
    });

    for (const key in this.borders) {
      const border = this.borders[key as IMiddleControlType];
      border.render();
    }
  };
}
