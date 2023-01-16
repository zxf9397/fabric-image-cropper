import { CropBoxRenderer } from '../controls/cropBoxRenderer';
import { SourceBoxRenderer } from '../controls/sourceBoxRenderer';
import { CornerType } from '../data';
import { cropScalingHandlerMap } from '../handlers/cropScaling';
import { sourceMovingHandler } from '../handlers/sourceMoving';
import { sourceScalingHandlerMap } from '../handlers/sourceScaling';
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
  sourceBox: Box;
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

interface CroppingCallbacks {
  (box: { cropBox: CropBox; sourceBox: Box }): void;
}

export class ImageCropper {
  private inCroppingState = false;
  private action = '';
  private cropChangeCallbacks = new Set<CropChangeCallback>();
  element: HTMLDivElement;
  private sourceBoxRenderer: SourceBoxRenderer;
  private cropBoxRenderer: CropBoxRenderer;
  private target?: SourceBoxRenderer | CropBoxRenderer;

  src?: string;
  cropBox?: CropBox;
  sourceBox?: Box;
  visible = false;
  containerOffsetX = 0;
  containerOffsetY = 0;

  constructor(private container: HTMLElement, options?: Partial<ImageCropperOptions>) {
    Object.assign(this, options);

    this.element = this.createElement();
    this.sourceBoxRenderer = new SourceBoxRenderer();
    this.cropBoxRenderer = new CropBoxRenderer();
    this.element.append(this.sourceBoxRenderer.element, this.cropBoxRenderer.element);

    container.appendChild(this.element);

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', () => {
      this.target = undefined;
      this.action = '';

      this.newCropBox && (this.cropBox = this.newCropBox);
      this.newSourceBox && (this.sourceBox = this.newSourceBox);

      setCSSProperties(this.container, { cursor: 'default' });
    });
    [this.sourceBoxRenderer, this.cropBoxRenderer].forEach(({ element }) => {
      element.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        const { left, top } = this.element.getBoundingClientRect();

        this.startPoint = new Point(e.clientX - left, e.clientY - top);

        this.action = 'moving';
        this.crop();
      });
    });
    Object.entries(this.sourceBoxRenderer.controls).forEach(([corner, control]) => {
      control.element?.addEventListener('mousedown', (e) => {
        e.stopPropagation();

        this.target = this.sourceBoxRenderer;
        this.action = corner;
        this.crop();

        setCSSProperties(this.container, { cursor: control.cursorStyle });
      });
    });
    Object.entries(this.cropBoxRenderer.controls).forEach(([corner, control]) => {
      control.element?.addEventListener('mousedown', (e) => {
        e.stopPropagation();

        this.target = this.cropBoxRenderer;
        this.action = corner;
        this.crop();

        setCSSProperties(this.container, { cursor: control.cursorStyle });
      });
    });
  }

  private cropCoords?: Record<CornerType, IPoint>;
  private sourceCoords?: Record<CornerType, IPoint>;
  private newCropBox: CropBox | undefined;
  private newSourceBox: Box | undefined;

  private startPoint?: Point;

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.ok || !this.action || !this.src || !this.cropBox || !this.sourceBox || !this.cropCoords || !this.sourceCoords) {
      return;
    }

    const { left, top } = this.element.getBoundingClientRect();

    const action = this.action as CornerType | 'moving';
    const pointer = new Point(e.clientX - left, e.clientY - top);
    const angle = this.cropBox.angle;
    const { cropCoords, sourceCoords, cropBox, sourceBox } = this;

    let newCropBox: CropBox = this.cropBox;
    let newSourceBox: Box = this.sourceBox;

    if (action === 'moving') {
      const point = new Point(
        sourceBox.left + (pointer.x - (this.startPoint?.x || pointer.x)),
        sourceBox.top + (pointer.y - (this.startPoint?.y || pointer.y))
      );

      const box = sourceMovingHandler({ pointer: point, angle, cropBox, cropCoords, sourceBox });
      newCropBox = box.cropBox;
      newSourceBox = box.sourceBox;
    } else if (this.target === this.cropBoxRenderer) {
      const box = cropScalingHandlerMap[action]?.({ pointer, angle, cropCoords, sourceCoords, cropBox });
      newCropBox = box.cropBox;
    } else if (this.target === this.sourceBoxRenderer) {
      const box = sourceScalingHandlerMap[action]?.({ pointer, angle, cropCoords, sourceCoords, cropBox, sourceBox });
      newCropBox = box.cropBox;
      newSourceBox = box.sourceBox;
    }

    this.newCropBox = newCropBox;
    this.newSourceBox = newSourceBox;
    this.cropBoxRenderer.render(this.src, newCropBox || this.cropBox, newSourceBox || this.sourceBox);
    this.sourceBoxRenderer.render(this.src, newCropBox || this.cropBox, newSourceBox || this.sourceBox);

    this.fireOnCrop(newCropBox, newSourceBox);
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

  private croppingCallbacks = new Set<CroppingCallbacks>();
  onCrop = (callback: CroppingCallbacks) => {
    this.croppingCallbacks.add(callback);
  };

  private fireOnCrop(cropBox: CropBox, sourceBox: Box) {
    this.croppingCallbacks.forEach((callback) => callback({ cropBox, sourceBox }));
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

  crop = async (src?: string, cropBox?: CropBox, sourceBox?: Box) => {
    this.ok = false;
    this.src = src || this.src;
    this.cropBox = cropBox || this.cropBox;
    this.sourceBox = sourceBox || this.sourceBox;

    if (!this.src || !this.cropBox || !this.sourceBox) {
      return;
    }

    this.cropCoords = getCoords(this.cropBox);

    this.sourceCoords = getCoords(this.sourceBox);

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
      this.sourceBoxRenderer.render(this.src, this.cropBox, this.sourceBox),
      this.cropBoxRenderer.render(this.src, this.cropBox, this.sourceBox),
    ]);

    this.show();
    this.ok = true;
  };

  confirm = () => {
    const { cropBox, sourceBox } = this;

    if (!cropBox || !sourceBox) {
      throw Error('uninit');
    }

    if (!this.inCroppingState) {
      return { cropBox, sourceBox };
    }

    this.hidden('confirm');

    return { cropBox, sourceBox };
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
