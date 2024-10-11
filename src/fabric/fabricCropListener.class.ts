import { ImageCropper } from '../cropper/cropper.class';
import { fabric } from 'fabric';

import type { ImageCropperOptions } from '../cropper/data.d';

import '../styles/style.css';

function isFabricImage(object: fabric.Object): object is Required<fabric.Image> {
  return object.type === 'image';
}

export class FabricCropListener {
  private canvas?: fabric.Canvas;
  private cropper!: ImageCropper;
  private cropTarget?: fabric.Image;

  public get on() {
    return this.cropper.on;
  }

  public get off() {
    return this.cropper.off;
  }

  constructor(canvas: fabric.Canvas, options?: ImageCropperOptions) {
    this.canvas = canvas;

    this.init(options);
  }

  private init(options?: ImageCropperOptions) {
    if (this.canvas) {
      this.cropper = new ImageCropper(this.canvas.wrapperEl, options);

      this.canvas?.on('mouse:dblclick', this.crop);

      this.cropper.on('cropping', (crop, source) => {
        if (this.cropTarget) {
          this.cropTarget.set({ ...crop, cropX: crop.cropX, cropY: crop.cropY });
          this.cropTarget._cropSource = source;

          this.canvas?.renderAll();
        }
      });

      this.cropper.on('cancel', (crop) => {
        this.cropTarget?.set({ ...crop, cropX: crop.cropX, cropY: crop.cropY });

        this.canvas?.renderAll();
      });

      this.cropper.on('start', () => {
        this.canvas?.discardActiveObject();
        this.canvas?.renderAll();
      });

      this.cropper.on('end', () => {
        this.cropTarget && this.canvas?.setActiveObject(this.cropTarget);
        this.canvas?.renderAll();
      });
    }
  }

  public dispose(canvas?: fabric.Canvas) {
    this.canvas?.off('mouse:dblclick', this.crop);
    this.canvas = canvas;

    this.init();
  }

  public remove() {
    this.canvas?.off('mouse:dblclick', this.crop);
    this.cropper?.off();
    this.cropper?.remove();
  }

  public crop = () => {
    const actice = this.canvas?.getActiveObject();

    if (!actice || !this.cropper || !isFabricImage(actice)) {
      return;
    }

    this.cropTarget = actice;

    const object = actice.toObject();

    this.cropper.crop({ src: actice.getSrc(), cropData: object, sourceData: actice._cropSource || object });
  };

  public confirm() {
    this.cropper?.confirm();
  }

  public cancel() {
    this.cropper?.cancel();
  }
}
