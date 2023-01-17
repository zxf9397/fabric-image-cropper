export class CSSTransform {
  private transform = '';

  get value() {
    return this.transform;
  }

  translate3d(x = 0, y = 0, z = 0) {
    this.transform += `translate3d(${x}px, ${y}px, ${z}px) `;
    return this;
  }

  rotate(deg: number) {
    this.transform += `rotate(${deg}deg) `;
    return this;
  }

  scaleX(scaleX: number) {
    this.transform += `scaleX(${scaleX}) `;
    return this;
  }

  scaleY(scaleY: number) {
    this.transform += `scaleY(${scaleY}) `;
    return this;
  }
}
