export class ImgaeLoader {
  private src = '';
  private element?: HTMLImageElement;

  constructor(source?: string | HTMLImageElement) {
    this.setImage(source);
  }

  private resolve = (image: HTMLImageElement) => {};
  private reject = (e: Event) => {};
  private handleLoad = () => (this.element ? this.resolve(this.element) : this.reject(new Event('error')));

  private removeEventListener() {
    this.element?.removeEventListener('load', this.handleLoad);
    this.element?.removeEventListener('error', this.reject);
    this.element?.removeEventListener('abort', this.reject);
  }

  public setImage(source: string | HTMLImageElement = '') {
    if (typeof source === 'string') {
      this.src = source;
      this.element ||= new Image();
    } else {
      this.src = source.src;
      this.element = source;
    }

    this.removeEventListener();

    this.element.addEventListener('load', this.handleLoad);
    this.element.addEventListener('error', this.reject);
    this.element.addEventListener('abort', this.reject);

    this.element.src = this.src;
  }

  public async getImage() {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  public remove() {
    this.removeEventListener();
    this.element?.remove();
  }
}
