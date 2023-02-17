import { fabric } from 'fabric';
import { FabricCropListener } from '../src/fabric/fabricCropListener.class';

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
    left: 100,
    top: 100,
    scaleX: -0.6,
    scaleY: -0.5,
    angle: 0,
    flipX: true,
    flipY: true,
  })) as Required<fabric.Image>;

  fabricCanvas.add(image).renderAll();

  const listener = new FabricCropListener(fabricCanvas, { containerOffsetX: 2, containerOffsetY: 2 });

  cropButton.addEventListener('click', listener.crop.bind(listener));
  confirmButton.addEventListener('click', listener.confirm.bind(listener));
  cancelButton.addEventListener('click', listener.cancel.bind(listener));
})();
