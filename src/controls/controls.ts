import { CornerType } from '../data.d';
import { createElement, Point, setCSSProperties } from '../utils/tools';

export interface ActionEvent {
  e: MouseEvent;
  pointer: Point;
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

  createElement(): HTMLElement {
    this.element?.remove();
    return createElement('div');
  }

  render() {
    if (!this.element) {
      return;
    }

    setCSSProperties(this.element, {
      left: `${this.x * 100}%`,
      top: `${this.y * 100}%`,
      transform: `translate(-50%, -50%) translate(${this.offsetX}px, ${this.offsetY}px) rotate(${this.angle}deg)`,
    });
  }
}
