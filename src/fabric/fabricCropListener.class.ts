import type { fabric } from 'fabric';
import { ImageCropper } from '../cropper/cropper.class';

import '../styles/style.css';

function isFabricImage(object: fabric.Object): object is Required<fabric.Image> {
  return object.type === 'image';
}

export class FabricCropListener {
  private canvas?: fabric.Canvas;
  private cropper?: ImageCropper;

  private cropTarget?: fabric.Image;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;

    this.init();
  }

  private init() {
    if (this.canvas) {
      this.cropper = new ImageCropper(this.canvas.wrapperEl, { containerOffsetX: 2, containerOffsetY: 2 });
      this.cropper.element.style.transform = 'translateX(100%)';

      this.canvas?.on('mouse:dblclick', this.crop);

      this.cropper.onCrop((crop, source) => {
        if (this.cropTarget) {
          this.cropTarget?.set({ ...crop, cropX: crop.cropX, cropY: crop.cropY });
          this.cropTarget._cropSource = source;

          this.canvas?.renderAll();
        }
      });
    }
  }

  dispose(canvas?: fabric.Canvas) {
    this.canvas?.off('mouse:dblclick', this.crop);
    this.canvas = canvas;

    this.init();
  }

  crop = () => {
    const actice = this.canvas?.getActiveObject();

    if (!actice || !this.cropper || !isFabricImage(actice)) {
      return;
    }

    this.cropTarget = actice;

    this.cropper.crop(actice.getSrc(), actice, actice._cropSource || actice);
  };

  confirm() {}

  cancel() {}
}
