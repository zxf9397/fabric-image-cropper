import * as CSS from 'csstype';

import { AttributesData } from '../const';
import { createElement } from '../utils/createElement';
import { CSSTransform } from '../utils/cssTransform.class';
import { setCSSProperties } from '../utils/tools';

export class Control {
  /**
   * Name of the action the control will execute.
   */
  public actionName = '';

  /**
   * Relative position of the control X.
   * 0 is the center of the Renderer, while -1 (left) or 1 (right).
   * @default 0
   */
  public x = 0;

  /**
   * Relative position of the control Y.
   * 0 is the center of the Renderer, while -1 (top) or 1 (bottom).
   * @default 0
   */
  public y = 0;

  /**
   * Control visibility.
   * @default true
   */
  public visible = true;

  /**
   * Drawing angle of the control.
   * @default 0
   */
  public angle = 0;

  public offsetX = 0;

  public offsetY = 0;

  public scaleX = 1;

  public scaleY = 1;

  public cursorStyle = 'default';

  private _element!: HTMLElement;

  public get element() {
    return this._element;
  }

  constructor(options?: Partial<Control>) {
    Object.assign(this, options);

    this._element = this.createElement();

    this.render();
  }

  public createElement() {
    this._element?.remove();
    const _element = createElement('div');
    if (!this.visible) {
      setCSSProperties(_element, { display: 'none' });
    }
    return _element;
  }

  private getRenderStyle(): CSS.PropertiesHyphen {
    return {
      left: `${(this.x + 1) * 50}%`,
      top: `${(this.y + 1) * 50}%`,
      transform: new CSSTransform()
        .translate('-50%', '-50%')
        .translate(this.offsetX, this.offsetY)
        .scaleX(this.scaleX)
        .scaleY(this.scaleY)
        .rotate(this.angle).value,
    };
  }

  public render() {
    if (!this._element) {
      return;
    }

    if (!this.visible) {
      setCSSProperties(this._element, { display: 'none' });
    }

    this._element.setAttribute(AttributesData.ActionName, this.actionName);

    setCSSProperties(this._element, this.getRenderStyle());
  }
}
