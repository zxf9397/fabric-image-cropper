import * as CSS from 'csstype';
import { CSSTransform } from '../utils/cssTransform.class';
import { createElement, setCSSProperties } from '../utils/tools';

export class Border {
  public borderName = '';
  public x = 0;
  public y = 0;
  public width = '0';
  public height = '0';
  public color = 'tomato';
  public scaleX = 1;
  public scaleY = 1;
  public offsetX = '0';
  public offsetY = '0';

  public element: HTMLDivElement;

  constructor(options?: Partial<Border>) {
    Object.assign(this, options);

    this.element = this.createElement();
  }

  public createElement(): HTMLDivElement {
    return createElement('div', { style: this.getStyles() });
  }

  private getStyles(): CSS.PropertiesHyphen {
    return {
      position: 'absolute',
      left: `${(1 + this.x) * 50}%`,
      top: `${(1 + this.y) * 50}%`,
      width: `${this.width}`,
      height: `${this.height}`,
      'background-color': this.color,
      transform: this.translate('-50%', '-50%') + this.scale(this.scaleX, this.scaleY),
      'transform-origin': 'center center',
    };
  }

  public actionHandler(): Partial<Border> {
    return this;
  }

  public translate(x: string | number, y: string | number) {
    return new CSSTransform().translate(x, y).value;
  }

  public scale(x: number, y: number) {
    return new CSSTransform().scaleX(x).scaleY(y).value;
  }

  public render() {
    Object.assign(this, this.actionHandler());

    setCSSProperties(this.element, this.getStyles());
  }
}
