import type { ICropData, ISourceData, ISourceTransform } from './cropper/data.d';

export enum AttributesData {
  BorderName = 'data-border-name',
  ActionName = 'data-action-name',
  ActionCursor = 'data-action-cursor',
  ActionCorner = 'data-action-corner',
  CornerName = 'data-corner-name',
}

export enum ActionName {
  Move = 'move',
  Moving = 'moving',
  Scale = 'scale',
  Scaling = 'scaling',
  Crop = 'crop',
  Cropping = 'cropping',
}

export const DEFAULT_BORDER_WIDTH = 2;
export const DEFAULT_BORDER_COLOR = 'tomato';

export const DEFAULT_CONTROL_COLOR = '#fff';
export const DEFAULT_ACTIVE_CONTROL_COLOR = 'tomato';

export const DEFAULT_CROPPED_DATA: Required<ICropData> = {
  angle: 0,
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  scaleX: 1,
  scaleY: 1,
  flipX: false,
  flipY: false,
  cropX: 0,
  cropY: 0,
};

export const DEFAULT_SOURCE_DATA: Required<ISourceData> = {
  width: 0,
  height: 0,
};

export const DEFAULT_SOURCE_TRANSFORM: Required<ISourceTransform> = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
};

export const DEFAULT_CORNER = {
  width: 32,
  height: 32,
  lineWidth: 4,
  strokeWidth: 2,
  lineLength: 8,
  fill: '#fff',
  stroke: '#cccc',
};
