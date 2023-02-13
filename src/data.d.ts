import * as CSS from 'csstype';

export interface IElementParam<T extends keyof HTMLElementTagNameMap> {
  classList?: string[];
  className?: string;
  style?: CSS.PropertiesHyphen;
}
