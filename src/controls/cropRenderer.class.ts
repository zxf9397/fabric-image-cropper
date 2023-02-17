import type { IRenderFunctionParam } from './data.d';

import { AttributesData } from '../const';
import { Renderer } from './renderer.class';
import { createElement, createCornerCtrlEl, createMiddleCtrlEl } from '../utils/createElement';
import { Control } from '../components/control.class';
import { CSSTransform } from '../utils/cssTransform.class';
import { setCSSProperties } from '../utils/tools';

export class CropRenderer extends Renderer {
  public controls = {
    tl: new Control({ x: -1, y: -1, angle: 0, createElement: createCornerCtrlEl('tl'), actionName: 'crop' }),
    tr: new Control({ x: 1, y: -1, angle: 90, createElement: createCornerCtrlEl('tr'), actionName: 'crop' }),
    br: new Control({ x: 1, y: 1, angle: 180, createElement: createCornerCtrlEl('br'), actionName: 'crop' }),
    bl: new Control({ x: -1, y: 1, angle: 270, createElement: createCornerCtrlEl('bl'), actionName: 'crop' }),
    ml: new Control({ x: -1, y: 0, angle: 90, createElement: createMiddleCtrlEl('ml'), actionName: 'crop' }),
    mr: new Control({ x: 1, y: 0, angle: 90, createElement: createMiddleCtrlEl('mr'), actionName: 'crop' }),
    mt: new Control({ x: 0, y: -1, angle: 0, createElement: createMiddleCtrlEl('mt'), actionName: 'crop' }),
    mb: new Control({ x: 0, y: 1, angle: 0, createElement: createMiddleCtrlEl('mb'), actionName: 'crop' }),
  };

  constructor() {
    super();

    this.addBordersAndControls();
  }

  protected createElement() {
    const container = createElement('div', { classList: ['ic-crop-container'] });

    const lower = createElement('div', { classList: ['ic-crop-lower'] });

    const image = createElement('img', { classList: ['ic-crop-image'] });

    lower.append(image);

    const upper = createElement('div', { classList: ['ic-crop-upper'] });

    container.append(lower, upper);

    return { container, lower, image, upper };
  }

  protected renderBefore(param: IRenderFunctionParam) {
    const { croppedData, sourceData, angle, croppedBackup } = param;
    this.elements.upper.setAttribute(AttributesData.ActionCursor, 'move');
    this.elements.upper.setAttribute(AttributesData.ActionName, 'move');

    const cropScaleX = croppedData.width / croppedBackup.width;
    const cropScaleY = croppedData.height / croppedBackup.height;
    const scaleX = croppedData.scaleX * cropScaleX;
    const scaleY = croppedData.scaleY * cropScaleY;

    const containerStyle = {
      width: `${croppedBackup.width}px`,
      height: `${croppedBackup.height}px`,
      transform: new CSSTransform().matrix([
        angle.cos * scaleX,
        angle.sin * scaleX,
        -angle.sin * scaleY,
        angle.cos * scaleY,
        croppedData.left,
        croppedData.top,
      ]).value,
    };

    setCSSProperties(this.elements.lower, containerStyle);

    setCSSProperties(this.elements.upper, containerStyle);

    setCSSProperties(this.elements.image, {
      width: `${sourceData.width}px`,
      height: `${sourceData.height}px`,
      transform: new CSSTransform()
        .translate(
          -((croppedData.cropX - (croppedData.flipX ? sourceData.width : 0)) / cropScaleX),
          -((croppedData.cropY - (croppedData.flipY ? sourceData.height : 0)) / cropScaleY)
        )
        .scaleX((croppedData.flipX ? -1 : 1) / cropScaleX)
        .scaleY((croppedData.flipY ? -1 : 1) / cropScaleY).value,
    });

    this.domScaleX = this.scale / scaleX;
    this.domScaleY = this.scale / scaleY;

    const w = croppedData.width * croppedData.scaleX;
    const h = croppedData.height * croppedData.scaleY;

    if (w < 40 * this.scale) {
      [this.controls.mt, this.controls.mb].map((ctrl) => (ctrl.visible = false));
    } else {
      [this.controls.mt, this.controls.mb].map((ctrl) => (ctrl.visible = true));
    }

    if (h < 40 * this.scale) {
      [this.controls.ml, this.controls.mr].map((ctrl) => (ctrl.visible = false));
    } else {
      [this.controls.ml, this.controls.mr].map((ctrl) => (ctrl.visible = true));
    }
  }
}
