import * as CSS from 'csstype';

export type RightAngleCornerType = 'tl' | 'tr' | 'br' | 'bl';
export type MiddleCornerType = 'mt' | 'mr' | 'mb' | 'ml';
export type CornerType = RightAngleCornerType | MiddleCornerType;

export interface IElementParam<T extends keyof HTMLElementTagNameMap> {
  classList?: string[];
  style?: CSS.PropertiesHyphen;
}
