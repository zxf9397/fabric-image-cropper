import * as CSS from 'csstype';
import { Point } from './utils/tools';

export type CoordType = 'tl' | 'mt' | 'tr' | 'mr' | 'br' | 'mb' | 'bl' | 'ml';

export interface DragBoxData {
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  src: string;
}

export interface CropBoxData extends DragBoxData {
  cropX: number;
  cropY: number;
}

export interface ControlsContainer {
  el: HTMLElement;
  dragBox: {
    render(dragBox: DragBoxData, cropBox: CropBoxData): Promise<void>;
    coords: Map<CoordType, HTMLDivElement>;
  };
  cropBox: {
    render(dragBox: DragBoxData, cropBox: CropBoxData): Promise<void>;
    coords: Map<CoordType, HTMLDivElement>;
  };
}

export interface IElementParam<T extends keyof HTMLElementTagNameMap> {
  tagName: T;
  classList?: string[];
  style?: CSS.PropertiesHyphen;
}

export type EventCallback = (event: { e: MouseEvent; type: string; pointer: Point; coord?: CoordType }) => void;

export interface ControlsRendererOptions {}

export interface FabricImageCropperOptions {}
