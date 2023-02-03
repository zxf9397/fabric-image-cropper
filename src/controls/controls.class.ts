import { createElement, setCSSProperties } from '../utils/tools';

import type { IPoint } from '../utils/point.class';

export interface ActionEvent {
  e: MouseEvent;
  pointer: IPoint;
  target: Required<fabric.Image>;
  corner: string;
}

export class Control {
  visible = true;
  actionName = '';
  angle = 0;
  x = 0;
  y = 0;
  offsetX = 0;
  offsetY = 0;
  cursorStyle = 'default';

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

    this.element.setAttribute('data-action-name', this.actionName);

    setCSSProperties(this.element, {
      left: `${(this.x + 1) * 50}%`,
      top: `${(this.y + 1) * 50}%`,
      transform: `translate3d(-50%, -50%, 0) translate3d(${this.offsetX}px, ${this.offsetY}px, 0) rotate(${this.angle}deg)`,
      // cursor: this.cursorStyle,
    });
  }
}
