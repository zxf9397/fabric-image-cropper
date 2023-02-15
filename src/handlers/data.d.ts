import type { IControlType } from '../controls/data.d';
import type { IControlCoords, ICropData, ISourceTransform } from '../cropper/data.d';
import type { Point } from '../utils/point.class';

export interface IScalingHandlerReturns {
  croppedData: ICropData;
  sourceData: ISourceTransform;
}

export interface IScalingHandlerParam extends IScalingHandlerReturns {
  pointer: Point;
  corner: IControlType;
  croppedControlCoords: IControlCoords;
  sourceControlCoords: IControlCoords;
}

export interface ISouceMovingHandlerDataReturns {
  croppedData: ICropData;
  sourceData: ISourceTransform;
}

export interface ISouceMovingHandlerParam extends ISouceMovingHandlerDataReturns {
  pointer: Point;
  croppedControlCoords: IControlCoords;
}
