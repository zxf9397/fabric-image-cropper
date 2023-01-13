import { CropBoxRenderer } from '../controls/cropBoxRenderer';
import { DragBoxRenderer } from '../controls/dragBoxRenderer';
import { CornerType } from '../data';
import { IPoint, Point } from '../utils/point';
import { convertXYSystem, createElement, setCSSProperties } from '../utils/tools';

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

      this.newCropBox && (this.cropBox = this.newCropBox);
      this.newDragBox && (this.dragBox = this.newDragBox);

      setCSSProperties(this.container, { cursor: 'default' });
    });
    Object.entries(this.dragBoxRenderer.controls).forEach(([corner, control]) => {
      control.element?.addEventListener('mousedown', () => {
        this.target = this.dragBoxRenderer;
        this.action = corner;
        this.crop();

        setCSSProperties(this.container, { cursor: control.cursorStyle });
      });
    });
    Object.entries(this.cropBoxRenderer.controls).forEach(([corner, control]) => {
      control.element?.addEventListener('mousedown', () => {
        this.target = this.cropBoxRenderer;
        this.action = corner;
        this.crop();

        setCSSProperties(this.container, { cursor: control.cursorStyle });
      });
    });
  }

  private cropCoords?: Record<CornerType, IPoint>;
  private dragCoords?: Record<CornerType, IPoint>;
  private newCropBox: CropBox | undefined;
  private newDragBox: Box | undefined;

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.ok || !this.action || !this.src || !this.cropBox || !this.dragBox || !this.cropCoords || !this.dragCoords) {
      return;
    }

    const { left, top } = this.element.getBoundingClientRect();

    let pointer = new Point(e.clientX - left, e.clientY - top);

    let newCropBox: CropBox = this.cropBox;
    let newDragBox: Box = this.dragBox;

    if (this.target === this.cropBoxRenderer) {
      switch (this.action) {
        case 'tl': {
          const br = this.cropCoords.br;

          const toRightBottom = pointer.subtract(br).rotate(-this.cropBox.angle).flipX().flipY();
          const maxSize = new Point(this.dragCoords.tl).subtract(br).rotate(-this.cropBox.angle).flipX().flipY();

          const leftSide = maxSize.x - toRightBottom.x < 0,
            rightSide = toRightBottom.x < 0,
            topSide = maxSize.y - toRightBottom.y < 0,
            bottomSide = toRightBottom.y < 0;

          let pos = pointer;
          if (leftSide && topSide) {
            pos = new Point(-maxSize.x, -maxSize.y).rotate(this.cropBox.angle).add(br);
          } else if (topSide && rightSide) {
            pos = new Point(0, -maxSize.y).rotate(this.cropBox.angle).add(br);
          } else if (rightSide && bottomSide) {
            pos = new Point(0, 0).rotate(this.cropBox.angle).add(br);
          } else if (bottomSide && leftSide) {
            pos = new Point(-maxSize.x, 0).rotate(this.cropBox.angle).add(br);
          } else if (leftSide) {
            pos = new Point(-maxSize.x, -toRightBottom.y).rotate(this.cropBox.angle).add(br);
          } else if (topSide) {
            pos = new Point(-toRightBottom.x, -maxSize.y).rotate(this.cropBox.angle).add(br);
          } else if (rightSide) {
            pos = new Point(0, -toRightBottom.y).rotate(this.cropBox.angle).add(br);
          } else if (bottomSide) {
            pos = new Point(-toRightBottom.x, 0).rotate(this.cropBox.angle).add(br);
          }

          const crop = pos.subtract(this.dragCoords.tl).rotate(-this.dragBox.angle);

          newCropBox = {
            ...this.cropBox,
            left: pos.x,
            top: pos.y,
            width: Math.max(0, Math.min(toRightBottom.x, maxSize.x)),
            height: Math.max(0, Math.min(toRightBottom.y, maxSize.y)),
            cropX: crop.x,
            cropY: crop.y,
          };
          break;
        }
        case 'tr': {
          const bl = new Point(this.cropCoords.bl);

          const leftBottom = pointer.subtract(bl).rotate(-this.dragBox.angle).flipY();
          const maxSize = new Point(this.dragCoords.tr).subtract(bl).rotate(-this.cropBox.angle).flipY();

          const topSide = maxSize.y - leftBottom.y < 0,
            bottomSide = leftBottom.y < 0;

          let pos = new Point(0, -leftBottom.y).rotate(this.cropBox.angle).add(bl);
          if (topSide) {
            pos = new Point(0, -maxSize.y).rotate(this.cropBox.angle).add(bl);
          } else if (bottomSide) {
            pos = new Point(0, 0).rotate(this.cropBox.angle).add(bl);
          }

          const crop = pos.subtract(this.dragCoords.tl).rotate(-this.dragBox.angle);

          newCropBox = {
            ...this.cropBox,
            left: pos.x,
            top: pos.y,
            width: Math.max(0, Math.min(leftBottom.x, maxSize.x)),
            height: Math.max(0, Math.min(leftBottom.y, maxSize.y)),
            cropX: crop.x,
            cropY: crop.y,
          };
          break;
        }
        case 'br': {
          const tl = this.cropCoords.tl;

          const rightBottom = pointer.subtract(tl).rotate(-this.cropBox.angle);
          const maxSize = new Point(this.dragCoords.br).subtract(tl).rotate(-this.cropBox.angle);

          newCropBox = {
            ...this.cropBox,
            width: Math.max(0, Math.min(rightBottom.x, maxSize.x)),
            height: Math.max(0, Math.min(rightBottom.y, maxSize.y)),
          };
          break;
        }
        case 'bl': {
          const tr = this.cropCoords.tr;

          const rightTop = pointer.subtract(tr).rotate(-this.cropBox.angle).flipX();
          const maxSize = new Point(this.dragCoords.bl).subtract(tr).rotate(-this.cropBox.angle).flipX();

          const leftSide = maxSize.x - rightTop.x < 0,
            rightSide = rightTop.x < 0;

          let pos = new Point(-rightTop.x, 0).rotate(this.cropBox.angle).add(tr);
          if (leftSide) {
            pos = new Point(-maxSize.x, 0).rotate(this.cropBox.angle).add(tr);
          } else if (rightSide) {
            pos = new Point(0, 0).rotate(this.cropBox.angle).add(tr);
          }

          const crop = pos.subtract(this.dragCoords.tl).rotate(-this.dragBox.angle);

          newCropBox = {
            ...this.cropBox,
            left: pos.x,
            top: pos.y,
            width: Math.max(0, Math.min(rightTop.x, maxSize.x)),
            height: Math.max(0, Math.min(rightTop.y, maxSize.y)),
            cropX: crop.x,
            cropY: crop.y,
          };
          break;
        }
        case 'ml':
          break;
        case 'mt':
          break;
        case 'mr':
          break;
        case 'mb':
          break;
      }
    } else if (this.target === this.dragBoxRenderer) {
      switch (this.action) {
        case 'tl': {
          const br = this.dragCoords.br;

          const minSize = new Point(this.cropCoords.tl).subtract(br).rotate(-this.dragBox.angle).flipX().flipY();

          const localBr = new Point(this.dragBox.width, this.dragBox.height);
          const angle = Math.asin(this.dragBox.height / localBr.distanceFrom()) / (Math.PI / 180);

          const m = new Point(this.dragBox.width, this.dragBox.height).rotate(-angle);

          const p = pointer.subtract(br).rotate(-this.dragBox.angle - angle);
          const n = new Point(p.x, p.x);

          const ratio = -n.x / m.x;

          const local = new Point(
            -Math.max(this.dragBox.width * ratio, minSize.x, minSize.y),
            -Math.max(this.dragBox.height * ratio, minSize.x, minSize.y)
          );

          const pos = local.rotate(this.dragBox.angle).add(br);

          newDragBox = {
            ...this.dragBox,
            left: pos.x,
            top: pos.y,
            width: Math.abs(local.x),
            height: Math.abs(local.y),
          };

          const crop = pos.subtract(this.cropCoords.tl).rotate(-this.cropBox.angle).flipX().flipY();

          newCropBox = {
            ...this.cropBox,
            cropX: crop.x,
            cropY: crop.y,
          };

          break;
        }
        case 'tr': {
          const bl = this.dragCoords.bl;

          const minSize = new Point(this.cropCoords.tr).subtract(bl).rotate(-this.dragBox.angle).flipY();

          const localTr = new Point(this.dragBox.width, -this.dragBox.height);
          const angle = Math.asin(this.dragBox.height / localTr.distanceFrom()) / (Math.PI / 180);

          const m = new Point(this.dragBox.width, -this.dragBox.height).rotate(-angle);

          const p = pointer.subtract(bl).rotate(-this.dragBox.angle - angle);

          const ratio = p.y / m.y;

          const local = new Point(
            Math.max(this.dragBox.width * ratio, minSize.x, minSize.y),
            -Math.max(this.dragBox.height * ratio, minSize.x, minSize.y)
          );

          const pos = new Point(0, local.y).rotate(this.dragBox.angle).add(bl);

          newDragBox = {
            ...this.dragBox,
            left: pos.x,
            top: pos.y,
            width: Math.abs(local.x),
            height: Math.abs(local.y),
          };

          const crop = pos.subtract(this.cropCoords.tl).rotate(-this.cropBox.angle).flipX().flipY();

          newCropBox = {
            ...this.cropBox,
            cropX: crop.x,
            cropY: crop.y,
          };

          break;
        }
        case 'br': {
          const tl = this.dragCoords.tl;

          const minSize = new Point(this.cropCoords.br).subtract(tl).rotate(-this.dragBox.angle);

          const localBr = new Point(this.dragBox.width, this.dragBox.height);
          const angle = Math.asin(this.dragBox.height / localBr.distanceFrom()) / (Math.PI / 180);
          const xAxis = new Point(this.dragBox.width, this.dragBox.height).rotate(-angle);
          const xAxisPoint = pointer.subtract(tl).rotate(-this.dragBox.angle - angle);

          const proportionalScaling = Math.max(xAxisPoint.x / xAxis.x, minSize.x / this.dragBox.width, minSize.y / this.dragBox.height);

          const local = new Point(this.dragBox.width * proportionalScaling, this.dragBox.height * proportionalScaling);

          newDragBox = {
            ...this.dragBox,
            width: local.x,
            height: local.y,
          };

          break;
        }
        case 'bl': {
          const tr = this.dragCoords.tr;

          const minSize = new Point(this.cropCoords.bl).subtract(tr).rotate(-this.dragBox.angle).flipX();

          const localTr = new Point(this.dragBox.width, -this.dragBox.height);
          const angle = Math.asin(this.dragBox.height / localTr.distanceFrom()) / (Math.PI / 180);

          const m = new Point(this.dragBox.width, -this.dragBox.height).rotate(-angle);

          const p = pointer.subtract(tr).rotate(-this.dragBox.angle - angle);

          const ratio = -p.y / m.y;

          const local = new Point(
            -Math.max(this.dragBox.width * ratio, minSize.x, minSize.y),
            Math.max(this.dragBox.height * ratio, minSize.x, minSize.y)
          );

          const pos = new Point(local.x, 0).rotate(this.dragBox.angle).add(tr);

          newDragBox = {
            ...this.dragBox,
            left: pos.x,
            top: pos.y,
            width: Math.abs(local.x),
            height: Math.abs(local.y),
          };

          const crop = pos.subtract(this.cropCoords.tl).rotate(-this.cropBox.angle).flipX().flipY();

          newCropBox = {
            ...this.cropBox,
            cropX: crop.x,
            cropY: crop.y,
          };
          break;
        }
        default:
          break;
      }
    }

    this.newCropBox = newCropBox;
    this.newDragBox = newDragBox;
    this.cropBoxRenderer.render(this.src, newCropBox || this.cropBox, newDragBox || this.dragBox);
    this.dragBoxRenderer.render(this.src, newCropBox || this.cropBox, newDragBox || this.dragBox);
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

  private ok = false;

  crop: CropFunction = async (src, cropBox, dragBox) => {
    this.ok = false;
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
    this.ok = true;
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
