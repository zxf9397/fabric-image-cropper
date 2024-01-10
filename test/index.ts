import { fabric } from 'fabric';
import { ImageCropper, FabricCropListener } from '../src';

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
  const image = (await fabricImageFromURL('/gallery/pic.png', {
    left: 300,
    top: 50,
    scaleX: -0.5,
    scaleY: -0.5,
    angle: 45,
    flipX: true,
    flipY: true,
  })) as Required<fabric.Image>;

  const image2 = (await fabricImageFromURL('/gallery/pic.png', {
    left: 300,
    top: 50,
    scaleX: -0.5,
    scaleY: -0.5,
    angle: 45,
    flipX: true,
    flipY: true,
    opacity: 0,
    hasControls: false,
  })) as Required<fabric.Image>;

  fabricCanvas.add(image2, image).renderAll();

  const listener = new FabricCropListener(fabricCanvas, { containerOffsetX: 604, containerOffsetY: 2 });

  listener.on('cropping', (crop, source) => {
    image2.set(ImageCropper.getSource(crop, source));
    fabricCanvas.renderAll();
  });

  listener.on('cancel', (crop, source) => {});
  listener.on('confirm', (crop, source) => {});

  listener.on('start', () => {
    image2.set({
      ...ImageCropper.getSource(image, image._cropSource || image),
      opacity: 0.5,
    });
    fabricCanvas.renderAll();
  });

  listener.on('end', (crop, source) => {
    image2.set({
      ...ImageCropper.getSource(image, image._cropSource || image),
      opacity: 0,
    });
    fabricCanvas.renderAll();
  });

  cropButton.addEventListener('click', listener.crop.bind(listener));
  confirmButton.addEventListener('click', listener.confirm.bind(listener));
  cancelButton.addEventListener('click', listener.cancel.bind(listener));
})();
