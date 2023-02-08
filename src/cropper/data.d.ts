import * as CSS from 'csstype';

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
  left: number;
  top: number;
  width: number;
  height: number;
}

export type CSSCursor = CSS.Property.Cursor;
