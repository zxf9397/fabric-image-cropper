import { CropRenderer } from '../controls/cropRenderer.class';
import { SourceRenderer } from '../controls/sourceRenderer.class';
import { cropScalingHandler } from '../handlers/cropScaling';
import { sourceMovingHandler } from '../handlers/sourceMoving';
import { sourceScalingHandler } from '../handlers/sourceScaling';
import { Angle } from '../utils/angle.class';
import { Point } from '../utils/point.class';
import { createElement, getCoords, setCSSProperties } from '../utils/tools';

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
  private cropConfirmCallbacks = new Set<IActionHandler>();
  private cropCancelCallbacks = new Set<IActionHandler>();

  private sourceRenderer = new SourceRenderer();
  private cropRenderer = new CropRenderer();

  private actionCursor: { over?: CSSCursor; down?: CSSCursor } = {};

  private startPoint?: Point;

  private cropStarted = false;

  private cropData!: ICropData;
  private sourceData!: ISourceData;

  private actionCropData?: ICropData;
  private actionSourceData?: ISourceData;

  private cropDataBackup!: ICropData;
  private sourceDataBackup!: ISourceData;

  private cropCoords!: IControlCoords;
  private sourceCoords!: IControlCoords;
  private angle!: Angle;

  private src = '';
  private _element: HTMLDivElement;
  public get element() {
    return this._element;
  }
  public containerOffsetX = 0;
  public containerOffsetY = 0;
  public visible = false;

  private event?: { e: MouseEvent; action?: string; corner?: IControlType; target?: SourceRenderer | CropRenderer };

  constructor(private container: HTMLElement, options?: Partial<ImageCropperOptions>) {
    Object.assign(this, options);

    this._element = this.createElement();
    this._element.append(this.sourceRenderer.element, this.cropRenderer.element);
    container.appendChild(this._element);

    this._element.addEventListener('mouseover', (e) => {
      e.stopPropagation();

      this.actionCursor.over = (e.target as HTMLElement)?.getAttribute('data-action-cursor') || '';
      setCSSProperties(this.container, { cursor: this.actionCursor.down || this.actionCursor.over });
    });
    this._element.addEventListener('mousedown', (e) => {
      e.stopPropagation();

      this.actionCursor.down = (e.target as HTMLElement)?.getAttribute('data-action-cursor') || '';
      setCSSProperties(this.container, { cursor: this.actionCursor.down });

      const actionName = (e.target as HTMLElement)?.getAttribute('data-action-name');

      if (actionName === 'move') {
        this.startPoint = this.getPointer(e);

        this.event = { e, action: 'moving' };
        this.setCoords();
      } else if (actionName === 'scale') {
        const corner = (e.target as HTMLElement)?.getAttribute('data-scale-corner');

        this.event = { e: e, action: 'scale', corner: corner as IControlType, target: this.sourceRenderer };
        this.setCoords();
      } else if (actionName === 'crop') {
        const corner = (e.target as HTMLElement)?.getAttribute('data-crop-corner');

        this.event = { e: e, action: 'scale', corner: corner as IControlType, target: this.cropRenderer };
        this.setCoords();
      } else {
        this.cancel();
      }
    });
    this._element.addEventListener('dblclick', () => {
      this.confirm();
    });
    this._element.addEventListener('mouseup', () => {
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
    const rect = this._element.getBoundingClientRect();
    const style = window.getComputedStyle(this._element);

    const scaleX = rect.width ? getPxStyleNumber(style.width) / rect.width : 1;
    const scaleY = rect.height ? getPxStyleNumber(style.height) / rect.height : 1;

    return new Point((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  }

  private actionHandler = async (e: MouseEvent) => {
    const { action, target, corner } = this.event || {};
    if (!action || !this.cropStarted) {
      return;
    }
    const { cropData, cropCoords, sourceData, sourceCoords } = this;

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
        const data = cropScalingHandler({ pointer, cropData, cropCoords, sourceData, sourceCoords, corner });

        actionCropData = data.cropData;
      } else if (target === this.sourceRenderer) {
        const data = sourceScalingHandler({ pointer, cropData, cropCoords, sourceData, sourceCoords, corner });

        actionCropData = data.cropData;
        actionSourceData = data.sourceData;
      }
    }

    this.actionCropData = actionCropData;
    this.actionSourceData = actionSourceData;

    await Promise.all([
      this.cropRenderer.render(this.src, actionCropData || cropData, actionSourceData || sourceData, this.angle, this.cropDataBackup),
      this.sourceRenderer.render(this.src, actionCropData || cropData, actionSourceData || sourceData, this.angle),
    ]);

    const newCropData = { ...(actionCropData || cropData) };
    const newSourceData = { ...(actionSourceData || sourceData) };

    if (newCropData.flipX) {
      newCropData.cropX = newSourceData.width - newCropData.width - newCropData.cropX;
    }
    if (newCropData.flipY) {
      newCropData.cropY = newSourceData.height - newCropData.height - newCropData.cropY;
    }

    this.actionHandlerCallbacks.forEach((callback) => callback(newCropData, newSourceData));
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

  private cropStart() {
    setCSSProperties(this._element, { display: 'block' });
    this.cropChangeCallbacks.forEach((callback) => callback(true, 'crop'));
  }

  private cropEnd(type: CropEnd) {
    if (!this.visible) {
      setCSSProperties(this._element, { display: 'none' });
    }
    this.cropChangeCallbacks.forEach((callback) => callback(false, type));
  }

  public setData(src: string, cropData: ICropData, sourceData: ISourceData) {
    this.src = src;

    this.cropDataBackup = { ...cropData };
    this.cropData = { ...cropData };

    this.sourceDataBackup = { ...sourceData };
    this.sourceData = { ...sourceData };

    this.angle = new Angle(this.cropData.angle);

    const { cropX, cropY, scaleX, scaleY, angle, flipX, flipY, left, top } = this.cropData;

    this.cropData.cropX = flipX ? this.sourceData.width - this.cropData.width - cropX : cropX;
    this.cropData.cropY = flipY ? this.sourceData.height - this.cropData.height - cropY : cropY;

    const sourcePosition = new Point(-this.cropData.cropX * scaleX, -this.cropData.cropY * scaleY).rotate(angle).add({ x: left, y: top });
    this.sourceData.left = sourcePosition.x;
    this.sourceData.top = sourcePosition.y;
  }

  private async setCoords() {
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

    return Promise.all([
      this.cropRenderer.render(this.src, this.cropData, this.sourceData, this.angle, this.cropDataBackup),
      this.sourceRenderer.render(this.src, this.cropData, this.sourceData, this.angle),
    ]);
  }

  public async crop(): Promise<void>;
  public async crop(src: string, cropData: ICropData, sourceData: ISourceData): Promise<void>;
  public async crop(src?: string, cropData?: ICropData, sourceData?: ISourceData) {
    this.cropStarted = false;

    this.setData(src || this.src, cropData || this.cropData, sourceData || this.sourceData);

    await this.setCoords();

    this.cropStart();

    this.cropStarted = true;
  }

  public confirm() {
    this.cropEnd('confirm');

    this.cropConfirmCallbacks.forEach((callback) => callback(this.cropData, this.sourceData));
  }

  public cancel() {
    this.cropEnd('cancel');

    this.cropCancelCallbacks.forEach((callback) => callback(this.cropDataBackup, this.sourceDataBackup));
  }

  public onCropChange(callback: CropChangeCallback) {
    this.cropChangeCallbacks.add(callback);
  }

  public onCrop(callback: IActionHandler) {
    this.actionHandlerCallbacks.add(callback);
  }

  public onCropConfirm(callback: IActionHandler) {
    this.cropConfirmCallbacks.add(callback);
  }

  public onCropCancel(callback: IActionHandler) {
    this.cropCancelCallbacks.add(callback);
  }
}
