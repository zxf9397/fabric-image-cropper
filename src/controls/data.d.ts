import type { ICropData, ISourceData, ISourceTransform } from '../cropper/data.d';
import type { Angle } from '../utils/angle.class';

export type ICornerControlType = 'tl' | 'tr' | 'bl' | 'br';

export type IMiddleControlType = 'ml' | 'mr' | 'mt' | 'mb';

export type IControlType = ICornerControlType | IMiddleControlType;

export interface IElements {
  container: HTMLDivElement;
  lower: HTMLDivElement;
  image: HTMLImageElement;
  upper: HTMLDivElement;
}

export interface IRenderFunctionParam {
  src: string;
  angle: Angle;
  croppedData: ICropData;
  sourceData: ISourceTransform;
  croppedBackup: ICropData;
  sourceBackup: ISourceData;
}
