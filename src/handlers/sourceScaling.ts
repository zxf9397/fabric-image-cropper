import { Box, CropBox } from '../cropper/cropper';
import { IPoint, Point } from '../utils/point';
import { CornerType } from '../data';

interface ScalingHandlerData {
  pointer: Point;
  angle: number;
  cropBox: CropBox;
  cropCoords: Record<CornerType, IPoint>;
  sourceBox: Box;
  sourceCoords: Record<CornerType, IPoint>;
}

interface ScalingHandler {
  (data: ScalingHandlerData): { cropBox: CropBox; sourceBox: Box };
}

export const sourceScalingHandlerMap: Record<CornerType, ScalingHandler> = {
  tl({ pointer, angle, cropBox, cropCoords, sourceCoords, sourceBox }) {
    const origin = sourceCoords.br;

    const diagonal = new Point(sourceBox.width, sourceBox.height);
    const angleToX = Math.asin(sourceBox.height / diagonal.distanceFrom()) / (Math.PI / 180);

    const xAxisMin = diagonal.rotate(-angleToX);
    const xAxisPoint = pointer
      .subtract(origin)
      .rotate(-angle - angleToX)
      .flipX();

    const minSize = new Point(cropCoords.tl).subtract(origin).rotate(-angle).flipX().flipY();
    const proportionalScaling = Math.max(xAxisPoint.x / xAxisMin.x, minSize.x / sourceBox.width, minSize.y / sourceBox.height);

    const localPoint = new Point(-sourceBox.width * proportionalScaling, -sourceBox.height * proportionalScaling);

    const tl = localPoint.rotate(angle).add(origin);
    const crop = tl.subtract(cropCoords.tl).rotate(-angle).flipX().flipY();

    return {
      cropBox: { ...cropBox, cropX: crop.x, cropY: crop.y },
      sourceBox: { ...sourceBox, left: tl.x, top: tl.y, width: -localPoint.x, height: -localPoint.y },
    };
  },
  br({ pointer, angle, cropCoords, sourceCoords, cropBox, sourceBox }) {
    const origin = sourceCoords.tl;

    const localBr = new Point(sourceBox.width, sourceBox.height);
    const angleToX = Math.asin(sourceBox.height / localBr.distanceFrom()) / (Math.PI / 180);
    const xAxis = new Point(sourceBox.width, sourceBox.height).rotate(-angleToX);
    const xAxisPoint = pointer.subtract(origin).rotate(-angle - angleToX);

    const minSize = new Point(cropCoords.br).subtract(origin).rotate(-angle);
    const proportionalScaling = Math.max(xAxisPoint.x / xAxis.x, minSize.x / sourceBox.width, minSize.y / sourceBox.height);

    const localPoint = new Point(sourceBox.width * proportionalScaling, sourceBox.height * proportionalScaling);

    return {
      cropBox,
      sourceBox: { ...sourceBox, width: localPoint.x, height: localPoint.y },
    };
  },
  tr({ pointer, angle, cropCoords, sourceCoords, cropBox, sourceBox }) {
    const origin = sourceCoords.bl;

    const diagonal = new Point(sourceBox.width, -sourceBox.height);
    const angleToX = Math.asin(sourceBox.width / diagonal.distanceFrom()) / (Math.PI / 180);

    const yAxisMin = diagonal.rotate(-angleToX);
    const yAxisPoint = pointer.subtract(origin).rotate(-angle - angleToX);

    const minSize = new Point(cropCoords.tr).subtract(origin).rotate(-angle).flipY();
    const proportionalScaling = Math.max(yAxisPoint.y / yAxisMin.y, minSize.x / sourceBox.width, minSize.y / sourceBox.height);

    const localPoint = new Point(sourceBox.width * proportionalScaling, -sourceBox.height * proportionalScaling);

    const tl = new Point(0, localPoint.y).rotate(angle).add(origin);
    const crop = tl.subtract(cropCoords.tl).rotate(-angle).flipX().flipY();

    return {
      cropBox: { ...cropBox, cropX: crop.x, cropY: crop.y },
      sourceBox: { ...sourceBox, left: tl.x, top: tl.y, width: localPoint.x, height: -localPoint.y },
    };
  },
  bl({ pointer, angle, cropCoords, sourceCoords, cropBox, sourceBox }) {
    const origin = sourceCoords.tr;

    const diagonal = new Point(sourceBox.width, -sourceBox.height);
    const angleToX = Math.asin(sourceBox.width / diagonal.distanceFrom()) / (Math.PI / 180);

    const yAxisMin = diagonal.rotate(-angleToX).flipY();
    const yAxisPoint = pointer.subtract(origin).rotate(-angle - angleToX);

    const minSize = new Point(cropCoords.bl).subtract(origin).rotate(-angle).flipX();
    const proportionalScaling = Math.max(yAxisPoint.y / yAxisMin.y, minSize.x / sourceBox.width, minSize.y / sourceBox.height);

    const localPoint = new Point(-sourceBox.width * proportionalScaling, sourceBox.height * proportionalScaling);

    const tl = new Point(localPoint.x, 0).rotate(angle).add(origin);
    const crop = tl.subtract(cropCoords.tl).rotate(-angle).flipX().flipY();

    return {
      cropBox: { ...cropBox, cropX: crop.x, cropY: crop.y },
      sourceBox: { ...sourceBox, left: tl.x, top: tl.y, width: -localPoint.x, height: localPoint.y },
    };
  },
  mt({ pointer, angle, cropCoords, sourceCoords, cropBox, sourceBox }) {
    // TODO:
    return { cropBox, sourceBox };
  },
  mb({ pointer, angle, cropCoords, sourceCoords, cropBox, sourceBox }) {
    // TODO:
    return { cropBox, sourceBox };
  },
  ml({ pointer, angle, cropCoords, sourceCoords, cropBox, sourceBox }) {
    // TODO:
    return { cropBox, sourceBox };
  },
  mr({ pointer, angle, cropCoords, sourceCoords, cropBox, sourceBox }) {
    // TODO:
    return { cropBox, sourceBox };
  },
};
