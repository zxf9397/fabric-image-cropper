import { CropBoxRenderer } from '../controls/cropBoxRenderer';
import { DragBoxRenderer } from '../controls/dragBoxRenderer';
import { CornerType } from '../data';
import { convertXYSystem, createElement, findCornerQuadrant, Point, setCSSProperties } from '../utils/tools';

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
}

export interface CropBox extends Box {
  cropX: number;
  cropY: number;
}

interface CropInfo {
  src: string;
  cropBox: Box;
  dragBox: Box;
}

interface CropFunction {
  (src?: string, cropBox?: CropBox, dragBox?: Box): Promise<void>;
}

interface ImageCropperOptions extends CropInfo {
  visible: boolean;
  containerOffsetX: number;
  containerOffsetY: number;
}

type CropStart = 'crop';
type CropEnd = 'confirm' | 'cancel';

interface CropChangeCallback {
  (state: boolean, type: CropStart | CropEnd): void;
}

export class ImageCropper {
  private inCroppingState = false;
  private action = '';
  private cropChangeCallbacks = new Set<CropChangeCallback>();
  private element: HTMLDivElement;
  private dragBoxRenderer: DragBoxRenderer;
  private cropBoxRenderer: CropBoxRenderer;
  private target?: DragBoxRenderer | CropBoxRenderer;

  src?: string;
  cropBox?: CropBox;
  dragBox?: Box;
  visible = false;
  containerOffsetX = 0;
  containerOffsetY = 0;

  constructor(private container: HTMLElement, options?: Partial<ImageCropperOptions>) {
    Object.assign(this, options);

    this.element = this.createElement();
    this.dragBoxRenderer = new DragBoxRenderer();
    this.cropBoxRenderer = new CropBoxRenderer();
    this.element.append(this.dragBoxRenderer.element, this.cropBoxRenderer.element);

    container.appendChild(this.element);

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', () => {
      this.target = undefined;
      this.action = '';

      setCSSProperties(this.container, { cursor: 'default' });
    });
    Object.entries(this.dragBoxRenderer.controls).forEach(([corner, control]) => {
      control.element?.addEventListener('mousedown', () => {
        this.target = this.dragBoxRenderer;
        this.action = corner;

        setCSSProperties(this.container, { cursor: control.cursorStyle });
      });
    });
    Object.entries(this.cropBoxRenderer.controls).forEach(([corner, control]) => {
      control.element?.addEventListener('mousedown', () => {
        this.target = this.cropBoxRenderer;
        this.action = corner;
        setCSSProperties(this.container, { cursor: control.cursorStyle });
      });
    });
  }

  private cropCoords?: Record<CornerType, Point>;
  private dragCoords?: Record<CornerType, Point>;

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.action || !this.src || !this.cropBox || !this.dragBox || !this.cropCoords || !this.dragCoords) {
      return;
    }

    const { left, top } = this.element.getBoundingClientRect();

    const pointer = { x: e.clientX - left, y: e.clientY - top };

    let cropBox: CropBox | undefined;

    if (this.target === this.cropBoxRenderer) {
      switch (this.action) {
        case 'tl': {
          let p = pointer;

          const dOffset = convertXYSystem({ x: p.x - this.dragCoords.tl.x, y: p.y - this.dragCoords.tl.y }, -this.cropBox.angle);
          if (dOffset.x < 0 && dOffset.y < 0) {
            p = convertXYSystem({ x: 0, y: 0 }, this.cropBox.angle, this.dragCoords.tl);
          } else if (dOffset.x < 0) {
            p = convertXYSystem({ x: 0, y: dOffset.y }, this.cropBox.angle, this.dragCoords.tl);
          } else if (dOffset.y < 0) {
            p = convertXYSystem({ x: dOffset.x, y: 0 }, this.cropBox.angle, this.dragCoords.tl);
          }

          const o = convertXYSystem({ x: this.cropCoords.br.x - p.x, y: this.cropCoords.br.y - p.y }, 360 - this.cropBox.angle);

          cropBox = {
            left: p.x,
            top: p.y,
            width: o.x,
            height: o.y,
            cropX: Math.max(dOffset.x, 0),
            cropY: Math.max(dOffset.y, 0),
            angle: this.cropBox.angle,
          };
          break;
        }
        case 'tr': {
          const local = convertXYSystem({ x: pointer.x - this.cropCoords.bl.x, y: pointer.y - this.cropCoords.bl.y }, this.cropBox.angle);

          if (local.x < 0 && local.y < -this.cropBox.height) {
            console.log(123);
          } else if (local.x < 0) {
            //
          } else {
          }

          const localPoint = convertXYSystem(pointer, -this.cropBox.angle);

          break;
        }
        case 'br':
          const p2 = convertXYSystem(pointer, -this.cropBox.angle);

          const np2 = convertXYSystem({ x: p2.x - this.cropBox.width, y: p2.y - this.cropBox.height }, this.cropBox.angle);
          this.target.render(this.src, { ...this.cropBox, left: np2.x, top: np2.y }, this.dragBox);
          break;
        case 'bl':
          const p3 = convertXYSystem(pointer, -this.cropBox.angle);

          const np3 = convertXYSystem({ x: p3.x, y: p3.y - this.cropBox.height }, this.cropBox.angle);
          this.target.render(this.src, { ...this.cropBox, left: np3.x, top: np3.y }, this.dragBox);
          break;
        case 'mt': {
          const p = convertXYSystem(pointer, -this.cropBox.angle);

          const np = convertXYSystem({ x: p.x - this.cropBox.width / 2, y: p.y }, this.cropBox.angle);
          this.target.render(this.src, { ...this.cropBox, left: np.x, top: np.y }, this.dragBox);
          break;
        }
        default:
          break;
      }

      if (cropBox) {
        this.target.render(this.src, cropBox, this.dragBox);
      }
    }
  };

  private createElement() {
    const { borderLeftWidth, borderTopWidth, border, width, height, position } = window.getComputedStyle(this.container);

    return createElement('div', {
      classList: ['image-cropper-container'],
      style: {
        display: this.visible ? 'block' : 'none',
        position: position !== 'static' ? 'absolute' : 'relative',
        left: `${this.containerOffsetX}px`,
        top: `${this.containerOffsetY}px`,
        width: width,
        height: height,
        border: border,
        'border-left-width': borderLeftWidth,
        'border-top-width': borderTopWidth,
      },
    });
  }

  private show() {
    setCSSProperties(this.element, { display: 'block' });
    this.inCroppingState = true;
    this.cropChangeCallbacks.forEach((callback) => callback(true, 'crop'));
  }

  private hidden(type: CropEnd) {
    setCSSProperties(this.element, { display: 'none' });
    this.inCroppingState = false;
    this.cropChangeCallbacks.forEach((callback) => callback(false, type));
  }

  dispose = () => {
    this.element.remove();
  };

  private setCursorEvent() {}

  setCropper = (info: CropInfo) => {};

  crop: CropFunction = async (src, cropBox, dragBox) => {
    if (this.inCroppingState) {
      return;
    }

    this.src ||= src;
    this.cropBox ||= cropBox;
    this.dragBox ||= dragBox;

    if (!this.src || !this.cropBox || !this.dragBox) {
      return;
    }

    this.cropCoords = getCoords(this.cropBox);

    this.dragCoords = getCoords(this.dragBox);

    function getCoords(box: Box) {
      const { left, top, width, height, angle } = box;
      const midW = width / 2,
        midH = height / 2;

      const tl = { x: left, y: top };
      return {
        tl: tl,
        mt: convertXYSystem({ x: midW, y: 0 }, angle, tl),
        tr: convertXYSystem({ x: width, y: 0 }, angle, tl),
        mr: convertXYSystem({ x: width, y: midH }, angle, tl),
        br: convertXYSystem({ x: width, y: height }, angle, tl),
        mb: convertXYSystem({ x: midW, y: height }, angle, tl),
        bl: convertXYSystem({ x: 0, y: height }, angle, tl),
        ml: convertXYSystem({ x: 0, y: midH }, angle, tl),
      };
    }

    await Promise.all([
      this.dragBoxRenderer.render(this.src, this.cropBox, this.dragBox),
      this.cropBoxRenderer.render(this.src, this.cropBox, this.dragBox),
    ]);

    this.show();
  };

  confirm = () => {
    if (!this.inCroppingState) {
      return;
    }

    this.hidden('confirm');
  };

  cancel = () => {
    if (!this.inCroppingState) {
      return;
    }

    this.hidden('cancel');
  };

  onCropChange = (callback: CropChangeCallback) => {
    this.cropChangeCallbacks.add(callback);
  };
}
