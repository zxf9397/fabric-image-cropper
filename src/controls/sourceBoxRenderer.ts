import { CornerType } from '../data';
import { createElement, findCornerQuadrant, setCSSProperties } from '../utils/tools';
import { Control } from './controls';
import { createCropCorner, createCropXoYCorner, scaleMap } from './element';
import { BoxRenderFunction } from './cropBoxRenderer';

export class SourceBoxRenderer {
  left = 0;
  top = 0;
  width = 0;
  height = 0;
  angle = 0;
  src?: string;

  controls: Partial<Record<CornerType, Control>> = {
    tl: new Control({ x: -1, y: -1, angle: 0, createElement: createCropCorner('tl'), actionName: 'crop' }),
    tr: new Control({ x: 1, y: -1, angle: 90, createElement: createCropCorner('tr'), actionName: 'crop' }),
    br: new Control({ x: 1, y: 1, angle: 180, createElement: createCropCorner('br'), actionName: 'crop' }),
    bl: new Control({ x: -1, y: 1, angle: 270, createElement: createCropCorner('bl'), actionName: 'crop' }),
    // mt: new Control({ x: 0, y: -1, angle: 0, createElement: createCropXoYCorner('mt'), actionName: 'cropY' }),
    // mr: new Control({ x: 1, y: 0, angle: 90, createElement: createCropXoYCorner('mr'), actionName: 'cropX' }),
    // mb: new Control({ x: 0, y: 1, angle: 0, createElement: createCropXoYCorner('mb'), actionName: 'cropY' }),
    // ml: new Control({ x: -1, y: 0, angle: 90, createElement: createCropXoYCorner('ml'), actionName: 'cropX' }),
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

    this.element.addEventListener('mousedown', this.actionStart);
    this.element.addEventListener('mouseup', this.actionEnd);
  }

  private actionStart = (e: MouseEvent) => {};

  private actionEnd = (e: MouseEvent) => {};

  actionHandler = () => {};

  createElement() {
    const root = createElement('div', { classList: ['image-cropper-source'] });

    const lower = createElement('div', { classList: ['fcd-lower-box'] });
    const image = createElement('img', { classList: ['fcd-lower-image'] });
    image.addEventListener('load', this.onImageLoad);
    image.addEventListener('error', this.onImageError);
    lower.appendChild(image);

    const upper = createElement('div', { classList: ['fcc-upper-box'] });
    upper.appendChild(createElement('div', { classList: ['fcc-upper-box-border'] }));

    for (const key in this.controls) {
      const corner = this.controls[key as CornerType]?.element;
      corner && upper.appendChild(corner);
    }

    root.append(lower, upper);

    return { root, image };
  }

  render: BoxRenderFunction = async (src, cropBox, sourceBox) => {
    if (!src) {
      return;
    }
    this.elements.image.src = src;
    await new Promise<void>((resolve, reject) => {
      this.imageLoad = resolve;
      this.imageError = reject;
    });

    setCSSProperties(this.elements.root, {
      width: `${sourceBox.width}px`,
      height: `${sourceBox.height}px`,
      transform: `translate3d(${sourceBox.left}px, ${sourceBox.top}px, 0) rotate(${sourceBox.angle}deg)`,
    });

    Object.entries(this.controls).forEach(([corner, control]) => {
      control.cursorStyle = scaleMap[findCornerQuadrant(sourceBox?.angle || 0, control)] + '-resize';
      control.render();
    });
  };
}
