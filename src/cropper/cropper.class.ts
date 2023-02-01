import { CropRenderer } from '../controls/cropRenderer.class';
import { SourceRenderer } from '../controls/sourceRenderer.class';
import { cropScalingHandler } from '../handlers/cropScaling';
import { sourceMovingHandler } from '../handlers/sourceMoving';
import { sourceScalingHandler } from '../handlers/sourceScaling';
import { Point } from '../utils/point.class';
import { createElement, getCoords, setCSSProperties } from '../utils/tools';

import type { CornerType } from '../data.d';
import type { ICropData, ISourceData } from './data.d';
import type { IControlCoords, IControlType } from '../controls/data.d';

interface CropInfo {
  src: string;
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
  private sourceRenderer: SourceRenderer;
  private cropRenderer: CropRenderer;
  private target?: SourceRenderer | CropRenderer;

  element: HTMLDivElement;
  src?: string;
  visible = false;
  containerOffsetX = 0;
  containerOffsetY = 0;

  constructor(private container: HTMLElement, options?: Partial<ImageCropperOptions>) {
    Object.assign(this, options);

    this.element = this.createElement();
    this.sourceRenderer = new SourceRenderer();
    this.cropRenderer = new CropRenderer();
    this.element.append(this.sourceRenderer.element, this.cropRenderer.element);

    container.appendChild(this.element);

    document.addEventListener('mousemove', this.actionHandler);
    document.addEventListener('mouseup', () => {
      this.target = undefined;
      this.action = '';

      this.actionCropData && (this.cropData = this.actionCropData);
      this.actionSourceData && (this.sourceData = this.actionSourceData);

      setCSSProperties(this.container, { cursor: 'default' });
    });
    [this.sourceRenderer, this.cropRenderer].forEach(({ element }) => {
      element.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        const { left, top } = this.element.getBoundingClientRect();

        this.startPoint = new Point(e.clientX - left, e.clientY - top);

        this.action = 'moving';
        this.crop();
      });
    });
    Object.entries(this.sourceRenderer.controls).forEach(([corner, control]) => {
      control.element?.addEventListener('mouseover', () => {
        setCSSProperties(this.container, { cursor: control.cursorStyle });
      });
      control.element?.addEventListener('mouseleave', () => {
        setCSSProperties(this.container, { cursor: 'default' });
      });
      control.element?.addEventListener('mousedown', (e) => {
        e.stopPropagation();

        this.target = this.sourceRenderer;
        this.action = corner;
        this.crop();

        setCSSProperties(this.container, { cursor: control.cursorStyle });
      });
    });
    Object.entries(this.cropRenderer.controls).forEach(([corner, control]) => {
      control.element?.addEventListener('mouseover', () => {
        setCSSProperties(this.container, { cursor: control.cursorStyle });
      });
      control.element?.addEventListener('mouseleave', () => {
        setCSSProperties(this.container, { cursor: 'default' });
      });
      control.element?.addEventListener('mousedown', (e) => {
        e.stopPropagation();

        this.target = this.cropRenderer;
        this.action = corner;
        this.crop();

        setCSSProperties(this.container, { cursor: control.cursorStyle });
      });
    });
  }

  private startPoint?: Point;

  private actionHandler = async (e: MouseEvent) => {
    const action = this.action as CornerType | 'moving';
    if (!action) {
      return;
    }
    const { cropData, cropCoords, sourceData, sourceCoords } = this;

    if (!this.ok || !this.src || !cropData || !sourceData || !cropCoords || !sourceCoords) {
      return;
    }

    const { left, top } = this.element.getBoundingClientRect();
    const pointer = new Point(e.clientX - left, e.clientY - top);

    let actionCropData: ICropData | undefined;
    let actionSourceData: ISourceData | undefined;

    if (action === 'moving') {
      const point = new Point(
        sourceData.left + (pointer.x - (this.startPoint?.x || pointer.x)),
        sourceData.top + (pointer.y - (this.startPoint?.y || pointer.y))
      );
      const data = sourceMovingHandler({ pointer: point, cropData, cropCoords, sourceData });

      actionCropData = data.cropData;
      actionSourceData = data.sourceData;
    } else if (this.target === this.cropRenderer) {
      const data = cropScalingHandler({ pointer, cropData, cropCoords, sourceCoords, corner: this.action as IControlType });

      actionCropData = data.cropData;
    } else if (this.target === this.sourceRenderer) {
      const data = sourceScalingHandler({
        pointer,
        cropData,
        cropCoords,
        sourceData,
        sourceCoords,
        corner: this.action as IControlType,
      });

      actionCropData = data.cropData;
      actionSourceData = data.sourceData;
    }

    this.actionCropData = actionCropData;
    this.actionSourceData = actionSourceData;

    this.cropRenderer.render(this.src, actionCropData || cropData, actionSourceData || sourceData);
    this.sourceRenderer.render(this.src, actionCropData || cropData, actionSourceData || sourceData);
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

  private ok = false;

  private cropData?: ICropData;
  private sourceData?: ISourceData;

  private actionCropData?: ICropData;
  private actionSourceData?: ISourceData;

  private cropDataBackup?: ICropData;
  private sourceDataBackup?: ISourceData;

  private cropCoords?: IControlCoords;
  private sourceCoords?: IControlCoords;

  async crop(): Promise<void>;
  async crop(src: string, cropData: ICropData, sourceData: ISourceData): Promise<void>;
  async crop(src?: string, cropData?: ICropData, sourceData?: ISourceData) {
    this.ok = false;

    if (src && cropData && sourceData) {
      this.src = src;
      this.cropData = { ...(this.cropDataBackup = cropData) };
      this.sourceData = { ...(this.sourceDataBackup = sourceData) };
    }

    if (!this.src || !this.cropData || !this.sourceData) {
      return;
    }

    this.cropCoords = getCoords({
      left: this.cropData.left,
      top: this.cropData.top,
      width: this.cropData.width * this.cropData.scaleX,
      height: this.cropData.height * this.cropData.scaleY,
      angle: this.cropData.angle,
    });

    this.sourceCoords = getCoords({
      left: this.sourceData.left,
      top: this.sourceData.top,
      width: this.sourceData.width * this.cropData.scaleX,
      height: this.sourceData.height * this.cropData.scaleY,
      angle: this.cropData.angle,
    });

    await Promise.all([
      this.cropRenderer.render(this.src, this.cropData, this.sourceData),
      this.sourceRenderer.render(this.src, this.cropData, this.sourceData),
    ]);

    this.show();

    this.ok = true;
  }

  confirm() {
    if (!this.inCroppingState) {
    }

    this.hidden('confirm');
  }

  cancel() {
    this.hidden('cancel');
  }

  onCropChange(callback: CropChangeCallback) {
    this.cropChangeCallbacks.add(callback);
  }
}
