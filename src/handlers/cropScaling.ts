import { Point } from '../utils/point.class';
import { clamp } from '../utils/tools';

import type { ICropData } from '../cropper/data.d';
import type { IControlCoords, IControlType } from '../controls/data.d';

interface IScalingHandlerReturns {
  cropData: ICropData;
}

interface IScalingHandlerParam extends IScalingHandlerReturns {
  pointer: Point;
  corner: IControlType;
  cropCoords: IControlCoords;
  sourceCoords: IControlCoords;
}

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

export function cropScalingHandler(data: IScalingHandlerParam): IScalingHandlerReturns {
  const { pointer, cropData, cropCoords, sourceCoords, corner } = data;
  const angle = cropData.angle;
  const origin = cropCoords[AcrossCornersMapping[corner]];

  const toOrigin = pointer.subtract(origin).rotate(-angle);
  const maxSize = new Point(sourceCoords[corner]).subtract(origin).rotate(-angle);

  const absWdith = Math.sign(toOrigin.x) === Math.sign(maxSize.x) ? Math.abs(toOrigin.x) : 0;
  const absHeight = Math.sign(toOrigin.y) === Math.sign(maxSize.y) ? Math.abs(toOrigin.y) : 0;

  let width = clamp(absWdith, 0, Math.abs(maxSize.x));
  let height = clamp(absHeight, 0, Math.abs(maxSize.y));

  const localPosition = {
    tl: () => ({ x: -width, y: -height }),
    bl: () => ({ x: -width, y: 0 }),
    tr: () => ({ x: 0, y: -height }),
    br: () => ({ x: 0, y: 0 }),
    ml: () => ({ x: -width, y: -(height = cropData.height * cropData.scaleY) / 2 }),
    mr: () => ({ x: 0, y: -(height = cropData.height * cropData.scaleY) / 2 }),
    mt: () => ({ x: -(width = cropData.width * cropData.scaleX) / 2, y: -height }),
    mb: () => ({ x: -(width = cropData.width * cropData.scaleX) / 2, y: 0 }),
  };

  const pos = new Point(localPosition[corner]()).rotate(angle).add(origin);
  const crop = pos.subtract(sourceCoords.tl).rotate(-angle);

  return {
    cropData: {
      ...cropData,
      left: pos.x,
      top: pos.y,
      width: width / cropData.scaleX,
      height: height / cropData.scaleY,
      cropX: crop.x,
      cropY: crop.y,
    },
  };
}
