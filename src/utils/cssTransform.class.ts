function toNumberPadEnd(param: number | string, numPadEnd: string) {
  return typeof param === 'number' ? param + numPadEnd : param;
}

export class CSSTransform {
  private transform = '';

  public get value() {
    return this.transform;
  }

  public translate(x: number | string = 0, y: number | string = 0) {
    this.transform += `translate(${toNumberPadEnd(x, 'px')}, ${toNumberPadEnd(y, 'px')}) `;
    return this;
  }

  public rotate(deg: number) {
    this.transform += `rotate(${deg}deg) `;
    return this;
  }

  public scaleX(scaleX: number) {
    this.transform += `scaleX(${scaleX}) `;
    return this;
  }

  public scaleY(scaleY: number) {
    this.transform += `scaleY(${scaleY}) `;
    return this;
  }

  public matrix(matrix: [number, number, number, number, number, number]) {
    this.transform += `matrix(${matrix[0]},${matrix[1]},${matrix[2]},${matrix[3]},${matrix[4]},${matrix[5]}) `;
    return this;
  }
}
