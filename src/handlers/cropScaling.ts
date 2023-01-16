import { CropBox } from '../cropper/cropper';
import { IPoint, Point } from '../utils/point';
import { CornerType } from '../data.d';
import { clamp } from '../utils/tools';

interface ScalingHandlerData {
  pointer: Point;
  angle: number;
  cropBox: CropBox;
  cropCoords: Record<CornerType, IPoint>;
  sourceCoords: Record<CornerType, IPoint>;
}

interface ScalingHandler {
  (data: ScalingHandlerData): { cropBox: CropBox };
}

export const cropScalingHandlerMap: Record<CornerType, ScalingHandler> = {
  tl({ pointer, angle, cropCoords, sourceCoords, cropBox }) {
    const origin = cropCoords.br;

    const toRightBottom = pointer.subtract(origin).rotate(-angle).flipX().flipY();
    const maxSize = new Point(sourceCoords.tl).subtract(origin).rotate(-angle).flipX().flipY();

    const leftSide = maxSize.x - toRightBottom.x < 0,
      rightSide = toRightBottom.x < 0,
      topSide = maxSize.y - toRightBottom.y < 0,
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
      cropBox: {
        ...cropBox,
        left: pos.x,
        top: pos.y,
        width: clamp(toRightBottom.x, 0, maxSize.x),
        height: clamp(toRightBottom.y, 0, maxSize.y),
        cropX: crop.x,
        cropY: crop.y,
      },
    };
  },
  br({ pointer, angle, cropCoords, sourceCoords, cropBox }) {
    const origin = cropCoords.tl;

    const rightBottom = pointer.subtract(origin).rotate(-angle);
    const maxSize = new Point(sourceCoords.br).subtract(origin).rotate(-angle);

    return {
      cropBox: {
        ...cropBox,
        width: clamp(rightBottom.x, 0, maxSize.x),
        height: clamp(rightBottom.y, 0, maxSize.y),
      },
    };
  },
  tr({ pointer, angle, cropCoords, sourceCoords, cropBox }) {
    const origin = cropCoords.bl;

    const leftBottom = pointer.subtract(origin).rotate(-angle).flipY();
    const maxSize = new Point(sourceCoords.tr).subtract(origin).rotate(-angle).flipY();

    const topSide = maxSize.y - leftBottom.y < 0,
      bottomSide = leftBottom.y < 0;

    let pos = new Point(0, -leftBottom.y).rotate(angle).add(origin);
    if (topSide) {
      pos = new Point(0, -maxSize.y).rotate(angle).add(origin);
    } else if (bottomSide) {
      pos = new Point(0, 0).rotate(angle).add(origin);
    }

    const crop = pos.subtract(sourceCoords.tl).rotate(-angle);

    return {
      cropBox: {
        ...cropBox,
        left: pos.x,
        top: pos.y,
        width: clamp(leftBottom.x, 0, maxSize.x),
        height: clamp(leftBottom.y, 0, maxSize.y),
        cropX: crop.x,
        cropY: crop.y,
      },
    };
  },
  bl({ pointer, angle, cropCoords, sourceCoords, cropBox }) {
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
      cropBox: {
        ...cropBox,
        left: pos.x,
        top: pos.y,
        width: clamp(rightTop.x, 0, maxSize.x),
        height: clamp(rightTop.y, 0, maxSize.y),
        cropX: crop.x,
        cropY: crop.y,
      },
    };
  },
  mt({ pointer, angle, cropCoords, sourceCoords, cropBox }) {
    // TODO:
    return { cropBox };
  },
  mb({ pointer, angle, cropCoords, sourceCoords, cropBox }) {
    // TODO:
    return { cropBox };
  },
  ml({ pointer, angle, cropCoords, sourceCoords, cropBox }) {
    // TODO:
    return { cropBox };
  },
  mr({ pointer, angle, cropCoords, sourceCoords, cropBox }) {
    // TODO:
    return { cropBox };
  },
};
