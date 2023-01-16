import * as CSS from 'csstype';
import { Point } from './utils/tools';

export type RightAngleCornerType = 'tl' | 'tr' | 'br' | 'bl';
export type MiddleCornerType = 'mt' | 'mr' | 'mb' | 'ml';
export type CornerType = RightAngleCornerType | MiddleCornerType;

export interface SourceBoxData {
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  src: string;
}

export interface CropBoxData extends SourceBoxData {
  cropX: number;
  cropY: number;
}

export interface ControlsContainer {
  el: HTMLElement;
  sourceBox: {
    render(sourceBox: SourceBoxData, cropBox: CropBoxData): Promise<void>;
    coords: Map<CornerType, HTMLDivElement>;
  };
  cropBox: {
    render(sourceBox: SourceBoxData, cropBox: CropBoxData): Promise<void>;
    coords: Map<CornerType, HTMLDivElement>;
  };
}

export interface IElementParam<T extends keyof HTMLElementTagNameMap> {
  classList?: string[];
  style?: CSS.PropertiesHyphen;
}

export type EventCallback = (event: { e: MouseEvent; type: string; pointer: Point; coord?: CornerType }) => void;

export interface ControlsRendererOptions {}

export interface FabricImageCropperOptions {}
