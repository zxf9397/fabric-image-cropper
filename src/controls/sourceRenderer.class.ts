import type { IRenderFunctionParam } from './data.d';

import { AttributesData } from '../const';
import { Renderer } from './renderer.class';
import { createElement, createCornerCtrlEl, createMiddleCtrlEl } from '../utils/createElement';
import { Control } from '../components/control.class';
import { CSSTransform } from '../utils/cssTransform.class';
import { setCSSProperties } from '../utils/tools';

export class SourceRenderer extends Renderer {
  controls = {
    tl: new Control({ x: -1, y: -1, angle: 0, createElement: createCornerCtrlEl('tl'), actionName: 'scale' }),
    tr: new Control({ x: 1, y: -1, angle: 90, createElement: createCornerCtrlEl('tr'), actionName: 'scale' }),
    br: new Control({ x: 1, y: 1, angle: 180, createElement: createCornerCtrlEl('br'), actionName: 'scale' }),
    bl: new Control({ x: -1, y: 1, angle: 270, createElement: createCornerCtrlEl('bl'), actionName: 'scale' }),
    ml: new Control({
      visible: false,
      x: -1,
      y: 0,
      angle: 90,
      createElement: createMiddleCtrlEl('ml'),
      actionName: 'scale',
    }),
    mr: new Control({
      visible: false,
      x: 1,
      y: 0,
      angle: 90,
      createElement: createMiddleCtrlEl('mr'),
      actionName: 'scale',
    }),
    mt: new Control({
      visible: false,
      x: 0,
      y: -1,
      angle: 0,
      createElement: createMiddleCtrlEl('mt'),
      actionName: 'scale',
    }),
    mb: new Control({
      visible: false,
      x: 0,
      y: 1,
      angle: 0,
      createElement: createMiddleCtrlEl('mb'),
      actionName: 'scale',
    }),
  };

  constructor(options?: Partial<SourceRenderer>) {
    super(options);

    this.addBordersAndControls();
  }

  protected createElement() {
    const container = createElement('div', { classList: ['ic-source-container'] });

    const lower = createElement('div', { classList: ['ic-source-lower'] });

    const image = createElement('img', { classList: ['ic-source-image'] });

    lower.appendChild(image);

    const upper = createElement('div', { classList: ['ic-source-upper'] });

    container.append(lower, upper);

    return { container, lower, image, upper };
  }

  protected renderBefore(param: IRenderFunctionParam): void {
    const { croppedData, sourceData, angle } = param;
    this.elements.upper.setAttribute(AttributesData.ActionCursor, 'move');
    this.elements.upper.setAttribute(AttributesData.ActionName, 'move');

    const domScaleX = croppedData.scaleX;
    const domScaleY = croppedData.scaleY;

    const containerStyle = {
      width: `${sourceData.width}px`,
      height: `${sourceData.height}px`,
      transform: new CSSTransform().matrix([
        angle.cos * croppedData.scaleX,
        angle.sin * croppedData.scaleX,
        -angle.sin * croppedData.scaleY,
        angle.cos * croppedData.scaleY,
        sourceData.left,
        sourceData.top,
      ]).value,
    };

    setCSSProperties(this.elements.lower, containerStyle);

    setCSSProperties(this.elements.upper, containerStyle);

    setCSSProperties(this.elements.image, {
      transform: new CSSTransform().scaleX(croppedData.flipX ? -1 : 1).scaleY(croppedData.flipY ? -1 : 1).value,
    });

    this.domScaleX = this.scale / domScaleX;
    this.domScaleY = this.scale / domScaleY;
  }
}
