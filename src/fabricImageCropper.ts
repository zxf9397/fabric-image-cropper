import { ControlsRenderer } from './controlsRenderer';
import type { FabricImageCropperOptions } from './data.d';

export class FabricImageCropper {
  private workingState = false;
  private stateChangeCallbacks = new Set<(state: boolean) => void>();

  private backupActive?: Required<fabric.Image>;
  private backupOrigin?: Required<fabric.Image>;

  private active?: Required<fabric.Image>;

  private controlsRenderer!: ControlsRenderer;

  constructor(private canvas: fabric.Canvas, options?: FabricImageCropperOptions) {
    this.controlsRenderer = new ControlsRenderer(canvas, {});
  }

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
    this.workingState = state;
    this.stateChangeCallbacks.forEach((fn) => fn(state));
  }

  public crop = async () => {
    if (this.workingState) return;

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

    this.controlsRenderer.render(actice, cropBox, dragBox);

    this.active = actice;
    this.canvas.discardActiveObject();
    this.canvas.renderAll();

    this.fireStateChangeCallbacks(true);
  };

  public confirm = () => {
    if (!this.workingState || !this.active) return;

    this.canvas.setActiveObject(this.active);
    this.canvas.renderAll();

    this.controlsRenderer.clear();

    this.fireStateChangeCallbacks(false);
  };

  public cancel = () => {
    if (!this.workingState || !this.active) return;

    this.canvas.setActiveObject(this.active);
    this.canvas.renderAll();

    this.controlsRenderer.clear();

    this.fireStateChangeCallbacks(false);
  };
}
