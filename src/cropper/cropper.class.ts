import { CropRenderer } from '../controls/cropRenderer.class';
import { IControlCoords, IControlType } from '../controls/data';
import { SourceRenderer } from '../controls/sourceRenderer';
import { CornerType } from '../data';
import { cropScalingHandlerMap } from '../handlers/cropScaling';
import { sourceMovingHandler } from '../handlers/sourceMoving';
import { sourceScalingHandlerMap } from '../handlers/sourceScaling';
import { IPoint, Point } from '../utils/point.class';
import { convertXYSystem, createElement, getCoords, getZeroCoords, setCSSProperties } from '../utils/tools';
import { ICropData, ISourceData } from './data';

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
  private sourceRenderer: SourceRenderer;
  private cropRenderer: CropRenderer;
  private target?: SourceRenderer | CropRenderer;

  src?: string;
  cropBox?: CropBox;
  sourceBox?: Box;
  cropBoxBackup?: CropBox;
  sourceBoxBackup?: Box;
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

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', () => {
      this.target = undefined;
      this.action = '';

      this.newCropBox && (this.cropBox = this.newCropBox);
      this.newSourceBox && (this.sourceBox = this.newSourceBox);

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
      control.element?.addEventListener('mousedown', (e) => {
        e.stopPropagation();

        this.target = this.sourceRenderer;
        this.action = corner;
        this.crop();

        setCSSProperties(this.container, { cursor: control.cursorStyle });
      });
    });
    Object.entries(this.cropRenderer.controls).forEach(([corner, control]) => {
      control.element?.addEventListener('mousedown', (e) => {
        e.stopPropagation();

        this.target = this.cropRenderer;
        this.action = corner;
        this.crop();

        setCSSProperties(this.container, { cursor: control.cursorStyle });
      });
    });
  }

  private newCropBox: CropBox | undefined;
  private newSourceBox: Box | undefined;

  private startPoint?: Point;

  private handleMouseMove = async (e: MouseEvent) => {
    const { cropData, cropCoords, sourceData, sourceCoords } = this;

    if (!this.ok || !this.src || !cropData || !sourceData || !cropCoords || !sourceCoords) {
      return;
    }

    const action = this.action as CornerType | 'moving';

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
      const data = cropScalingHandlerMap[this.action as IControlType]?.({ pointer, cropData, cropCoords, sourceCoords });

      actionCropData = data.cropData;
    } else if (this.target === this.sourceRenderer) {
      const data = sourceScalingHandlerMap[this.action as IControlType]?.({ pointer, cropData, cropCoords, sourceData, sourceCoords });

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
    const { cropBox, sourceBox } = this;

    if (!cropBox || !sourceBox) {
      throw Error('uninit');
    }

    if (!this.inCroppingState) {
      return { cropBox, sourceBox };
    }

    this.hidden('confirm');

    return { cropBox, sourceBox };
  }

  cancel() {
    if (!this.cropBoxBackup || !this.sourceBoxBackup) {
      throw Error('uninit');
    }

    if (!this.inCroppingState) {
      return { cropBox: this.cropBoxBackup, sourceBox: this.sourceBoxBackup };
    }

    this.hidden('cancel');

    return { cropBox: this.cropBoxBackup, sourceBox: this.sourceBoxBackup };
  }

  onCropChange(callback: CropChangeCallback) {
    this.cropChangeCallbacks.add(callback);
  }
}
