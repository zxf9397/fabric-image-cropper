import * as CSS from 'csstype';
import type { IControlType } from '../controls/data.d';
import type { Point } from '../utils/point.class';

export interface ICropData {
  angle: number;
  left: number;
  top: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  flipX: boolean;
  flipY: boolean;
  cropX: number;
  cropY: number;
}

export interface ISourceData {
  width: number;
  height: number;
}

export interface ISourceTransform extends ISourceData {
  left: number;
  top: number;
}

export type CSSCursor = CSS.Property.Cursor;

export interface IControlCoords extends Record<IControlType, Point> {}

export interface CropInfo {
  src: string;
}

export interface ImageCropperOptions extends CropInfo {
  visible: boolean;
  containerOffsetX: number;
  containerOffsetY: number;
  borderWidth: number;
  borderColor: CSS.Properties['color'];
}

export type CropStart = 'crop';

export type CropEnd = 'confirm' | 'cancel';

export interface CropChangeCallback {
  (state: boolean, type: CropStart | CropEnd): void;
}

export interface IActionHandler {
  (cropData: ICropData, sourceData: ISourceData): void;
}

export interface ICropActionHandler {
  (cropData: ICropData, sourceData: ISourceData): void;
}

export interface IListener
  extends Readonly<{
    start(): void;
    cropping: ICropActionHandler;
    confirm: ICropActionHandler;
    cancel: ICropActionHandler;
    end: ICropActionHandler;
  }> {}
