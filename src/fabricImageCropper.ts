import type { FabricImageCropperOptions } from './data.d';
import { setCSSProperties } from './tools';

export class FabricImageCropper {
  private workingState = false;
  private stateChangeCallbacks = new Set<(state: boolean) => void>();

  private backupActive?: Required<fabric.Image>;
  private backupOrigin?: Required<fabric.Image>;

  private container: HTMLDivElement;
  private box: HTMLDivElement;

  constructor(private canvas: fabric.Canvas, options?: FabricImageCropperOptions) {
    const canvasEl = canvas.getElement();
    this.container = document.createElement('div');
    this.box = document.createElement('div');

    setCSSProperties(this.container, {
      position: 'relative',
      width: `${canvasEl.width}px`,
      height: `${canvasEl.height}px`,
      border: canvasEl.style.border,
      'border-width': canvasEl.style.borderWidth,
      'border-left-width': canvasEl.style.borderLeftWidth,
      'border-top-width': canvasEl.style.borderTopWidth,
      // overflow: 'hidden',
    });

    this.container.appendChild(this.box);
    canvasEl.after(this.container);
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

  public crop = () => {
    if (this.workingState) return;

    const actice = this.getActiveImage();
    if (!actice) {
      return;
    }

    const { borderLeftWidth, borderTopWidth } = window.getComputedStyle(this.canvas.getElement());

    const angle = actice.angle;
    const left = actice.aCoords.tl.x + Number(borderLeftWidth.split('px')[0]);
    const top = actice.aCoords.tl.y + Number(borderTopWidth.split('px')[0]);
    const width = actice.getScaledWidth();
    const height = actice.getScaledHeight();

    setCSSProperties(this.box, {
      position: 'absolute',
      transform: `translate3d(${left}px, ${top}px, 0) rotate(${angle}deg)`,
      width: `${width}px`,
      height: `${height}px`,
      'background-color': 'pink',
      'transform-origin': 'left top',
    });

    this.fireStateChangeCallbacks(true);
  };

  public confirm = () => {
    if (!this.workingState) return;

    this.fireStateChangeCallbacks(false);
  };

  public cancel = () => {
    if (!this.workingState) return;

    this.fireStateChangeCallbacks(false);
  };
}
