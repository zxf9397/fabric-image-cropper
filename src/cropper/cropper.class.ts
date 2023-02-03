import { CropRenderer } from '../controls/cropRenderer.class';
import { SourceRenderer } from '../controls/sourceRenderer.class';
import { cropScalingHandler } from '../handlers/cropScaling';
import { sourceMovingHandler } from '../handlers/sourceMoving';
import { sourceScalingHandler } from '../handlers/sourceScaling';
import { Point } from '../utils/point.class';
import { clamp, createElement, getCoords, setCSSProperties } from '../utils/tools';

import type { CSSCursor, ICropData, ISourceData } from './data.d';
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

interface IActionHandler {
  (cropData: ICropData, sourceData: ISourceData): void;
}

function getPxStyleNumber(px: string) {
  return +(px.match(/(\d*.?\d*)px/)?.[1] || 0);
}

export class ImageCropper {
  private cropChangeCallbacks = new Set<CropChangeCallback>();
  private actionHandlerCallbacks = new Set<IActionHandler>();
  private sourceRenderer: SourceRenderer;
  private cropRenderer: CropRenderer;

  private actionCursor: { over?: CSSCursor; down?: CSSCursor } = {};

  private startPoint?: Point;

  private ok = false;

  private cropData?: ICropData;
  private sourceData?: ISourceData;

  private actionCropData?: ICropData;
  private actionSourceData?: ISourceData;

  private cropDataBackup!: ICropData;
  private sourceDataBackup!: ISourceData;

  private cropCoords?: IControlCoords;
  private sourceCoords?: IControlCoords;

  element: HTMLDivElement;
  src?: string;
  visible = false;
  containerOffsetX = 0;
  containerOffsetY = 0;

  private event?: { e: MouseEvent; action?: string; corner?: IControlType; target?: SourceRenderer | CropRenderer };

  constructor(private container: HTMLElement, options?: Partial<ImageCropperOptions>) {
    Object.assign(this, options);

    this.element = this.createElement();
    this.sourceRenderer = new SourceRenderer();
    this.cropRenderer = new CropRenderer();
    this.element.append(this.sourceRenderer.element, this.cropRenderer.element);

    container.appendChild(this.element);

    this.element.addEventListener('mouseover', (e) => {
      e.stopPropagation();

      this.actionCursor.over = (e.target as HTMLElement)?.getAttribute('data-action-cursor') || '';
      setCSSProperties(this.container, { cursor: this.actionCursor.down || this.actionCursor.over });
    });
    this.element.addEventListener('mousedown', (e) => {
      e.stopPropagation();

      this.actionCursor.down = (e.target as HTMLElement)?.getAttribute('data-action-cursor') || '';
      setCSSProperties(this.container, { cursor: this.actionCursor.down });

      const actionName = (e.target as HTMLElement)?.getAttribute('data-action-name');

      if (actionName === 'move') {
        this.startPoint = this.getPointer(e);

        this.event = { e, action: 'moving' };
        this.crop();
      } else if (actionName === 'scale') {
        const corner = (e.target as HTMLElement)?.getAttribute('data-scale-corner');

        this.event = { e: e, action: 'scale', corner: corner as IControlType, target: this.sourceRenderer };
        this.crop();
      } else if (actionName === 'crop') {
        const corner = (e.target as HTMLElement)?.getAttribute('data-crop-corner');

        this.event = { e: e, action: 'scale', corner: corner as IControlType, target: this.cropRenderer };
        this.crop();
      } else {
        this.cancel();
      }
    });
    this.element.addEventListener('dblclick', () => {
      this.confirm();
    });
    this.element.addEventListener('mouseup', () => {
      this.actionCursor.down = '';
      setCSSProperties(this.container, { cursor: this.actionCursor.down || this.actionCursor.over });
    });

    document.addEventListener('mousemove', this.actionHandler);
    document.addEventListener('mouseup', (e) => {
      this.event = { e };
      this.actionCropData && (this.cropData = this.actionCropData);
      this.actionSourceData && (this.sourceData = this.actionSourceData);
    });
  }

  private getPointer(e: MouseEvent) {
    const rect = this.element.getBoundingClientRect();
    const style = window.getComputedStyle(this.element);

    const scaleX = rect.width ? getPxStyleNumber(style.width) / rect.width : 1;
    const scaleY = rect.height ? getPxStyleNumber(style.height) / rect.height : 1;

    return new Point((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  }

  private actionHandler = async (e: MouseEvent) => {
    const { action, target, corner } = this.event || {};
    if (!action) {
      return;
    }
    const { cropData, cropCoords, sourceData, sourceCoords } = this;

    if (!this.ok || !this.src || !cropData || !sourceData || !cropCoords || !sourceCoords) {
      return;
    }

    const pointer = this.getPointer(e);

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
    } else if (action === 'scale' && corner) {
      if (target === this.cropRenderer) {
        const data = cropScalingHandler({ pointer, cropData, cropCoords, sourceCoords, corner });

        actionCropData = data.cropData;
      } else if (target === this.sourceRenderer) {
        const data = sourceScalingHandler({ pointer, cropData, cropCoords, sourceData, sourceCoords, corner });

        actionCropData = data.cropData;
        actionSourceData = data.sourceData;
      }
    }

    this.actionCropData = actionCropData;
    this.actionSourceData = actionSourceData;

    this.cropRenderer.render(this.src, actionCropData || cropData, actionSourceData || sourceData);
    this.sourceRenderer.render(this.src, actionCropData || cropData, actionSourceData || sourceData);

    this.actionHandlerCallbacks.forEach((callback) => callback(actionCropData || cropData, actionSourceData || sourceData));
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
    this.cropChangeCallbacks.forEach((callback) => callback(true, 'crop'));
  }

  private hidden(type: CropEnd) {
    setCSSProperties(this.element, { display: 'none' });
    this.cropChangeCallbacks.forEach((callback) => callback(false, type));
  }

  async crop(): Promise<void>;
  async crop(src: string, cropData: ICropData, sourceData: ISourceData): Promise<void>;
  async crop(src?: string, cropData?: ICropData, sourceData?: ISourceData) {
    this.ok = false;

    if (src && cropData && sourceData) {
      this.src = src;
      this.cropData = { ...(this.cropDataBackup = { ...cropData }) };
      this.sourceData = { ...(this.sourceDataBackup = { ...sourceData }) };
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
    this.hidden('confirm');
  }

  cancel() {
    this.hidden('cancel');

    this.actionHandlerCallbacks.forEach((callback) => callback(this.cropDataBackup, this.sourceDataBackup));
  }

  onCropChange(callback: CropChangeCallback) {
    this.cropChangeCallbacks.add(callback);
  }

  onCrop(callback: IActionHandler) {
    this.actionHandlerCallbacks.add(callback);
  }
}
