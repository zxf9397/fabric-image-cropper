import { CornerType } from '../data.d';
import { createElement, Point, setCSSProperties } from '../utils/tools';

export interface ActionEvent {
  e: MouseEvent;
  pointer: Point;
  target: Required<fabric.Image>;
  corner: string;
}

const CorsorMap = ['ns', 'nesw', 'ew', 'nwse', 'ns', 'nesw', 'ew', 'nwse'];

function wrapEventHandler() {}

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
    return createElement('div');
  }

  render() {
    if (!this.element) {
      return;
    }

    setCSSProperties(this.element, {
      left: `${(this.x + 1) * 50}%`,
      top: `${(this.y + 1) * 50}%`,
      transform: `translate3d(-50%, -50%, 0) translate3d(${this.offsetX}px, ${this.offsetY}px, 0) rotate(${this.angle}deg)`,
      cursor: this.cursorStyle,
    });
  }
}
