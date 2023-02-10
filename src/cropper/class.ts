import { Listener } from '../utils/listener.class';

interface IImage {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface IImageSource {
  width: number;
  height: number;
}

interface ICropActionHandler {
  (cropData: IImage, sourceData: IImageSource): void;
}

interface IListener
  extends Readonly<{
    start: ICropActionHandler;
    cropping: ICropActionHandler;
    confirm: ICropActionHandler;
    cancel: ICropActionHandler;
    end: ICropActionHandler;
  }> {}

type ICropAction = keyof IListener;

export class Cropper {
  private listener = new Listener<IListener>();
  public get on() {
    return this.listener.on.bind(this.listener);
  }
  public get off() {
    return this.listener.off.bind(this.listener);
  }

  constructor() {}
}
