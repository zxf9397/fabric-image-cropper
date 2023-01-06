import { ControlsRenderer } from './controlsRenderer';
import type { CropBoxData, FabricImageCropperOptions } from './data.d';
import { convertXYSystem, createLinearFunction, pedalPoint, Point } from './utils/tools';

export class FabricImageCropper {
  private cropState = false;
  private workingState = false;
  private stateChangeCallbacks = new Set<(state: boolean) => void>();

  private backupActive?: Required<fabric.Image>;
  private backupOrigin?: Required<fabric.Image>;

  private active?: Required<fabric.Image>;

  private controlsRenderer!: ControlsRenderer;

  constructor(private canvas: fabric.Canvas, options?: FabricImageCropperOptions) {
    this.controlsRenderer = new ControlsRenderer(canvas, {});

    canvas.on('mouse:move', (e) => {
      e.target;
    });

    this.controlsRenderer.on('object:down', (e) => (this.startPointer = e.pointer));
    this.controlsRenderer.on('object:moving', this.handleMove);
    this.controlsRenderer.on('object:up', this.handleMoveEnd);

    this.controlsRenderer.on('cCoord:moving', async (event) => {
      const active = this.active;
      if (!active) {
        return;
      }

      let position: Point;
      let localPosition: Point;

      switch (event.coord) {
        case 'tl':
          localPosition = active.toLocalPoint(event.pointer as fabric.Point, 'right', 'bottom');
          position = event.pointer;
          break;
        case 'tr':
          localPosition = active.toLocalPoint(event.pointer as fabric.Point, 'left', 'bottom');
          position = pedalPoint(
            convertXYSystem(localPosition, active.angle, active.aCoords.bl),
            createLinearFunction(active.aCoords.tl, active.aCoords.bl)
          );
          break;
        case 'br':
          localPosition = active.toLocalPoint(event.pointer as fabric.Point, 'left', 'top');
          position = active.aCoords.tl;
          break;
        case 'bl':
          localPosition = active.toLocalPoint(event.pointer as fabric.Point, 'right', 'top');
          position = pedalPoint(
            convertXYSystem(localPosition, active.angle, active.aCoords.tr),
            createLinearFunction(active.aCoords.tl, active.aCoords.tr)
          );
          break;
        case 'mt':
          const linear = createLinearFunction(active.aCoords.tl, active.aCoords.bl);
          position = pedalPoint(event.pointer, linear);
          localPosition = active.toLocalPoint(position as fabric.Point, 'right', 'bottom');
          break;
        case 'mr':
          const linear2 = createLinearFunction(active.aCoords.tl, active.aCoords.tr);
          position = pedalPoint(convertXYSystem(event.pointer, active.angle), linear2);
          localPosition = active.toLocalPoint(position as fabric.Point, 'right', 'bottom');
          break;
        case 'mb':
          // const linear = createLinearFunction(active.aCoords.tl, active.aCoords.bl);
          // position = pedalPoint(event.pointer, linear);
          // localPosition = active.toLocalPoint(position, 'right', 'bottom');
          break;
        case 'ml':
          // const linear = createLinearFunction(active.aCoords.tl, active.aCoords.bl);
          // position = pedalPoint(event.pointer, linear);
          // localPosition = active.toLocalPoint(position, 'right', 'bottom');
          break;
        default:
          return;
      }

      const { left: originDragBoxLeft, top: originDragBoxTop } = this.cacheData.dragBox;

      const dragBox = {
        left: originDragBoxLeft,
        top: originDragBoxTop,
        width: active.getScaledWidth(),
        height: active.getScaledHeight(),
        src: active.getSrc(),
        cropX: active.cropX,
        cropY: active.cropY,
        angle: active.angle,
      };

      const crop = active.toLocalPoint(position as fabric.Point, 'left', 'top');
      const cropBox: CropBoxData = {
        left: position.x,
        top: position.y,
        width: Math.abs(localPosition.x),
        height: Math.abs(localPosition.y),
        src: active.getSrc(),
        cropX: crop.x,
        cropY: crop.y,
        angle: active.angle,
      };

      await this.controlsRenderer.requestRender(active, cropBox, dragBox);
    });

    this.controlsRenderer.on('dCoord:moving', async (event) => {
      const active = this.active;
      if (!active) {
        return;
      }

      let position: Point;
      let localPosition: Point;

      switch (event.coord) {
        case 'tl':
          const p = pedalPoint(event.pointer, createLinearFunction(active.aCoords.tl, active.aCoords.br));

          localPosition = active.toLocalPoint(p as fabric.Point, 'right', 'bottom');
          position = p;
          break;
        case 'tr':
          const p2 = pedalPoint(event.pointer, createLinearFunction(active.aCoords.tr, active.aCoords.bl));

          localPosition = active.toLocalPoint(p2 as fabric.Point, 'left', 'bottom');
          position = pedalPoint(
            convertXYSystem(localPosition, active.angle, active.aCoords.bl),
            createLinearFunction(active.aCoords.tl, active.aCoords.bl)
          );
          break;
        case 'br':
          const p3 = pedalPoint(event.pointer, createLinearFunction(active.aCoords.br, active.aCoords.tl));

          localPosition = active.toLocalPoint(p3 as fabric.Point, 'left', 'top');
          position = active.aCoords.tl;
          break;
        case 'bl':
          const p4 = pedalPoint(event.pointer, createLinearFunction(active.aCoords.bl, active.aCoords.tr));

          localPosition = active.toLocalPoint(p4 as fabric.Point, 'right', 'top');
          position = pedalPoint(
            convertXYSystem(localPosition, active.angle, active.aCoords.tr),
            createLinearFunction(active.aCoords.tl, active.aCoords.tr)
          );
          break;
        default:
          return;
      }

      const dragBox = {
        left: position.x,
        top: position.y,
        width: Math.abs(localPosition.x),
        height: Math.abs(localPosition.y),
        src: active.getSrc(),
        cropX: active.cropX,
        cropY: active.cropY,
        angle: active.angle,
      };

      const crop = active.toLocalPoint(position as fabric.Point, 'left', 'top');
      const cropBox: CropBoxData = {
        left: active.left,
        top: active.top,
        width: active.getScaledWidth(),
        height: active.getScaledHeight(),
        src: active.getSrc(),
        cropX: -crop.x,
        cropY: -crop.y,
        angle: active.angle,
      };

      await this.controlsRenderer.requestRender(active, cropBox, dragBox);
    });
  }

  private handleCoordMove = () => {};

  private getActiveImage() {
    const active = this.canvas.getActiveObject();

    return active?.type === 'image' ? (active as Required<fabric.Image>) : null;
  }

  public onStateChange = (callback: (state: boolean) => void) => {
    this.stateChangeCallbacks.add(callback);
  };

  public offStateChange = (callback: (state: boolean) => void) => {
    this.stateChangeCallbacks.delete(callback);
  };

  private fireStateChangeCallbacks(state: boolean) {
    this.cropState = state;
    this.stateChangeCallbacks.forEach((fn) => fn(state));
  }

  private handleCrop(e: MouseEvent) {
    if (!this.workingState) return;
  }

  private cacheData = {
    cropBox: {
      left: 0,
      top: 0,
    },
    dragBox: {
      left: 0,
      top: 0,
    },
  };

  private startPointer?: Point;

  private handleMove = async (event: { e: MouseEvent; type: string; pointer: Point }) => {
    const active = this.active;
    if (!active || !this.startPointer) {
      return;
    }

    const cropBox = {
      left: active.aCoords.tl.x,
      top: active.aCoords.tl.y,
      width: active.getScaledWidth(),
      height: active.getScaledHeight(),
      src: active.getSrc(),
      cropX: active.cropX,
      cropY: active.cropY,
      angle: active.angle,
    };

    const { left: originDragBoxLeft, top: originDragBoxTop } = this.cacheData.dragBox;

    const dragBox = {
      left: originDragBoxLeft + (event.pointer.x - this.startPointer.x),
      top: originDragBoxTop + (event.pointer.y - this.startPointer.y),
      width: active.getScaledWidth(),
      height: active.getScaledHeight(),
      src: active.getSrc(),
      cropX: active.cropX,
      cropY: active.cropY,
      angle: active.angle,
    };

    await this.controlsRenderer.requestRender(active, cropBox, dragBox);
  };

  private handleMoveEnd = async (event: { e: MouseEvent; type: string; pointer: Point }) => {
    if (!this.startPointer) {
      return;
    }

    const { left: originDragBoxLeft, top: originDragBoxTop } = this.cacheData.dragBox;

    this.cacheData.dragBox = {
      left: originDragBoxLeft + (event.pointer.x - this.startPointer.x),
      top: originDragBoxTop + (event.pointer.y - this.startPointer.y),
    };
  };

  public crop = async () => {
    if (this.cropState) return;

    const actice = this.getActiveImage();
    if (!actice) {
      return;
    }

    const cropBox = {
      left: actice.aCoords.tl.x,
      top: actice.aCoords.tl.y,
      width: actice.getScaledWidth(),
      height: actice.getScaledHeight(),
      src: actice.getSrc(),
      cropX: actice.cropX,
      cropY: actice.cropY,
      angle: actice.angle,
    };

    this.cacheData.dragBox = {
      left: actice.aCoords.tl.x,
      top: actice.aCoords.tl.y,
    };

    const dragBox = {
      left: actice.aCoords.tl.x,
      top: actice.aCoords.tl.y,
      width: actice.getScaledWidth(),
      height: actice.getScaledHeight(),
      src: actice.getSrc(),
      cropX: actice.cropX,
      cropY: actice.cropY,
      angle: actice.angle,
    };

    await this.controlsRenderer.requestRender(actice, cropBox, dragBox);

    this.active = actice;
    this.canvas.discardActiveObject();
    this.canvas.renderAll();

    this.fireStateChangeCallbacks(true);
  };

  public confirm = () => {
    if (!this.cropState || !this.active) return;

    this.canvas.setActiveObject(this.active);
    this.canvas.renderAll();

    this.controlsRenderer.clear();

    this.fireStateChangeCallbacks(false);
  };

  public cancel = () => {
    if (!this.cropState || !this.active) return;

    this.canvas.setActiveObject(this.active);
    this.canvas.renderAll();

    this.controlsRenderer.clear();

    this.fireStateChangeCallbacks(false);
  };
}
