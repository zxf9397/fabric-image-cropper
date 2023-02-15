export class Listener<T extends Record<string, (...args: any) => void>> {
  private listener = new Map<keyof T, Set<T[keyof T]>>();

  public on<K extends keyof T>(type: K, listener: T[K]) {
    const set = this.listener.get(type) || new Set<T[K]>();

    if (this.listener.has(type)) {
      set.add(listener);
    } else {
      this.listener.set(type, set.add(listener));
    }
  }

  public off<K extends keyof T>(type?: K, listener?: T[K]) {
    if (!type) {
      this.listener.clear();
      return;
    }

    if (listener) {
      const set = this.listener.get(type);

      set && set.delete(listener);
    } else {
      this.listener.delete(type);
    }
  }

  public fire<K extends keyof T>(type: K, ...rest: Parameters<T[K]>) {
    const set = this.listener.get(type);

    set && set.forEach((callback) => callback(...(rest as Parameters<T[K]>[])));
  }
}
