import { createCornerSVG, createElement, findCornerQuadrant, setCSSProperties } from './utils/tools';
import { ControlsContainer, ControlsRendererOptions, CoordType, CropBoxData, DragBoxData } from './data.d';

const scaleMap = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne', 'e'];

const cornerStyleMap: Record<CoordType, { classList: string[] }> = {
  tl: { classList: ['c-coord', 'tl'] },
  mt: { classList: ['m-coord', 'mt'] },
  tr: { classList: ['c-coord', 'tr'] },
  mr: { classList: ['m-coord', 'mr'] },
  br: { classList: ['c-coord', 'br'] },
  mb: { classList: ['m-coord', 'mb'] },
  bl: { classList: ['c-coord', 'bl'] },
  ml: { classList: ['m-coord', 'ml'] },
};

export class ControlsRenderer {
  private container?: ControlsContainer;

  constructor(private canvas: fabric.Canvas, options: ControlsRendererOptions) {}

  public removeContainer = () => {
    this.container?.el.remove();
  };

  public clear = () => {
    if (this.container) {
      setCSSProperties(this.container.el, { display: 'none' });
    }
  };

  private createContainer() {
    const upperCanvasEl = (this.canvas as any).upperCanvasEl as HTMLCanvasElement;
    const { borderLeftWidth, borderTopWidth, border } = window.getComputedStyle(upperCanvasEl);

    const container = createElement({
      tagName: 'div',
      classList: ['fb-cropper-container'],
      style: {
        display: 'none',
        position: 'relative',
        width: `${upperCanvasEl.width}px`,
        height: `${upperCanvasEl.height}px`,
        border: border,
        'border-left-width': borderLeftWidth,
        'border-top-width': borderTopWidth,
      },
    });

    const lower = createElement({ tagName: 'div', classList: ['fb-cropper-lower'] });

    const lowerDrag = createElement({ tagName: 'div', classList: ['lower-drag'] });
    const dragImage = createElement({ tagName: 'img' });
    lowerDrag.appendChild(dragImage);

    const lowerCrop = createElement({ tagName: 'div', classList: ['lower-crop'] });
    const cropImage = createElement({ tagName: 'img' });
    lowerCrop.appendChild(cropImage);

    lower.append(lowerDrag, lowerCrop);

    const upper = createElement({ tagName: 'div', classList: ['fb-cropper-upper'] });

    const upperDrag = createElement({ tagName: 'div', classList: ['upper-box'] });
    const upperDragCoordsBox = createElement({ tagName: 'div', classList: ['upper-box-coords'] });
    upperDrag.appendChild(upperDragCoordsBox);

    const upperDragCoords = new Map<CoordType, HTMLDivElement>();
    for (const key in cornerStyleMap) {
      const coordKey = key as keyof typeof cornerStyleMap;

      const classList = cornerStyleMap[coordKey].classList;

      const coord = createElement({ tagName: 'div', classList });

      if (classList.includes('c-coord')) {
        coord.appendChild(createCornerSVG());
      }
      upperDragCoords.set(coordKey, coord);
      upperDragCoordsBox.appendChild(coord);
    }

    const upperCrop = createElement({ tagName: 'div', classList: ['upper-box'] });
    const upperCropCoordsBox = createElement({ tagName: 'div', classList: ['upper-box-coords'] });
    upperCrop.appendChild(upperCropCoordsBox);

    const upperCropCoords = new Map<CoordType, HTMLDivElement>();
    for (const key in cornerStyleMap) {
      const coordKey = key as keyof typeof cornerStyleMap;

      const classList = cornerStyleMap[coordKey].classList;

      const coord = createElement({ tagName: 'div', classList });

      if (classList.includes('c-coord')) {
        coord.appendChild(createCornerSVG());
      }

      upperCropCoords.set(coordKey, coord);
      upperCropCoordsBox.appendChild(coord);
    }

    upper.append(upperDrag, upperCrop);

    container.append(lower, upper);

    upperCanvasEl.after(container);

    return (this.container = {
      el: container,
      dragBox: {
        render(dragBox, cropBox) {
          const { left, top, width, height, angle, src } = dragBox;
          setCSSProperties(lowerDrag, {
            width: `${width}px`,
            height: `${height}px`,
            transform: `translate3d(${left}px, ${top}px, 0) rotate(${angle}deg)`,
          });
          dragImage.src = src;

          setCSSProperties(upperDragCoordsBox, {
            width: `${width}px`,
            height: `${height}px`,
            transform: `translate3d(${left}px, ${top}px, 0) rotate(${angle}deg)`,
          });
        },
        coords: upperDragCoords,
      },
      cropBox: {
        render(dragBox, cropBox) {
          setCSSProperties(lowerCrop, {
            width: `${cropBox.width}px`,
            height: `${cropBox.height}px`,
            transform: `translate3d(${cropBox.left}px, ${cropBox.top}px, 0) rotate(${cropBox.angle}deg)`,
          });
          cropImage.src = cropBox.src;

          setCSSProperties(cropImage, {
            width: `${dragBox.width}px`,
            height: `${dragBox.height}px`,
            transform: `translate3d(${-cropBox.cropX}px, ${-cropBox.cropY}px, 0)`,
          });

          setCSSProperties(upperCropCoordsBox, {
            width: `${dragBox.width}px`,
            height: `${dragBox.height}px`,
            transform: `translate3d(${cropBox.left}px, ${cropBox.top}px, 0) rotate(${cropBox.angle}deg)`,
          });
        },
        coords: upperCropCoords,
      },
    });
  }

  public render = (actice: Required<fabric.Image>, cropBox: CropBoxData, dragBox: DragBoxData) => {
    this.container ||= this.createContainer();

    setCSSProperties(this.container.el, { display: 'block' });

    for (const key in cornerStyleMap) {
      const cornerKey = key as keyof typeof cornerStyleMap;

      const dragCoord = this.container.dragBox.coords.get(cornerKey);
      const cropCoord = this.container.cropBox.coords.get(cornerKey);

      const control = actice.controls[cornerKey];
      const n = findCornerQuadrant(actice, control);

      dragCoord && setCSSProperties(dragCoord, { cursor: `${scaleMap[n]}-resize` });
      cropCoord && setCSSProperties(cropCoord, { cursor: `${scaleMap[n]}-resize` });
    }

    this.container.dragBox.render(dragBox, cropBox);
    this.container.cropBox.render(dragBox, cropBox);
  };
}
