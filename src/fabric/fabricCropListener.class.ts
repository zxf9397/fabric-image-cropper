import type { fabric } from 'fabric';
import { ImageCropper } from '../cropper/cropper.class';

import '../styles/style.css';

function isFabricImage(object: fabric.Object): object is Required<fabric.Image> {
  return object.type === 'image';
}

export class FabricCropListener {
  private canvas?: fabric.Canvas;
  private cropper?: ImageCropper;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;

    this.init();
  }

  private init() {
    if (this.canvas) {
      this.cropper = new ImageCropper(this.canvas.wrapperEl, { containerOffsetX: 2, containerOffsetY: 2 });
      this.cropper.element.style.transform = 'translateX(100%)';

      this.canvas?.on('mouse:dblclick', this.crop);
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

    const cropBox = {
      left: actice.left,
      top: actice.top,
      width: actice.getScaledWidth(),
      height: actice.getScaledHeight(),
      angle: actice.angle,
      cropX: actice.cropX * actice.scaleX,
      cropY: actice.cropY * actice.scaleY,
    };

    const sourceBox = {
      left: actice.left,
      top: actice.top,
      width: actice.getScaledWidth(),
      height: actice.getScaledHeight(),
      angle: actice.angle,
    };

    this.cropper.crop(
      actice.getSrc(),
      {
        angle: actice.angle,
        left: actice.left,
        top: actice.top,
        width: actice.width,
        height: actice.height,
        scaleX: actice.scaleX,
        scaleY: actice.scaleY,
        flipX: actice.flipX,
        flipY: actice.flipY,
        cropX: actice.cropX,
        cropY: actice.cropY,
      },
      {
        left: actice.left,
        top: actice.top,
        width: actice.width,
        height: actice.height,
      }
    );
  };

  confirm() {}

  cancel() {}
}
