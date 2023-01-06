import { CropBoxRenderer } from '../controls/cropBoxRenderer';
import { DragBoxRenderer } from '../controls/dragBoxRenderer';
import { createElement, setCSSProperties } from '../utils/tools';

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
  private actionStarted = false;
  private cropChangeCallbacks = new Set<CropChangeCallback>();
  private element: HTMLDivElement;
  private dragBoxRenderer: DragBoxRenderer;
  private cropBoxRenderer: CropBoxRenderer;

  src?: string;
  cropBox?: Box;
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
  }

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.actionStarted) {
      return;
    }
    console.log(e);
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
    this.cropChangeCallbacks.forEach((callback) => callback(true, type));
  }

  dispose = () => {
    this.element.remove();
  };

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
