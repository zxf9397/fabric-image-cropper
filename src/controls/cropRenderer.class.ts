import * as CSS from 'csstype';
import { Control } from './controls.class';
import { createCropCorner, createCropXoYCorner, scaleMap } from './element';
import { CSSTransform } from '../utils/cssTransform.class';
import { createElement, findCornerQuadrant, setCSSProperties } from '../utils/tools';
import { Angle } from '../utils/angle.class';

import type { IControlType } from './data.d';
import type { ICropData, ISourceData } from '../cropper/data.d';

class Border {
  public borderName = '';
  public x = 0;
  public y = 0;
  public width = '0';
  public height = '0';
  public color = 'tomato';
  public scaleX = 1;
  public scaleY = 1;
  public offsetX = '0';
  public offsetY = '0';

  public element: HTMLDivElement;

  constructor(options?: Partial<Border>) {
    Object.assign(this, options);

    this.element = this.createElement();
  }

  public createElement(): HTMLDivElement {
    return createElement('div', { style: this.getStyles() });
  }

  private getStyles(): CSS.PropertiesHyphen {
    return {
      position: 'absolute',
      left: `${(1 + this.x) * 50}%`,
      top: `${(1 + this.y) * 50}%`,
      width: `${this.width}`,
      height: `${this.height}`,
      'background-color': this.color,
      transform: this.translate('-50%', '-50%') + this.scale(this.scaleX, this.scaleY),
      'transform-origin': 'center center',
    };
  }

  public actionHandler(): Partial<Border> {
    return this;
  }

  public translate(x: string | number, y: string | number) {
    return new CSSTransform().translate(x, y).value;
  }

  public scale(x: number, y: number) {
    return new CSSTransform().scaleX(x).scaleY(y).value;
  }

  public render() {
    Object.assign(this, this.actionHandler());

    setCSSProperties(this.element, this.getStyles());
  }
}

export class CropRenderer {
  public elements!: {
    root: HTMLDivElement;
    image: HTMLImageElement;
    upper: HTMLDivElement;
    container: HTMLDivElement;
  };
  get element() {
    return this.elements.container;
  }

  controls = {
    tl: new Control({ x: -1, y: -1, angle: 0, createElement: createCropCorner('tl'), actionName: 'crop' }),
    tr: new Control({ x: 1, y: -1, angle: 90, createElement: createCropCorner('tr'), actionName: 'crop' }),
    br: new Control({ x: 1, y: 1, angle: 180, createElement: createCropCorner('br'), actionName: 'crop' }),
    bl: new Control({ x: -1, y: 1, angle: 270, createElement: createCropCorner('bl'), actionName: 'crop' }),
    ml: new Control({ x: -1, y: 0, angle: 90, createElement: createCropXoYCorner('ml'), actionName: 'crop' }),
    mr: new Control({ x: 1, y: 0, angle: 90, createElement: createCropXoYCorner('mr'), actionName: 'crop' }),
    mt: new Control({ x: 0, y: -1, angle: 0, createElement: createCropXoYCorner('mt'), actionName: 'crop' }),
    mb: new Control({ x: 0, y: 1, angle: 0, createElement: createCropXoYCorner('mb'), actionName: 'crop' }),
  };

  private scaleX = 1;
  private scaleY = 1;

  borders = {
    top: new Border({ x: 0, y: -1, width: '100%', height: '4px', actionHandler: () => ({ scaleY: this.scaleY }), borderName: 'top' }),
    right: new Border({ x: 1, y: 0, width: '4px', height: '100%', actionHandler: () => ({ scaleX: this.scaleX }), borderName: 'right' }),
    bottom: new Border({ x: 0, y: 1, width: '100%', height: '4px', actionHandler: () => ({ scaleY: this.scaleY }), borderName: 'bottom' }),
    left: new Border({ x: -1, y: 0, width: '4px', height: '100%', actionHandler: () => ({ scaleX: this.scaleX }), borderName: 'left' }),
  };

  private imageLoad = () => {};
  private imageError = (e: ErrorEvent) => {};
  private onImageLoad = () => this.imageLoad();
  private onImageError = (e: ErrorEvent) => this.imageError(e);

  constructor() {
    this.elements = this.createElement();
  }

  private createElement() {
    const container = createElement('div');
    const root = createElement('div', { classList: ['image-cropper-crop', 'fcc-lower-box'] });

    const image = createElement('img', { classList: ['lower-crop-image'] });

    image.addEventListener('load', this.onImageLoad);
    image.addEventListener('error', this.onImageError);

    const upper = createElement('div', { classList: ['fcc-upper-box'] });

    for (const key in this.borders) {
      const border = this.borders[key as keyof typeof this.borders].element;
      upper.appendChild(border);
    }

    for (const key in this.controls) {
      const corner = this.controls[key as IControlType]?.element;
      if (corner) {
        corner.setAttribute('data-crop-corner', key);
        upper.appendChild(corner);
      }
    }

    root.append(image);

    container.append(root, upper);

    return { root, image, upper, container };
  }

  render = async (src: string, cropData: ICropData, sourceData: ISourceData, angle: Angle, cropBackup: ICropData) => {
    this.elements.image.src = src;
    this.elements.upper.setAttribute('data-action-cursor', 'move');
    this.elements.upper.setAttribute('data-action-name', 'move');

    await new Promise<void>((resolve, reject) => {
      this.imageLoad = resolve;
      this.imageError = reject;
    });

    const scaleX = cropData.width / cropBackup.width;
    const scaleY = cropData.height / cropBackup.height;

    setCSSProperties(this.elements.root, {
      width: `${cropBackup.width}px`,
      height: `${cropBackup.height}px`,
      transform: new CSSTransform().matrix([
        angle.cos * cropData.scaleX * scaleX,
        angle.sin * cropData.scaleX * scaleX,
        -angle.sin * cropData.scaleY * scaleY,
        angle.cos * cropData.scaleY * scaleY,
        cropData.left,
        cropData.top,
      ]).value,
    });

    setCSSProperties(this.elements.upper, {
      width: `${cropBackup.width}px`,
      height: `${cropBackup.height}px`,
      transform: new CSSTransform().matrix([
        angle.cos * cropData.scaleX * scaleX,
        angle.sin * cropData.scaleX * scaleX,
        -angle.sin * cropData.scaleY * scaleY,
        angle.cos * cropData.scaleY * scaleY,
        cropData.left,
        cropData.top,
      ]).value,
    });

    setCSSProperties(this.elements.image, {
      width: `${sourceData.width}px`,
      height: `${sourceData.height}px`,
      transform: new CSSTransform()
        .translate(
          -((cropData.cropX - (cropData.flipX ? sourceData.width : 0)) / scaleX),
          -((cropData.cropY - (cropData.flipY ? sourceData.height : 0)) / scaleY)
        )
        .scaleX((cropData.flipX ? -1 : 1) / scaleX)
        .scaleY((cropData.flipY ? -1 : 1) / scaleY).value,
      'transform-origin': 'left top',
    });

    this.scaleX = 1 / (cropData.scaleX * scaleX);
    this.scaleY = 1 / (cropData.scaleY * scaleY);

    Object.entries(this.controls).forEach(([corner, control]) => {
      control.cursorStyle = scaleMap[findCornerQuadrant(cropData.angle, control)] + '-resize';

      control.scaleX = this.scaleX;
      control.scaleY = 1 / (cropData.scaleY * scaleY);
      control.element?.setAttribute('data-action-cursor', control.cursorStyle);
      control.render();
    });

    for (const key in this.borders) {
      const border = this.borders[key as keyof typeof this.borders];
      border.render();
    }
  };
}
