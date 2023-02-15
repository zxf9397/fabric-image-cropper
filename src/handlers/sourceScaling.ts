import type { IScalingHandlerParam, IScalingHandlerReturns } from './data.d';

import { AcrossCornersMapping } from './cropScaling';
import { Point } from '../utils/point.class';

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

export function sourceScalingHandler(data: IScalingHandlerParam): IScalingHandlerReturns {
  const { pointer, sourceControlCoords, croppedData, sourceData, croppedControlCoords, corner } = data;
  const angle = croppedData.angle;
  const origin = sourceControlCoords[AcrossCornersMapping[corner]];
  const scaledWidth = sourceData.width * croppedData.scaleX;
  const scaledHeight = sourceData.height * croppedData.scaleY;

  const opposite = new Point(sourceControlCoords[AcrossCornersMapping[corner]]).subtract(sourceControlCoords[corner]).rotate(-angle);
  const degreeToX = Math.asin((scaledHeight * Math.sign(opposite.x)) / opposite.distanceFrom()) / (Math.PI / 180) + raote[corner];

  const originSize = opposite.rotate(-degreeToX);
  const toOriginX = pointer.subtract(origin).rotate(-angle - degreeToX);

  const minSize = new Point(croppedControlCoords[corner]).subtract(origin).rotate(-angle);

  const scale = Math.max(Math.abs(toOriginX.x) / Math.abs(originSize.x), Math.abs(minSize.x) / scaledWidth, Math.abs(minSize.y) / scaledHeight);

  const width = scaledWidth * scale;
  const height = scaledHeight * scale;

  /**
   * TODO:
   * 1. ml、mr、mt、mb control has not been implemented.
   */
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

  const position = new Point(localPosition).rotate(angle).add(origin);
  const crop = position.subtract(croppedControlCoords.tl).rotate(-angle).flipX().flipY();

  const scaleX = croppedData.scaleX * scale;
  const scaleY = croppedData.scaleY * scale;

  return {
    croppedData: {
      ...croppedData,
      cropX: crop.x / scaleX,
      cropY: crop.y / scaleY,
      scaleX,
      scaleY,
      width: croppedData.width / scale,
      height: croppedData.height / scale,
    },
    sourceData: { ...sourceData, left: position.x, top: position.y },
  };
}
