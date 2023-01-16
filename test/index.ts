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

window.canvas = fabricCanvas;

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
  const image = (await fabricImageFromURL('/pic.png', { left: 100, top: 100, scaleX: 0.5, scaleY: 0.3 })) as Required<fabric.Image>;

  fabricCanvas.add(image).renderAll();

  const container = fabricCanvas.wrapperEl;

  const imageCropper = new ImageCropper(container, { containerOffsetX: 2, containerOffsetY: 2 });
  imageCropper.element.style.transform = 'translateX(100%)';

  imageCropper.onCropChange((state) => {
    cropButton.disabled = state;
    confirmButton.disabled = !state;
    cancelButton.disabled = !state;
  });

  let cacheWidth = image.getScaledWidth();
  let cacheHeight = image.getScaledHeight();
  let cacheSourceBox: any;
  let cacheScaleX = image.scaleX;
  let cacheScaleY = image.scaleY;

  imageCropper.onCrop(({ cropBox, sourceBox }) => {
    const scaleX = (sourceBox.width / cacheWidth) * cacheScaleX;
    const scaleY = (sourceBox.height / cacheHeight) * cacheScaleY;

    image.set({
      left: cropBox.left,
      top: cropBox.top,
      width: cropBox.width / scaleX,
      height: cropBox.height / scaleY,
      scaleX,
      scaleY,
      cropX: cropBox.cropX / scaleX,
      cropY: cropBox.cropY / scaleY,
    });

    (image as any).sourceBox = sourceBox;

    fabricCanvas.renderAll();
  });

  cropButton.addEventListener('click', function () {
    const active = fabricCanvas.getActiveObject();

    if (active?.type === 'image') {
      const image = active as Required<fabric.Image>;

      const cropBox = {
        left: image.left,
        top: image.top,
        width: image.getScaledWidth(),
        height: image.getScaledHeight(),
        angle: image.angle,
        cropX: image.cropX * image.scaleX,
        cropY: image.cropY * image.scaleY,
      };

      const sourceBox = cacheSourceBox || {
        left: image.left,
        top: image.top,
        width: image.getScaledWidth(),
        height: image.getScaledHeight(),
        angle: image.angle,
      };

      console.log('sourceBox', sourceBox);

      imageCropper.crop(image.getSrc(), cropBox, sourceBox);
    }
  });

  confirmButton.addEventListener('click', function () {
    const { cropBox, sourceBox } = imageCropper.confirm();

    const { width, height, scaleX, scaleY } = image as Required<fabric.Image>;

    image.set({
      left: cropBox.left,
      top: cropBox.top,
      width: cropBox.width / scaleX,
      height: cropBox.height / scaleY,
      cropX: cropBox.cropX / scaleX,
      cropY: cropBox.cropY / scaleY,
    });

    cacheSourceBox = sourceBox;

    fabricCanvas.renderAll();
  });

  cancelButton.addEventListener('click', function () {
    imageCropper.cancel();
  });
})();
