import { fabric } from 'fabric';

declare global {
  interface Window {
    canvas?: fabric.Canvas;
  }
}

declare module 'fabric' {
  namespace fabric {
    interface Canvas {
      wrapperEl: HTMLDivElement;
    }

    interface IImageOptions {
      _cropSource?: {
        left: number;
        top: number;
        width: number;
        height: number;
      };
    }
  }
}
