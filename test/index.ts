import { fabric } from 'fabric';
import { ImageCropper } from '../src';

const cropButton = document.querySelector('#crop-btn') as HTMLButtonElement;
const confirmButton = document.querySelector('#confirm-btn') as HTMLButtonElement;
const cancelButton = document.querySelector('#cancel-btn') as HTMLButtonElement;

const canvas = document.querySelector('#canvas') as HTMLCanvasElement;
canvas.width = 600;
canvas.height = 600;
canvas.style.setProperty('border', `${2}px solid`);
const fabricCanvas = new fabric.Canvas(canvas);

(window as any).canvas = fabricCanvas;

function fabricImageFromURL(url: string, imgOptions?: fabric.IImageOptions) {
  return new Promise<fabric.Image>((resolve, reject) => {
    try {
      fabric.Image.fromURL(url, resolve, { ...imgOptions, crossOrigin: 'anonymous' });
    } catch (error) {
      reject(error);
    }
  });
}

(async () => {
  const image = await fabricImageFromURL('/pic.png', { left: 100, top: 100, scaleX: 0.5, scaleY: 0.3 });

  fabricCanvas.add(image).renderAll();

  const container = (fabricCanvas as any).wrapperEl as HTMLDivElement;

  const imageCropper = new ImageCropper(container, { containerOffsetX: 2, containerOffsetY: 2 });

  imageCropper.onCropChange((state) => {
    cropButton.disabled = state;
    confirmButton.disabled = !state;
    cancelButton.disabled = !state;
  });

  (window as any).imageCropper = imageCropper;

  cropButton.addEventListener('click', function () {
    const active = fabricCanvas.getActiveObject();

    if (active?.type === 'image') {
      const image = active as Required<fabric.Image>;

      imageCropper.crop(
        image.getSrc(),
        {
          left: image.left,
          top: image.top,
          width: image.getScaledWidth(),
          height: image.getScaledHeight(),
          angle: image.angle,
          cropX: image.cropX,
          cropY: image.cropY,
        },
        {
          left: image.left,
          top: image.top,
          width: image.getScaledWidth(),
          height: image.getScaledHeight(),
          angle: image.angle,
        }
      );
    }
  });

  confirmButton.addEventListener('click', function () {
    imageCropper.confirm();
  });

  cancelButton.addEventListener('click', function () {
    imageCropper.cancel();
  });
})();
