import type { Point } from '../utils/point.class';
import type { Control } from './controls.class';

export type ICornerControlType = 'tl' | 'tr' | 'bl' | 'br';

export type IMiddleControlType = 'ml' | 'mr' | 'mt' | 'mb';

export type IControlType = ICornerControlType | IMiddleControlType;

export interface IControlCoords extends Record<IControlType, Point> {}

export interface IControls extends Record<IControlType, Control> {}
