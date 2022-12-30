export function setCSSProperties(element: HTMLElement, styles: Record<string, string>) {
  Object.entries(styles).forEach(([key, val]) => element.style.setProperty(key, val));
}
