import * as CSS from 'csstype';

import { AttributesData, DEFAULT_BORDER_COLOR } from '../const';
import { createElement } from '../utils/createElement';
import { CSSTransform } from '../utils/cssTransform.class';
import { setCSSProperties } from '../utils/tools';

export class Border {
  /**
   * Name of the border.
   */
  public borderName = '';

  /**
   * Relative position of the border X.
   * 0 is the center of the Renderer, while -1 (left) or 1 (right).
   * @default 0
   */
  public x = 0;

  /**
   * Relative position of the border Y.
   * 0 is the center of the Renderer, while -1 (top) or 1 (bottom).
   * @default 0
   */
  public y = 0;

  /**
   * Width of the border.
   * Use % end sign to indicate the percentage of the Renderer width, or use px end to set the border width.
   * @default '0'
   */
  public width = '0';

  /**
   * Height of the border.
   * Use % end sign to indicate the percentage of the Renderer height, or use px end to set the border height.
   * @default '0'
   */
  public height = '0';

  /**
   * Color of the border
   */
  public color: CSS.PropertiesHyphen['color'] = DEFAULT_BORDER_COLOR;

  public scaleX = 1;
  public scaleY = 1;

  public element: HTMLDivElement;

  constructor(options?: Partial<Border>) {
    Object.assign(this, options);

    this.element = this.createElement();
  }

  public createElement() {
    return createElement('div', { className: 'ic-border', style: this.getRenderStyle() });
  }

  private getRenderStyle(): CSS.PropertiesHyphen {
    return {
      left: `${(1 + this.x) * 50}%`,
      top: `${(1 + this.y) * 50}%`,
      width: `${this.width || 0}`,
      height: `${this.height || 0}`,
      'background-color': this.color || DEFAULT_BORDER_COLOR,
      transform: new CSSTransform().translate('-50%', '-50%').scaleX(this.scaleX).scaleY(this.scaleY).value,
    };
  }

  public actionHandler(): Partial<Border> {
    return this;
  }

  public render() {
    Object.assign(this, this.actionHandler());

    this.element.setAttribute(AttributesData.BorderName, this.borderName);

    setCSSProperties(this.element, this.getRenderStyle());
  }
}
