import type { IControlType, IElements, IRenderFunctionParam } from './data.d';

import { AttributesData, DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH } from '../const';
import { createElement, ScaleMapList } from '../utils/createElement';
import { Control } from '../components/control.class';
import { Border } from '../components/border.class';
import { ImgaeLoader } from '../utils/imageLoader.class';
import { findCornerQuadrant } from '../utils/angle.class';

export class Renderer {
  public borderWidth = DEFAULT_BORDER_WIDTH;
  public borderColor = DEFAULT_BORDER_COLOR;
  public scale = 1;

  public get element() {
    return this.elements.container;
  }

  protected domScaleX = 1;
  protected domScaleY = 1;
  protected elements!: IElements;
  protected imageLoader = new ImgaeLoader();

  protected controls: Partial<Record<IControlType, Control>> = {};

  protected borders = {
    mt: new Border({
      y: -1,
      actionHandler: () => ({
        scaleY: this.domScaleY,
        width: '100%',
        height: `${this.borderWidth}px`,
        color: this.borderColor,
      }),
      borderName: 'top',
    }),
    mr: new Border({
      x: 1,
      actionHandler: () => ({
        scaleX: this.domScaleX,
        width: `${this.borderWidth}px`,
        height: '100%',
        color: this.borderColor,
      }),
      borderName: 'right',
    }),
    mb: new Border({
      y: 1,
      actionHandler: () => ({
        scaleY: this.domScaleY,
        width: '100%',
        height: `${this.borderWidth}px`,
        color: this.borderColor,
      }),
      borderName: 'bottom',
    }),
    ml: new Border({
      x: -1,
      actionHandler: () => ({
        scaleX: this.domScaleX,
        width: `${this.borderWidth}px`,
        height: '100%',
        color: this.borderColor,
      }),
      borderName: 'left',
    }),
  };

  constructor(options?: Partial<Renderer>) {
    Object.assign(this, options);

    this.elements = this.createElement();

    this.imageLoader.setImage(this.elements.image);

    this.addBordersAndControls();
  }

  protected createElement(): IElements {
    const container = createElement('div');

    const lower = createElement('div');

    const image = createElement('img');

    const upper = createElement('div');

    return { container, lower, image, upper };
  }

  protected addBordersAndControls() {
    const fragment = document.createDocumentFragment();

    for (const key in this.borders) {
      const border = this.borders[key as keyof typeof this.borders]?.element;
      if (border) {
        fragment.appendChild(border);
      }
    }

    for (const key in this.controls) {
      const corner = this.controls[key as IControlType]?.element;
      if (corner) {
        corner.setAttribute(AttributesData.ActionCorner, key);
        fragment.appendChild(corner);
      }
    }

    this.elements.upper.appendChild(fragment);
  }

  protected renderBefore(param: IRenderFunctionParam) {}

  public render = async (param: IRenderFunctionParam) => {
    this.imageLoader.setImage(param.src);
    await this.imageLoader.getImage();

    this.renderBefore(param);

    Object.entries(this.controls).forEach(([corner, control]) => {
      control.cursorStyle = ScaleMapList[findCornerQuadrant(param.croppedData.angle, control)] + '-resize';

      control.scaleX = this.domScaleX;
      control.scaleY = this.domScaleY;
      control.element?.setAttribute(AttributesData.CornerName, corner);
      control.element?.setAttribute(AttributesData.ActionCursor, control.cursorStyle);
      control.render();
    });

    for (const key in this.borders) {
      const border = this.borders[key as keyof typeof this.borders];
      border?.render();
    }
  };
}
