import { createElement, setCSSProperties } from '../utils/tools';

import type { IPoint } from '../utils/point.class';
import { CSSTransform } from '../utils/cssTransform.class';
import { degreeWithin0to360 } from '../utils/angle.class';
import { AttributesData } from './const';

export interface ActionEvent {
  e: MouseEvent;
  pointer: IPoint;
  target: Required<fabric.Image>;
  corner: string;
}

export class Control {
  public visible = true;
  public actionName = '';
  public angle = 0;
  public x = 0;
  public y = 0;
  public offsetX = 0;
  public offsetY = 0;
  public scaleX = 1;
  public scaleY = 1;
  public cursorStyle = 'default';

  element?: HTMLElement;

  constructor(options?: Partial<Control>) {
    Object.assign(this, options);

    this.element = this.createElement();

    this.render();
  }

  actionHandler(e: ActionEvent) {}

  mouseDownHandler(e: ActionEvent) {}

  mouseUpHandler(e: ActionEvent) {}

  cursorStyleHandler(e: ActionEvent, control: Control) {
    return control.cursorStyle;
  }

  createElement(): HTMLElement {
    this.element?.remove();
    const element = createElement('div');
    if (!this.visible) {
      setCSSProperties(element, { display: 'none' });
    }
    return element;
  }

  render() {
    if (!this.element) {
      return;
    }

    if (!this.visible) {
      setCSSProperties(this.element, { display: 'none' });
    }

    this.element.setAttribute(AttributesData.ActionName, this.actionName);

    setCSSProperties(this.element, {
      left: `${(this.x + 1) * 50}%`,
      top: `${(this.y + 1) * 50}%`,
      transform: new CSSTransform()
        .translate('-50%', '-50%')
        .translate(this.offsetX, this.offsetY)
        .rotate(this.angle)
        .scaleX(this.angle % 180 === 90 ? this.scaleY : this.scaleX)
        .scaleY(this.angle % 180 === 90 ? this.scaleX : this.scaleY).value,
    });
  }
}
