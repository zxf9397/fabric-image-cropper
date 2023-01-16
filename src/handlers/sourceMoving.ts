import { Box, CropBox } from '../cropper/cropper';
import { CornerType } from '../data';
import { IPoint, Point } from '../utils/point';

interface SourceMovingHandlerData {
  pointer: Point;
  angle: number;
  cropBox: CropBox;
  cropCoords: Record<CornerType, IPoint>;
  sourceBox: Box;
}

interface SourceMovingHandler {
  (data: SourceMovingHandlerData): { cropBox: CropBox; sourceBox: Box };
}

export const sourceMovingHandler: SourceMovingHandler = ({ pointer, angle, cropBox, cropCoords, sourceBox }: SourceMovingHandlerData) => {
  const leftTop = pointer.subtract(cropCoords.tl).rotate(-angle);
  const rightBottom = pointer.subtract(cropCoords.br).rotate(180 - angle);

  const rightSide = leftTop.x > 0,
    topSide = leftTop.y > 0,
    leftSide = rightBottom.x > sourceBox.width,
    bottomSide = rightBottom.y > sourceBox.height;

  let tl = pointer;

  if (topSide && rightSide) {
    tl = new Point(0, 0).rotate(angle).add(cropCoords.tl);
  } else if (rightSide && bottomSide) {
    tl = new Point(0, cropBox.height - sourceBox.height).rotate(angle).add(cropCoords.tl);
  } else if (bottomSide && leftSide) {
    tl = new Point(cropBox.width - sourceBox.width, cropBox.height - sourceBox.height).rotate(angle).add(cropCoords.tl);
  } else if (leftSide && topSide) {
    tl = new Point(cropBox.width - sourceBox.width, 0).rotate(angle).add(cropCoords.tl);
  } else if (rightSide) {
    tl = new Point(0, leftTop.y).rotate(angle).add(cropCoords.tl);
  } else if (topSide) {
    tl = new Point(leftTop.x, 0).rotate(angle).add(cropCoords.tl);
  } else if (leftSide) {
    tl = new Point(cropBox.width - sourceBox.width, leftTop.y).rotate(angle).add(cropCoords.tl);
  } else if (bottomSide) {
    tl = new Point(leftTop.x, cropBox.height - sourceBox.height).rotate(angle).add(cropCoords.tl);
  }

  const crop = new Point(cropCoords.tl).subtract(tl).rotate(-angle);

  return {
    cropBox: { ...cropBox, cropX: crop.x, cropY: crop.y },
    sourceBox: { ...sourceBox, left: tl.x, top: tl.y },
  };
};
