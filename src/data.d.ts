import * as CSS from 'csstype';

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
    render(dragBox: DragBoxData, cropBox: CropBoxData): void;
    coords: Map<CoordType, HTMLDivElement>;
  };
  cropBox: {
    render(dragBox: DragBoxData, cropBox: CropBoxData): void;
    coords: Map<CoordType, HTMLDivElement>;
  };
}

export interface IElementParam<T extends keyof HTMLElementTagNameMap> {
  tagName: T;
  classList?: string[];
  style?: CSS.PropertiesHyphen;
}

export interface ControlsRendererOptions {}

export interface FabricImageCropperOptions {}
