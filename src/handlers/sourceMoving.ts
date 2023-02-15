import type { ISouceMovingHandlerDataReturns, ISouceMovingHandlerParam } from './data.d';

import { IPoint, Point } from '../utils/point.class';

export const sourceMovingHandler = (param: ISouceMovingHandlerParam): ISouceMovingHandlerDataReturns => {
  const { pointer, croppedData, croppedControlCoords, sourceData } = param;
  const scaledCropWidth = croppedData.width * croppedData.scaleX;
  const scaledCropHeight = croppedData.height * croppedData.scaleY;
  const scaledSourceWidth = sourceData.width * croppedData.scaleX;
  const scaledSourceHeight = sourceData.height * croppedData.scaleY;

  const rightBound = scaledCropWidth - scaledSourceWidth;
  const bottomBound = scaledCropHeight - scaledSourceHeight;

  const toLeftTop = pointer.subtract(croppedControlCoords.tl).rotate(-croppedData.angle);
  const toRightBottom = pointer.subtract(croppedControlCoords.br).rotate(180 - croppedData.angle);

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
  const tl = relativePosition ? new Point(relativePosition).rotate(croppedData.angle).add(croppedControlCoords.tl) : pointer;
  const crop = new Point(croppedControlCoords.tl).subtract(tl).rotate(-croppedData.angle);

  return {
    croppedData: { ...croppedData, cropX: crop.x / croppedData.scaleX, cropY: crop.y / croppedData.scaleY },
    sourceData: { ...sourceData, left: tl.x, top: tl.y },
  };
};
