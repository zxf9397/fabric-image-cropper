import type { CSSCursor, IControlCoords, ICropData, IListener, ImageCropperOptions, ISourceData, ISourceTransform } from './data.d';
import type { IControlType, IRenderFunctionParam } from '../controls/data.d';

import {
  ActionName,
  AttributesData,
  DEFAULT_BORDER_COLOR,
  DEFAULT_BORDER_WIDTH,
  DEFAULT_CROPPED_DATA,
  DEFAULT_SOURCE_DATA,
  DEFAULT_SOURCE_TRANSFORM,
} from '../const';
import { CropRenderer } from '../controls/cropRenderer.class';
import { SourceRenderer } from '../controls/sourceRenderer.class';
import { cropScalingHandler } from '../handlers/cropScaling';
import { sourceMovingHandler } from '../handlers/sourceMoving';
import { sourceScalingHandler } from '../handlers/sourceScaling';
import { Angle } from '../utils/angle.class';
import { Point } from '../utils/point.class';
import { Listener } from '../utils/listener.class';
import { getCoords, getPxNumber, pick, setCSSProperties } from '../utils/tools';
import { createElement } from '../utils/createElement';

export class ImageCropper {
  private listener = new Listener<IListener>();
  public get on() {
    return this.listener.on.bind(this.listener);
  }
  public get off() {
    return this.listener.off.bind(this.listener);
  }

  private sourceRenderer = new SourceRenderer();
  private cropRenderer = new CropRenderer();

  private activeCursorStyle: { over?: CSSCursor; down?: CSSCursor } = {};

  private startPoint?: Point;

  private prepared = false;
  private cropping = false;

  private croppedData!: ICropData;
  private sourceData!: ISourceTransform;

  private croppedTransform?: ICropData;
  private sourceTransform?: ISourceTransform;

  private croppedBackup!: ICropData;
  private sourceBackup!: ISourceData;

  private angle!: Angle;
  private croppedControlCoords!: IControlCoords;
  private sourceControlCoords!: IControlCoords;

  private src = '';
  private _element: HTMLDivElement;

  private domListener = {
    'cropper:mouseover': (e: MouseEvent) => {
      e.stopPropagation();

      // update cursor
      this.activeCursorStyle.over = (e.target as HTMLElement | undefined)?.getAttribute(AttributesData.ActionCursor) || '';
      setCSSProperties(this.container, { cursor: this.activeCursorStyle.down || this.activeCursorStyle.over });
    },
    'cropper:mousedown': (e: MouseEvent) => {
      e.stopPropagation();

      // update cursor
      this.activeCursorStyle.down = (e.target as HTMLElement)?.getAttribute(AttributesData.ActionCursor) || '';
      setCSSProperties(this.container, { cursor: this.activeCursorStyle.down });

      // event center
      const actionName = (e.target as HTMLElement | undefined)?.getAttribute(AttributesData.ActionName) as ActionName | null;

      if (actionName && this.eventCenter[actionName]) {
        this.eventCenter[actionName](e);
        this.setCoords();
      } else {
        this.cancel();
      }
    },
    'cropper:dblclick': (e: MouseEvent) => this.confirm(),
    'document:mousemove': (e: MouseEvent) => this.actionHandler(e),
    'document:mouseup': (e: MouseEvent) => {
      this.event = { e };

      if (this.croppedTransform) {
        this.croppedData = { ...this.croppedTransform };
        delete this.croppedTransform;
      }

      if (this.sourceTransform) {
        this.sourceData = { ...this.sourceTransform };
        delete this.sourceTransform;
      }

      // update cursor
      this.activeCursorStyle.down = '';
      setCSSProperties(this.container, { cursor: this.activeCursorStyle.down || this.activeCursorStyle.over });
    },
  };

  private eventCenter: Record<ActionName, (e: MouseEvent) => void> = {
    move: (e) => {
      this.startPoint = this.getPointer(e);
      this.event = { e, action: ActionName.Moving };
    },
    scale: (e) => {
      this.event = {
        e,
        action: ActionName.Scaling,
        corner: (e.target as HTMLElement | undefined)?.getAttribute(AttributesData.ActionCorner) as IControlType,
        target: this.sourceRenderer,
      };
    },
    crop: (e) => {
      this.event = {
        e,
        action: ActionName.Cropping,
        corner: (e.target as HTMLElement | undefined)?.getAttribute(AttributesData.ActionCorner) as IControlType,
        target: this.sourceRenderer,
      };
    },
    moving: () => {},
    scaling: () => {},
    cropping: () => {},
  };

  public get element() {
    return this._element;
  }
  public containerOffsetX = 0;
  public containerOffsetY = 0;
  public borderWidth = DEFAULT_BORDER_WIDTH;
  public borderColor = DEFAULT_BORDER_COLOR;
  public cancelable = true;
  public set scale(value: number) {
    this.cropRenderer.scale = this.sourceRenderer.scale = value;

    if (this.cropping) {
      const payload: IRenderFunctionParam = {
        src: this.src,
        angle: this.angle,
        croppedData: this.croppedData,
        croppedBackup: this.croppedBackup,
        sourceData: this.sourceData,
        sourceBackup: this.sourceBackup,
      };
      this.cropRenderer.render(payload);
      this.sourceRenderer.render(payload);
    }
  }

  private event?: { e: MouseEvent; action?: string; corner?: IControlType; target?: SourceRenderer | CropRenderer };

  constructor(private container: HTMLElement, options?: Partial<ImageCropperOptions>) {
    Object.assign(this, options);

    this.cropRenderer.borderWidth = this.sourceRenderer.borderWidth = this.borderWidth || DEFAULT_BORDER_WIDTH;
    this.cropRenderer.borderColor = this.sourceRenderer.borderColor = this.borderColor || DEFAULT_BORDER_COLOR;

    this._element = this.createElement();
    this._element.append(this.sourceRenderer.element, this.cropRenderer.element);
    container.appendChild(this._element);

    this.bindEvents();
  }

  private bindEvents() {
    this._element.addEventListener('mouseover', this.domListener['cropper:mouseover']);
    this._element.addEventListener('mousedown', this.domListener['cropper:mousedown']);
    this._element.addEventListener('dblclick', this.domListener['cropper:dblclick']);
    document.addEventListener('mousemove', this.domListener['document:mousemove']);
    document.addEventListener('mouseup', this.domListener['document:mouseup']);
  }

  private unbindEvents() {
    this._element.removeEventListener('mouseover', this.domListener['cropper:mouseover']);
    this._element.removeEventListener('mousedown', this.domListener['cropper:mousedown']);
    this._element.removeEventListener('dblclick', this.domListener['cropper:dblclick']);
    document.removeEventListener('mousemove', this.domListener['document:mousemove']);
    document.removeEventListener('mouseup', this.domListener['document:mouseup']);
  }

  public remove() {
    this.unbindEvents();
    this.element.remove();
  }

  private getPointer(e: MouseEvent) {
    const rect = this._element.getBoundingClientRect();
    const style = window.getComputedStyle(this._element);

    const scaleX = rect.width ? getPxNumber(style.width) / rect.width : 1;
    const scaleY = rect.height ? getPxNumber(style.height) / rect.height : 1;

    return new Point((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  }

  private actionHandler = async (e: MouseEvent) => {
    const { action, corner } = this.event || {};
    if (!action || !this.prepared) {
      return;
    }
    const { croppedData, croppedControlCoords, sourceData, sourceControlCoords } = this;

    const pointer = this.getPointer(e);

    let croppedTransform: ICropData | undefined;
    let sourceTransform: ISourceTransform | undefined;

    if (action === ActionName.Moving) {
      const point = new Point(
        sourceData.left + (pointer.x - (this.startPoint?.x || pointer.x)),
        sourceData.top + (pointer.y - (this.startPoint?.y || pointer.y))
      );

      const data = sourceMovingHandler({ pointer: point, croppedData, croppedControlCoords, sourceData });
      croppedTransform = data.croppedData;
      sourceTransform = data.sourceData;
    } else if (action === ActionName.Cropping && corner) {
      const data = cropScalingHandler({ pointer, croppedData, croppedControlCoords, sourceData, sourceControlCoords, corner });
      croppedTransform = data.croppedData;
    } else if (action === ActionName.Scaling && corner) {
      const data = sourceScalingHandler({ pointer, croppedData, croppedControlCoords, sourceData, sourceControlCoords, corner });
      croppedTransform = data.croppedData;
      sourceTransform = data.sourceData;
    }

    this.croppedTransform = croppedTransform;
    this.sourceTransform = sourceTransform;

    const renderData: IRenderFunctionParam = {
      src: this.src,
      croppedData: croppedTransform || croppedData,
      sourceData: sourceTransform || sourceData,
      angle: this.angle,
      croppedBackup: this.croppedBackup,
      sourceBackup: this.sourceBackup,
    };

    await Promise.all([this.cropRenderer.render(renderData), this.sourceRenderer.render(renderData)]);

    const newCropData = pick(DEFAULT_CROPPED_DATA, croppedTransform || croppedData);
    const newSourceData = pick(DEFAULT_SOURCE_TRANSFORM, sourceTransform || sourceData);

    if (newCropData.flipX) {
      newCropData.cropX = newSourceData.width - newCropData.width - newCropData.cropX;
    }
    if (newCropData.flipY) {
      newCropData.cropY = newSourceData.height - newCropData.height - newCropData.cropY;
    }

    this.listener.fire('cropping', newCropData, newSourceData);
  };

  private createElement() {
    const { borderLeftWidth, borderTopWidth, border, width, height, position } = window.getComputedStyle(this.container);

    return createElement('div', {
      classList: ['ic-container'],
      style: {
        display: this.cancelable ? 'none' : 'block',
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

  private setCropperVisibility(visible: boolean) {
    setCSSProperties(this._element, { display: this.cancelable ? (visible ? 'block' : 'none') : 'block' });
  }

  public setData(src: string, cropData: ICropData, sourceData: ISourceData) {
    this.src = src;

    this.croppedBackup = pick(DEFAULT_CROPPED_DATA, cropData);
    this.sourceBackup = pick(DEFAULT_SOURCE_DATA, sourceData);

    this.croppedData = pick(DEFAULT_CROPPED_DATA, cropData);
    this.sourceData = pick(DEFAULT_SOURCE_TRANSFORM, sourceData);

    this.angle = new Angle(this.croppedData.angle);

    const { cropX, cropY, scaleX, scaleY, angle, flipX, flipY, left, top } = this.croppedData;

    this.croppedData.cropX = flipX ? this.sourceData.width - this.croppedData.width - cropX : cropX;
    this.croppedData.cropY = flipY ? this.sourceData.height - this.croppedData.height - cropY : cropY;

    const sourcePosition = new Point(-this.croppedData.cropX * scaleX, -this.croppedData.cropY * scaleY).rotate(angle).add({ x: left, y: top });
    this.sourceData.left = sourcePosition.x;
    this.sourceData.top = sourcePosition.y;
  }

  private async setCoords() {
    this.croppedControlCoords = getCoords(this.croppedData);

    this.sourceControlCoords = getCoords({
      ...this.sourceData,
      scaleX: this.croppedData.scaleX,
      scaleY: this.croppedData.scaleY,
      angle: this.croppedData.angle,
    });

    const payload: IRenderFunctionParam = {
      src: this.src,
      angle: this.angle,
      croppedData: this.croppedData,
      croppedBackup: this.croppedBackup,
      sourceData: this.sourceData,
      sourceBackup: this.sourceBackup,
    };

    return Promise.all([this.cropRenderer.render(payload), this.sourceRenderer.render(payload)]);
  }

  /**
   * Get the coordinates of the original image and other information
   */
  public static getSource(cropped: ICropData, source: ISourceData) {
    let { cropX, cropY, scaleX, scaleY, angle, flipX, flipY, left, top } = cropped;

    cropX = flipX ? source.width - cropped.width - cropX : cropX;
    cropY = flipY ? source.height - cropped.height - cropY : cropY;

    const { x, y } = new Point(-cropX * scaleX, -cropY * scaleY).rotate(angle).add({ x: left, y: top });

    return { angle, left: x, top: y, width: source.width, height: source.height, scaleX, scaleY, flipX, flipY };
  }

  /**
   * Start cropping
   */
  public async crop(data?: { src?: string; cropData?: ICropData; sourceData?: ISourceData }) {
    this.prepared = false;
    this.cropping = true;

    this.setData(data?.src || this.src, data?.cropData || this.croppedData, data?.sourceData || this.sourceData);

    await this.setCoords();

    this.setCropperVisibility(true);

    this.listener.fire('start');

    this.prepared = true;
  }

  /**
   * Confirm cropping
   */
  public confirm() {
    const newCropData = this.croppedData;
    const newSourceData = this.sourceData;
    if (newCropData.flipX) {
      newCropData.cropX = newSourceData.width - newCropData.width - newCropData.cropX;
    }
    if (newCropData.flipY) {
      newCropData.cropY = newSourceData.height - newCropData.height - newCropData.cropY;
    }

    this.listener.fire('confirm', pick(DEFAULT_CROPPED_DATA, newCropData), pick(DEFAULT_SOURCE_DATA, newSourceData));
    this.listener.fire('end', pick(DEFAULT_CROPPED_DATA, newCropData), pick(DEFAULT_SOURCE_DATA, newSourceData));

    this.setCropperVisibility(false);
    this.cropping = false;
  }

  /**
   * Cancel cropping
   */
  public cancel() {
    this.listener.fire('cancel', pick(DEFAULT_CROPPED_DATA, this.croppedBackup), pick(DEFAULT_SOURCE_DATA, this.sourceBackup));
    this.listener.fire('end', pick(DEFAULT_CROPPED_DATA, this.croppedBackup), pick(DEFAULT_SOURCE_DATA, this.sourceBackup));

    this.setCropperVisibility(false);
    this.cropping = false;
  }
}
