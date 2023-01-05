import { createCornerSVG, createElement, findCornerQuadrant, setCSSProperties } from './utils/tools';
import { ControlsContainer, ControlsRendererOptions, CoordType, CropBoxData, EventCallback, DragBoxData } from './data.d';

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

type ListenerEvent =
  | 'dCoord:down'
  | 'dCoord:moving'
  | 'dCoord:up'
  | 'cCoord:down'
  | 'cCoord:moving'
  | 'cCoord:up'
  | 'object:down'
  | 'object:moving'
  | 'object:up';

export class ControlsRenderer {
  private container?: ControlsContainer;

  private listener = new Map<ListenerEvent, Set<EventCallback>>();

  constructor(private canvas: fabric.Canvas, options: ControlsRendererOptions) {}

  public removeContainer = () => {
    this.container?.el.remove();
  };

  public clear = () => {
    if (this.container) {
      setCSSProperties(this.container.el, { display: 'none' });
    }
  };

  private currentEvent: ListenerEvent | null = null;
  private actionCoord?: CoordType;

  private handleMouseMove = (e: MouseEvent) => {
    const type = this.currentEvent;
    const coord = this.actionCoord;

    if (type) {
      this.fire(type, { e, type, coord });
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

    document.body.addEventListener('mousemove', this.handleMouseMove);
    document.body.addEventListener('mouseup', () => {
      this.currentEvent = null;
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

    [upperDragCoordsBox, upperCropCoordsBox].forEach((el) => {
      el.addEventListener('mousedown', (e) => {
        if (e.target === el) {
          this.currentEvent = 'object:moving';
          this.fire('object:down', { e, type: 'drag' });
        }
      });
      el.addEventListener('mouseup', (e) => {
        this.currentEvent = null;
        this.fire('object:up', { e, type: 'drag' });
      });
    });

    upperDragCoords.forEach((el, type) => {
      el.addEventListener('mousedown', (e) => {
        this.currentEvent = 'dCoord:moving';
        this.actionCoord = type;
        this.fire('dCoord:down', { e, type });
      });

      el.addEventListener('mouseup', (e) => {
        this.currentEvent = null;
        delete this.actionCoord;
        this.fire('dCoord:up', { e, type });
      });
    });

    upperCropCoords.forEach((el, type) => {
      el.addEventListener('mousedown', (e) => {
        this.currentEvent = 'cCoord:moving';
        this.actionCoord = type;
        this.fire('cCoord:down', { e, type });
      });

      el.addEventListener('mouseup', (e) => {
        this.currentEvent = null;
        delete this.actionCoord;
        this.fire('cCoord:up', { e, type });
      });
    });

    upper.append(upperDrag, upperCrop);

    container.append(lower, upper);

    upperCanvasEl.after(container);

    let dragImageLoad: () => void;
    let dragImageError: () => void;
    let cropImageLoad: () => void;
    let cropImageError: () => void;
    dragImage.onload = () => dragImageLoad();
    dragImage.onerror = () => dragImageError();
    cropImage.onload = () => cropImageLoad();
    cropImage.onerror = () => cropImageError();

    return (this.container = {
      el: container,
      dragBox: {
        async render(dragBox, cropBox) {
          return new Promise((resolve, reject) => {
            const { left, top, width, height, angle, src } = dragBox;

            dragImageLoad = resolve;
            dragImageError = reject;
            dragImage.src = src;

            setCSSProperties(lowerDrag, {
              width: `${width}px`,
              height: `${height}px`,
              transform: `translate3d(${left}px, ${top}px, 0) rotate(${angle}deg)`,
            });

            setCSSProperties(upperDragCoordsBox, {
              width: `${width}px`,
              height: `${height}px`,
              transform: `translate3d(${left}px, ${top}px, 0) rotate(${angle}deg)`,
            });
          });
        },
        coords: upperDragCoords,
      },
      cropBox: {
        async render(dragBox, cropBox) {
          return new Promise((resolve, reject) => {
            cropImageLoad = resolve;
            cropImageError = reject;
            cropImage.src = cropBox.src;

            setCSSProperties(lowerCrop, {
              width: `${cropBox.width}px`,
              height: `${cropBox.height}px`,
              transform: `translate3d(${cropBox.left}px, ${cropBox.top}px, 0) rotate(${cropBox.angle}deg)`,
            });

            setCSSProperties(cropImage, {
              width: `${dragBox.width}px`,
              height: `${dragBox.height}px`,
              transform: `translate3d(${-cropBox.cropX}px, ${-cropBox.cropY}px, 0)`,
            });

            setCSSProperties(upperCropCoordsBox, {
              width: `${cropBox.width}px`,
              height: `${cropBox.height}px`,
              transform: `translate3d(${cropBox.left}px, ${cropBox.top}px, 0) rotate(${cropBox.angle}deg)`,
            });
          });
        },
        coords: upperCropCoords,
      },
    });
  }

  public on = (type: ListenerEvent, callback: EventCallback) => {
    let callbacks = this.listener.get(type);

    if (!callbacks) {
      callbacks = new Set();
      this.listener.set(type, callbacks);
    }

    callbacks.add(callback);
  };

  public off = (type: ListenerEvent, callback: EventCallback) => {
    const callbacks = this.listener.get(type);

    if (callbacks) {
      callbacks.delete(callback);
    }
  };

  private fire(type: ListenerEvent, data: { e: MouseEvent; type: string; coord?: CoordType }) {
    const callbacks = this.listener.get(type);

    if (callbacks && this.container) {
      const { clientLeft, clientTop } = this.container.el;
      const { e, type, coord } = data;
      callbacks.forEach((callback) => {
        callback({ e, type, pointer: { x: e.clientX - clientLeft * 5, y: e.clientY - clientTop * 5 }, coord });
      });
    }
  }

  public requestRender = async (actice: Required<fabric.Image>, cropBox: CropBoxData, dragBox: DragBoxData) => {
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

    await Promise.all([this.container.dragBox.render(dragBox, cropBox), this.container.cropBox.render(dragBox, cropBox)]);
  };
}
