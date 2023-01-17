import { Point } from '../utils/point.class';

import type { ICropData, ISourceData } from '../cropper/data.d';
import type { IControlCoords, IControlType } from '../controls/data.d';

interface IScalingHandlerReturns {
  cropData: ICropData;
  sourceData: ISourceData;
}
interface IScalingHandlerParam extends IScalingHandlerReturns {
  pointer: Point;
  cropCoords: IControlCoords;
  sourceCoords: IControlCoords;
}

interface IScalingHandler {
  (param: IScalingHandlerParam): IScalingHandlerReturns;
}

export const sourceScalingHandlerMap: Record<IControlType, IScalingHandler> = {
  tl({ pointer, sourceCoords, cropData, sourceData, cropCoords }) {
    const angle = cropData.angle;
    const origin = sourceCoords.br;
    const scaledWidth = sourceData.width * cropData.scaleX;
    const scaledHeight = sourceData.height * cropData.scaleY;

    const diagonal = new Point(scaledWidth, scaledHeight);
    const angleToX = Math.asin(scaledHeight / diagonal.distanceFrom()) / (Math.PI / 180);

    const xAxisMin = diagonal.rotate(-angleToX);
    const xAxisPoint = pointer
      .subtract(origin)
      .rotate(-angle - angleToX)
      .flipX();

    const minSize = new Point(cropCoords.tl).subtract(origin).rotate(-angle).flipX().flipY();
    const proportionalScaling = Math.max(xAxisPoint.x / xAxisMin.x, minSize.x / scaledWidth, minSize.y / scaledHeight);

    const localPoint = new Point(-scaledWidth * proportionalScaling, -scaledHeight * proportionalScaling);

    const tl = localPoint.rotate(angle).add(origin);
    const crop = tl.subtract(cropCoords.tl).rotate(-angle).flipX().flipY();

    const scaleX = -localPoint.x / scaledWidth;
    const scaleY = -localPoint.y / scaledHeight;

    return {
      cropData: {
        ...cropData,
        cropX: crop.x,
        cropY: crop.y,
        scaleX: cropData.scaleX * scaleX,
        scaleY: cropData.scaleY * scaleY,
        width: cropData.width / scaleX,
        height: cropData.height / scaleY,
      },
      sourceData: { ...sourceData, left: tl.x, top: tl.y },
    };
  },
  br({ pointer, cropData, cropCoords, sourceData, sourceCoords }) {
    const angle = cropData.angle;
    const origin = sourceCoords.tl;
    const scaledWidth = sourceData.width * cropData.scaleX;
    const scaledHeight = sourceData.height * cropData.scaleY;

    const localBr = new Point(scaledWidth, scaledHeight);
    const angleToX = Math.asin(scaledHeight / localBr.distanceFrom()) / (Math.PI / 180);
    const xAxis = new Point(scaledWidth, scaledHeight).rotate(-angleToX);
    const xAxisPoint = pointer.subtract(origin).rotate(-angle - angleToX);

    const minSize = new Point(cropCoords.br).subtract(origin).rotate(-angle);
    const proportionalScaling = Math.max(xAxisPoint.x / xAxis.x, minSize.x / scaledWidth, minSize.y / scaledHeight);

    const localPoint = new Point(scaledWidth * proportionalScaling, scaledHeight * proportionalScaling);

    const scaleX = localPoint.x / scaledWidth;
    const scaleY = localPoint.y / scaledHeight;

    return {
      cropData: {
        ...cropData,
        scaleX: cropData.scaleX * scaleX,
        scaleY: cropData.scaleY * scaleY,
        width: cropData.width / scaleX,
        height: cropData.height / scaleY,
      },
      sourceData,
    };
  },
  tr({ pointer, cropData, cropCoords, sourceData, sourceCoords }) {
    const angle = cropData.angle;
    const origin = sourceCoords.bl;
    const scaledWidth = sourceData.width * cropData.scaleX;
    const scaledHeight = sourceData.height * cropData.scaleY;

    const diagonal = new Point(scaledWidth, -scaledHeight);
    const angleToX = Math.asin(scaledWidth / diagonal.distanceFrom()) / (Math.PI / 180);

    const yAxisMin = diagonal.rotate(-angleToX);
    const yAxisPoint = pointer.subtract(origin).rotate(-angle - angleToX);

    const minSize = new Point(cropCoords.tr).subtract(origin).rotate(-angle).flipY();
    const proportionalScaling = Math.max(yAxisPoint.y / yAxisMin.y, minSize.x / scaledWidth, minSize.y / scaledHeight);

    const localPoint = new Point(scaledWidth * proportionalScaling, -scaledHeight * proportionalScaling);

    const tl = new Point(0, localPoint.y).rotate(angle).add(origin);
    const crop = tl.subtract(cropCoords.tl).rotate(-angle).flipX().flipY();

    const scaleX = localPoint.x / scaledWidth;
    const scaleY = -localPoint.y / scaledHeight;

    return {
      cropData: {
        ...cropData,
        cropX: crop.x,
        cropY: crop.y,
        scaleX: cropData.scaleX * scaleX,
        scaleY: cropData.scaleY * scaleY,
        width: cropData.width / scaleX,
        height: cropData.height / scaleY,
      },
      sourceData: { ...sourceData, left: tl.x, top: tl.y },
    };
  },
  bl({ pointer, cropData, cropCoords, sourceData, sourceCoords }) {
    const angle = cropData.angle;
    const origin = sourceCoords.tr;
    const scaledWidth = sourceData.width * cropData.scaleX;
    const scaledHeight = sourceData.height * cropData.scaleY;

    const diagonal = new Point(scaledWidth, -scaledHeight);
    const angleToX = Math.asin(scaledWidth / diagonal.distanceFrom()) / (Math.PI / 180);

    const yAxisMin = diagonal.rotate(-angleToX).flipY();
    const yAxisPoint = pointer.subtract(origin).rotate(-angle - angleToX);

    const minSize = new Point(cropCoords.bl).subtract(origin).rotate(-angle).flipX();
    const proportionalScaling = Math.max(yAxisPoint.y / yAxisMin.y, minSize.x / scaledWidth, minSize.y / scaledHeight);

    const localPoint = new Point(-scaledWidth * proportionalScaling, scaledHeight * proportionalScaling);

    const tl = new Point(localPoint.x, 0).rotate(angle).add(origin);
    const crop = tl.subtract(cropCoords.tl).rotate(-angle).flipX().flipY();

    const scaleX = -localPoint.x / scaledWidth;
    const scaleY = localPoint.y / scaledHeight;

    return {
      cropData: {
        ...cropData,
        cropX: crop.x,
        cropY: crop.y,
        scaleX: cropData.scaleX * scaleX,
        scaleY: cropData.scaleY * scaleY,
        width: cropData.width / scaleX,
        height: cropData.height / scaleY,
      },
      sourceData: { ...sourceData, left: tl.x, top: tl.y },
    };
  },
  mt({ pointer, cropData, cropCoords, sourceData, sourceCoords }) {
    // TODO:
    return { cropData, sourceData };
  },
  mb({ pointer, cropData, cropCoords, sourceData, sourceCoords }) {
    // TODO:
    return { cropData, sourceData };
  },
  ml({ pointer, cropData, cropCoords, sourceData, sourceCoords }) {
    // TODO:
    return { cropData, sourceData };
  },
  mr({ pointer, cropData, cropCoords, sourceData, sourceCoords }) {
    // TODO:
    return { cropData, sourceData };
  },
};
