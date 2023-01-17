import { Point } from '../utils/point.class';

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
  const { angle } = cropData;
  const scaledCropWidth = cropData.width * cropData.scaleX;
  const scaledCropHeight = cropData.height * cropData.scaleY;
  const scaledSourceWidth = sourceData.width * cropData.scaleX;
  const scaledSourceHeight = sourceData.height * cropData.scaleY;

  const toLeftTop = pointer.subtract(cropCoords.tl).rotate(-angle);
  const toRightBottom = pointer.subtract(cropCoords.br).rotate(180 - angle);

  const leftInner = toLeftTop.x > 0,
    topSide = toLeftTop.y > 0,
    rightInner = toRightBottom.x > scaledSourceWidth,
    bottomSide = toRightBottom.y > scaledSourceHeight;

  let tl = pointer;

  if (topSide && leftInner) {
    tl = new Point(0, 0).rotate(angle).add(cropCoords.tl);
  } else if (leftInner && bottomSide) {
    tl = new Point(0, scaledCropHeight - scaledSourceHeight).rotate(angle).add(cropCoords.tl);
  } else if (bottomSide && rightInner) {
    tl = new Point(scaledCropWidth - scaledSourceWidth, scaledCropHeight - scaledSourceHeight).rotate(angle).add(cropCoords.tl);
  } else if (rightInner && topSide) {
    tl = new Point(scaledCropWidth - scaledSourceWidth, 0).rotate(angle).add(cropCoords.tl);
  } else if (leftInner) {
    tl = new Point(0, toLeftTop.y).rotate(angle).add(cropCoords.tl);
  } else if (topSide) {
    tl = new Point(toLeftTop.x, 0).rotate(angle).add(cropCoords.tl);
  } else if (rightInner) {
    tl = new Point(scaledCropWidth - scaledSourceWidth, toLeftTop.y).rotate(angle).add(cropCoords.tl);
  } else if (bottomSide) {
    tl = new Point(toLeftTop.x, scaledCropHeight - scaledSourceHeight).rotate(angle).add(cropCoords.tl);
  }

  const crop = new Point(cropCoords.tl).subtract(tl).rotate(-angle);

  return {
    cropData: { ...cropData, cropX: crop.x, cropY: crop.y },
    sourceData: { ...sourceData, left: tl.x, top: tl.y },
  };
};
