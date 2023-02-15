import type { IScalingHandlerParam, IScalingHandlerReturns } from './data.d';

import { Point } from '../utils/point.class';
import { clamp } from '../utils/tools';

export enum AcrossCornersMapping {
  tl = 'br',
  br = 'tl',
  tr = 'bl',
  bl = 'tr',
  ml = 'mr',
  mr = 'ml',
  mt = 'mb',
  mb = 'mt',
}

/**
 * TODO:
 * 1. Proportional cropping
 * 2. Custom proportion cropping, (1:1) ext.
 */
export function cropScalingHandler(data: IScalingHandlerParam): IScalingHandlerReturns {
  const { pointer, croppedData, croppedControlCoords, sourceData, sourceControlCoords, corner } = data;
  const angle = croppedData.angle;
  const origin = croppedControlCoords[AcrossCornersMapping[corner]];

  const toOrigin = pointer.subtract(origin).rotate(-angle);
  const maxSize = new Point(sourceControlCoords[corner]).subtract(origin).rotate(-angle);

  const absWdith = Math.sign(toOrigin.x) === Math.sign(maxSize.x) ? Math.abs(toOrigin.x) : 0;
  const absHeight = Math.sign(toOrigin.y) === Math.sign(maxSize.y) ? Math.abs(toOrigin.y) : 0;

  let width = clamp(absWdith, 16, Math.abs(maxSize.x));
  let height = clamp(absHeight, 16, Math.abs(maxSize.y));

  const localPosition = {
    tl: () => ({ x: -width, y: -height }),
    bl: () => ({ x: -width, y: 0 }),
    tr: () => ({ x: 0, y: -height }),
    br: () => ({ x: 0, y: 0 }),
    ml: () => ({ x: -width, y: -(height = croppedData.height * croppedData.scaleY) / 2 }),
    mr: () => ({ x: 0, y: -(height = croppedData.height * croppedData.scaleY) / 2 }),
    mt: () => ({ x: -(width = croppedData.width * croppedData.scaleX) / 2, y: -height }),
    mb: () => ({ x: -(width = croppedData.width * croppedData.scaleX) / 2, y: 0 }),
  };

  const position = new Point(localPosition[corner]()).rotate(angle).add(origin);
  const crop = position.subtract(sourceControlCoords.tl).rotate(-angle);

  return {
    croppedData: {
      ...croppedData,
      left: position.x,
      top: position.y,
      width: width / croppedData.scaleX,
      height: height / croppedData.scaleY,
      cropX: crop.x / croppedData.scaleX,
      cropY: crop.y / croppedData.scaleY,
    },
    sourceData,
  };
}
