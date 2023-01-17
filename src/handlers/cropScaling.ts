import { Point } from '../utils/point.class';
import { clamp } from '../utils/tools';

import type { ICropData } from '../cropper/data.d';
import type { IControlCoords, IControlType } from '../controls/data.d';

interface IScalingHandlerReturns {
  cropData: ICropData;
}

interface IScalingHandlerParam extends IScalingHandlerReturns {
  pointer: Point;
  cropCoords: IControlCoords;
  sourceCoords: IControlCoords;
}

interface IScalingHandler {
  (param: IScalingHandlerParam): IScalingHandlerReturns;
}

export const cropScalingHandlerMap: Record<IControlType, IScalingHandler> = {
  tl({ pointer, cropData, cropCoords, sourceCoords }) {
    const angle = cropData.angle;
    const origin = cropCoords.br;

    const toRightBottom = pointer.subtract(origin).rotate(-angle).flipX().flipY();
    const maxSize = new Point(sourceCoords.tl).subtract(origin).rotate(-angle).flipX().flipY();

    const leftSide = toRightBottom.x > maxSize.x,
      rightSide = toRightBottom.x < 0,
      topSide = toRightBottom.y > maxSize.y,
      bottomSide = toRightBottom.y < 0;

    let pos = pointer;
    if (leftSide && topSide) {
      pos = new Point(-maxSize.x, -maxSize.y).rotate(angle).add(origin);
    } else if (topSide && rightSide) {
      pos = new Point(0, -maxSize.y).rotate(angle).add(origin);
    } else if (rightSide && bottomSide) {
      pos = new Point(0, 0).rotate(angle).add(origin);
    } else if (bottomSide && leftSide) {
      pos = new Point(-maxSize.x, 0).rotate(angle).add(origin);
    } else if (leftSide) {
      pos = new Point(-maxSize.x, -toRightBottom.y).rotate(angle).add(origin);
    } else if (topSide) {
      pos = new Point(-toRightBottom.x, -maxSize.y).rotate(angle).add(origin);
    } else if (rightSide) {
      pos = new Point(0, -toRightBottom.y).rotate(angle).add(origin);
    } else if (bottomSide) {
      pos = new Point(-toRightBottom.x, 0).rotate(angle).add(origin);
    }

    const crop = pos.subtract(sourceCoords.tl).rotate(-angle);

    return {
      cropData: {
        ...cropData,
        left: pos.x,
        top: pos.y,
        width: clamp(toRightBottom.x, 0, maxSize.x) / cropData.scaleX,
        height: clamp(toRightBottom.y, 0, maxSize.y) / cropData.scaleY,
        cropX: crop.x,
        cropY: crop.y,
      },
    };
  },
  br({ pointer, cropData, cropCoords, sourceCoords }) {
    const angle = cropData.angle;
    const origin = cropCoords.tl;

    const rightBottom = pointer.subtract(origin).rotate(-angle);
    const maxSize = new Point(sourceCoords.br).subtract(origin).rotate(-angle);

    return {
      cropData: {
        ...cropData,
        width: clamp(rightBottom.x, 0, maxSize.x) / cropData.scaleX,
        height: clamp(rightBottom.y, 0, maxSize.y) / cropData.scaleY,
      },
    };
  },
  tr({ pointer, cropData, cropCoords, sourceCoords }) {
    const angle = cropData.angle;
    const origin = cropCoords.bl;

    const leftBottom = pointer.subtract(origin).rotate(-angle).flipY();
    const maxSize = new Point(sourceCoords.tr).subtract(origin).rotate(-angle).flipY();

    const topSide = leftBottom.y > maxSize.y,
      bottomSide = leftBottom.y < 0;

    let pos = new Point(0, -leftBottom.y).rotate(angle).add(origin);
    if (topSide) {
      pos = new Point(0, -maxSize.y).rotate(angle).add(origin);
    } else if (bottomSide) {
      pos = new Point(0, 0).rotate(angle).add(origin);
    }

    const crop = pos.subtract(sourceCoords.tl).rotate(-angle);

    return {
      cropData: {
        ...cropData,
        left: pos.x,
        top: pos.y,
        width: clamp(leftBottom.x, 0, maxSize.x) / cropData.scaleX,
        height: clamp(leftBottom.y, 0, maxSize.y) / cropData.scaleY,
        cropX: crop.x,
        cropY: crop.y,
      },
    };
  },
  bl({ pointer, cropData, cropCoords, sourceCoords }) {
    const angle = cropData.angle;
    const origin = cropCoords.tr;

    const rightTop = pointer.subtract(origin).rotate(-angle).flipX();
    const maxSize = new Point(sourceCoords.bl).subtract(origin).rotate(-angle).flipX();

    const leftSide = maxSize.x < rightTop.x,
      rightSide = rightTop.x < 0;

    let pos = new Point(-rightTop.x, 0).rotate(angle).add(origin);
    if (leftSide) {
      pos = new Point(-maxSize.x, 0).rotate(angle).add(origin);
    } else if (rightSide) {
      pos = new Point(0, 0).rotate(angle).add(origin);
    }

    const crop = pos.subtract(sourceCoords.tl).rotate(-angle);

    return {
      cropData: {
        ...cropData,
        left: pos.x,
        top: pos.y,
        width: clamp(rightTop.x, 0, maxSize.x) / cropData.scaleX,
        height: clamp(rightTop.y, 0, maxSize.y) / cropData.scaleY,
        cropX: crop.x,
        cropY: crop.y,
      },
    };
  },
  mt({ pointer, cropData, cropCoords, sourceCoords }) {
    // TODO:
    return { cropData };
  },
  mb({ pointer, cropData, cropCoords, sourceCoords }) {
    // TODO:
    return { cropData };
  },
  ml({ pointer, cropData, cropCoords, sourceCoords }) {
    // TODO:
    return { cropData };
  },
  mr({ pointer, cropData, cropCoords, sourceCoords }) {
    // TODO:
    return { cropData };
  },
};
