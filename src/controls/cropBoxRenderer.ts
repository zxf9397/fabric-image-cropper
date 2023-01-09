import { Box, CropBox } from '../cropper/cropper';
import { CornerType } from '../data';
import { createElement, findCornerQuadrant, setCSSProperties } from '../utils/tools';
import { Control } from './controls';
import { createCropCorner, createCropXoYCorner, scaleMap } from './element';

export interface BoxRenderFunction {
  (src: string, cropBox: CropBox, dragBox: Box): Promise<void>;
}

export class CropBoxRenderer {
  left = 0;
  top = 0;
  width = 0;
  height = 0;
  angle = 0;
  src?: string;

  controls = {
    tl: new Control({ x: -1, y: -1, angle: 0, createElement: createCropCorner('tl'), actionName: 'crop' }),
    mt: new Control({ x: 0, y: -1, angle: 0, createElement: createCropXoYCorner('mt'), actionName: 'cropY' }),
    tr: new Control({ x: 1, y: -1, angle: 90, createElement: createCropCorner('tr'), actionName: 'crop' }),
    mr: new Control({ x: 1, y: 0, angle: 90, createElement: createCropXoYCorner('mr'), actionName: 'cropX' }),
    br: new Control({ x: 1, y: 1, angle: 180, createElement: createCropCorner('br'), actionName: 'crop' }),
    mb: new Control({ x: 0, y: 1, angle: 0, createElement: createCropXoYCorner('mb'), actionName: 'cropY' }),
    bl: new Control({ x: -1, y: 1, angle: 270, createElement: createCropCorner('bl'), actionName: 'crop' }),
    ml: new Control({ x: -1, y: 0, angle: 90, createElement: createCropXoYCorner('ml'), actionName: 'cropX' }),
  };

  private elements!: {
    root: HTMLDivElement;
    image: HTMLImageElement;
  };

  get element() {
    return this.elements.root;
  }

  private imageLoad = () => {};
  private imageError = (e: ErrorEvent) => {};
  private onImageLoad = () => this.imageLoad();
  private onImageError = (e: ErrorEvent) => this.imageError(e);

  constructor() {
    this.elements = this.createElement();
  }

  createElement() {
    const root = createElement('div', { classList: ['image-cropper-crop'] });

    const lower = createElement('div', { classList: ['fcc-lower-box'] });
    const image = createElement('img', { classList: ['lower-crop-image'] });
    image.addEventListener('load', this.onImageLoad);
    image.addEventListener('error', this.onImageError);
    lower.appendChild(image);

    const upper = createElement('div', { classList: ['fcc-upper-box'] });
    upper.appendChild(createElement('div', { classList: ['fcc-upper-box-border'] }));

    for (const key in this.controls) {
      const corner = this.controls[key as CornerType].element;
      corner && upper.appendChild(corner);
    }

    root.append(lower, upper);

    return { root, image };
  }

  render: BoxRenderFunction = async (src, cropBox, dragBox) => {
    if (!src) {
      return;
    }
    this.elements.image.src = src;
    await new Promise<void>((resolve, reject) => {
      this.imageLoad = resolve;
      this.imageError = reject;
    });

    setCSSProperties(this.elements.root, {
      width: `${cropBox.width}px`,
      height: `${cropBox.height}px`,
      transform: `translate(${cropBox.left}px, ${cropBox.top}px) rotate(${cropBox.angle}deg)`,
    });

    setCSSProperties(this.elements.image, {
      width: `${dragBox.width}px`,
      height: `${dragBox.height}px`,
      transform: `translate(${-cropBox.cropX}px, ${-cropBox.cropY}px)`,
    });

    Object.entries(this.controls).forEach(([corner, control]) => {
      control.cursorStyle = scaleMap[findCornerQuadrant(dragBox?.angle || 0, control)] + '-resize';
      control.render();
    });
  };
}
