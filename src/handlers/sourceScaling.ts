import { AcrossCornersMapping } from './cropScaling';
import { Point } from '../utils/point.class';

import type { ICropData, ISourceData } from '../cropper/data.d';
import type { IControlCoords, IControlType } from '../controls/data.d';

interface IScalingHandlerReturns {
  cropData: ICropData;
  sourceData: ISourceData;
}
interface IScalingHandlerParam extends IScalingHandlerReturns {
  pointer: Point;
  corner: IControlType;
  cropCoords: IControlCoords;
  sourceCoords: IControlCoords;
}

enum raote {
  tl = 0,
  tr = 0,
  br = -90,
  bl = -90,
  ml = 90,
  mr = 90,
  mt = 0,
  mb = 0,
}

export function sourceScalingHandler(data: IScalingHandlerParam) {
  const { pointer, sourceCoords, cropData, sourceData, cropCoords, corner } = data;
  const angle = cropData.angle;
  const origin = sourceCoords[AcrossCornersMapping[corner]];
  const scaledWidth = sourceData.width * cropData.scaleX;
  const scaledHeight = sourceData.height * cropData.scaleY;

  const opposite = new Point(sourceCoords[AcrossCornersMapping[corner]]).subtract(sourceCoords[corner]).rotate(-angle);
  const degreeToX = Math.asin((scaledHeight * Math.sign(opposite.x)) / opposite.distanceFrom()) / (Math.PI / 180) + raote[corner];

  const originSize = opposite.rotate(-degreeToX);
  const toOriginX = pointer.subtract(origin).rotate(-angle - degreeToX);

  const minSize = new Point(cropCoords[corner]).subtract(origin).rotate(-angle);

  const scale = Math.max(Math.abs(toOriginX.x) / Math.abs(originSize.x), Math.abs(minSize.x) / scaledWidth, Math.abs(minSize.y) / scaledHeight);

  let width = scaledWidth * scale;
  let height = scaledHeight * scale;

  const localPosition = {
    tl: () => ({ x: -width, y: -height }),
    br: () => ({ x: 0, y: 0 }),
    tr: () => ({ x: 0, y: -height }),
    bl: () => ({ x: -width, y: 0 }),
    ml: () => ({ x: -width, y: -height / 2 }),
    mr: () => ({ x: 0, y: -height / 2 }),
    mt: () => ({ x: -width / 2, y: -height }),
    mb: () => ({ x: -width / 2, y: 0 }),
  }[corner]();

  const tl = new Point(localPosition).rotate(angle).add(origin);
  const crop = tl.subtract(cropCoords.tl).rotate(-angle).flipX().flipY();

  return {
    cropData: {
      ...cropData,
      cropX: crop.x,
      cropY: crop.y,
      scaleX: cropData.scaleX * scale,
      scaleY: cropData.scaleY * scale,
      width: Math.abs(cropData.width) / scale,
      height: Math.abs(cropData.height) / scale,
    },
    sourceData: { ...sourceData, left: tl.x, top: tl.y },
  };
}
