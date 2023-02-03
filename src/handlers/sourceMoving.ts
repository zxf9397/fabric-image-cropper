import { IPoint, Point } from '../utils/point.class';

import type { IControlCoords } from '../controls/data.d';
import type { ICropData, ISourceData } from '../cropper/data.d';

interface ISouceMovingHandlerDataReturns {
  cropData: ICropData;
  sourceData: ISourceData;
}

interface ISouceMovingHandlerParam extends ISouceMovingHandlerDataReturns {
  pointer: Point;
  cropCoords: IControlCoords;
}

export const sourceMovingHandler = (param: ISouceMovingHandlerParam): ISouceMovingHandlerDataReturns => {
  const { pointer, cropData, cropCoords, sourceData } = param;
  const scaledCropWidth = cropData.width * cropData.scaleX;
  const scaledCropHeight = cropData.height * cropData.scaleY;
  const scaledSourceWidth = sourceData.width * cropData.scaleX;
  const scaledSourceHeight = sourceData.height * cropData.scaleY;

  const rightBound = scaledCropWidth - scaledSourceWidth;
  const bottomBound = scaledCropHeight - scaledSourceHeight;

  const toLeftTop = pointer.subtract(cropCoords.tl).rotate(-cropData.angle);
  const toRightBottom = pointer.subtract(cropCoords.br).rotate(180 - cropData.angle);

  const relativePositionIfSourceSideInner: Partial<Record<string, IPoint>> = {
    tl: { x: 0, y: 0 },
    bl: { x: 0, y: bottomBound },
    br: { x: rightBound, y: bottomBound },
    tr: { x: rightBound, y: 0 },
    l: { x: 0, y: toLeftTop.y },
    t: { x: toLeftTop.x, y: 0 },
    r: { x: rightBound, y: toLeftTop.y },
    b: { x: toLeftTop.x, y: bottomBound },
  };

  const ver = toLeftTop.y > 0 ? 't' : toRightBottom.y > scaledSourceHeight ? 'b' : '';
  const hor = toLeftTop.x > 0 ? 'l' : toRightBottom.x > scaledSourceWidth ? 'r' : '';

  const relativePosition = relativePositionIfSourceSideInner[ver + hor];
  const tl = relativePosition ? new Point(relativePosition).rotate(cropData.angle).add(cropCoords.tl) : pointer;
  const crop = new Point(cropCoords.tl).subtract(tl).rotate(-cropData.angle);

  return {
    cropData: { ...cropData, cropX: crop.x / cropData.scaleX, cropY: crop.y / cropData.scaleY },
    sourceData: { ...sourceData, left: tl.x, top: tl.y },
  };
};
