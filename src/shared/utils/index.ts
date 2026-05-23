const { abs: mathABS, sqrt: mathSQRT, atan2: mathATAN2, PI: mathPI } = Math;

declare global {
  interface Window {
    setUsingTouch(active: boolean): void;
  }
}

export const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const randFloat = (min: number, max: number): number =>
  Math.random() * (max - min + 1) + min;

export const lerp = (value1: number, value2: number, amount: number): number =>
  value1 + (value2 - value1) * amount;

export const decel = (val: number, cel: number): number => {
  if (val > 0) {
    return Math.max(0, val - cel);
  }
  if (val < 0) {
    return Math.min(0, val + cel);
  }
  return val;
};

export const getDistance = (x1: number, y1: number, x2: number, y2: number): number =>
  mathSQRT((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

export const getDirection = (x1: number, y1: number, x2: number, y2: number): number =>
  mathATAN2(y1 - y2, x1 - x2);

export const getAngleDist = (a: number, b: number): number => {
  const p = mathABS(b - a) % (mathPI * 2);
  return p > mathPI ? mathPI * 2 - p : p;
};

export const isNumber = (n: unknown): n is number =>
  typeof n === 'number' && !Number.isNaN(n) && Number.isFinite(n);

export const isString = (s: unknown): s is string =>
  typeof s === 'string' && Boolean(s);

export const kFormat = (num: number): string | number =>
  num > 999 ? `${(num / 1000).toFixed(1)}k` : num;

export const capitalizeFirst = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const fixTo = (n: number, v: number): number => parseFloat(n.toFixed(v));

interface HasPoints {
  points: number | string;
}

export const sortByPoints = (a: HasPoints, b: HasPoints): number =>
  parseFloat(String(b.points)) - parseFloat(String(a.points));

export const lineInRect = (
  recX: number,
  recY: number,
  recX2: number,
  recY2: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): boolean => {
  let minX = x1;
  let maxX = x2;
  if (x1 > x2) {
    minX = x2;
    maxX = x1;
  }
  if (maxX > recX2) maxX = recX2;
  if (minX < recX) minX = recX;
  if (minX > maxX) return false;
  let minY = y1;
  let maxY = y2;
  const dx = x2 - x1;
  if (Math.abs(dx) > 0.0000001) {
    const a = (y2 - y1) / dx;
    const b = y1 - a * x1;
    minY = a * minX + b;
    maxY = a * maxX + b;
  }
  if (minY > maxY) {
    const tmp = maxY;
    maxY = minY;
    minY = tmp;
  }
  if (maxY > recY2) maxY = recY2;
  if (minY < recY) minY = recY;
  if (minY > maxY) return false;
  return true;
};

export const containsPoint = (element: Element, x: number, y: number): boolean => {
  const bounds = element.getBoundingClientRect();
  const left = bounds.left + window.scrollX;
  const top = bounds.top + window.scrollY;
  const { width, height } = bounds;
  const insideHorizontal = x > left && x < left + width;
  const insideVertical = y > top && y < top + height;
  return insideHorizontal && insideVertical;
};

export const mousifyTouchEvent = (event: TouchEvent): void => {
  const touch = event.changedTouches[0];
  if (!touch) {
    return;
  }
  Object.assign(event, {
    screenX: touch.screenX,
    screenY: touch.screenY,
    clientX: touch.clientX,
    clientY: touch.clientY,
    pageX: touch.pageX,
    pageY: touch.pageY,
  });
};

export const eventIsTrusted = (ev: Event | undefined | null): boolean => {
  if (!ev) {
    return true;
  }
  if (typeof (ev as Event).isTrusted === 'boolean') {
    return (ev as Event).isTrusted;
  }
  return true;
};

export type TrustedCallback<TEvent extends Event> = (event: TEvent) => void;

export const checkTrusted =
  <TEvent extends Event>(callback: TrustedCallback<TEvent>) =>
    (ev: TEvent): void => {
      if (ev instanceof Event && eventIsTrusted(ev)) {
        callback(ev);
      }
    };

export const hookTouchEvents = (element: HTMLElement, skipPrevent?: boolean): void => {
  const preventDefault = !skipPrevent;
  let isHovering = false;
  const listenerOptions: AddEventListenerOptions | boolean = false;

  const touchStart = (e: TouchEvent) => {
    mousifyTouchEvent(e);
    if (typeof window.setUsingTouch === 'function') {
      window.setUsingTouch(true);
    }
    if (preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    element.onmouseover?.(e as unknown as MouseEvent);
    isHovering = true;
  };

  const touchMove = (e: TouchEvent) => {
    mousifyTouchEvent(e);
    const pointer = e as TouchEvent & { pageX: number; pageY: number };
    if (typeof window.setUsingTouch === 'function') {
      window.setUsingTouch(true);
    }
    if (preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (containsPoint(element, pointer.pageX, pointer.pageY)) {
      if (!isHovering) {
        element.onmouseover?.(e as unknown as MouseEvent);
        isHovering = true;
      }
    } else if (isHovering) {
      element.onmouseout?.(e as unknown as MouseEvent);
      isHovering = false;
    }
  };

  const touchEnd = (e: TouchEvent) => {
    mousifyTouchEvent(e);
    if (typeof window.setUsingTouch === 'function') {
      window.setUsingTouch(true);
    }
    if (preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isHovering) {
      const clickHandler = (element as any).onclick as ((ev: MouseEvent) => void) | undefined;
      const outHandler = (element as any).onmouseout as ((ev: MouseEvent) => void) | undefined;
      if (clickHandler) {
        clickHandler.call(element, e as unknown as MouseEvent);
      }
      if (outHandler) {
        outHandler.call(element, e as unknown as MouseEvent);
      }
      isHovering = false;
    }
  };

  element.addEventListener('touchstart', checkTrusted(touchStart), listenerOptions);
  element.addEventListener('touchmove', checkTrusted(touchMove), listenerOptions);
  element.addEventListener('touchend', checkTrusted(touchEnd), listenerOptions);
  element.addEventListener('touchcancel', checkTrusted(touchEnd), listenerOptions);
  element.addEventListener('touchleave', checkTrusted(touchEnd), listenerOptions);
};

export const removeAllChildren = (element: HTMLElement): void => {
  while (element.lastChild) {
    element.removeChild(element.lastChild);
  }
};

export interface GenerateElementConfig {
  tag?: keyof HTMLElementTagNameMap;
  text?: string;
  html?: string;
  class?: string;
  style?: string;
  hookTouch?: boolean;
  parent?: HTMLElement;
  children?: Node[];
  [key: string]: unknown;
}

export const generateElement = (config: GenerateElementConfig): HTMLElement => {
  const element = document.createElement(config.tag ?? 'div');

  const bind = (configValue: keyof GenerateElementConfig, elementValue: keyof HTMLElement) => {
    const value = config[configValue];
    if (value !== undefined && value !== null) {
      (element as unknown as Record<string, unknown>)[elementValue as string] = value;
    }
  };

  bind('text', 'textContent');
  bind('html', 'innerHTML');
  bind('class', 'className');

  Object.keys(config).forEach((key) => {
    if (
      key === 'tag' ||
      key === 'text' ||
      key === 'html' ||
      key === 'class' ||
      key === 'style' ||
      key === 'hookTouch' ||
      key === 'parent' ||
      key === 'children'
    ) {
      return;
    }
    (element as Record<string, unknown>)[key] = config[key];
  });

  if (element.onclick) {
    element.onclick = checkTrusted(element.onclick);
  }
  if (element.onmouseover) {
    element.onmouseover = checkTrusted(element.onmouseover);
  }
  if (element.onmouseout) {
    element.onmouseout = checkTrusted(element.onmouseout);
  }

  if (config.style) {
    element.style.cssText = config.style;
  }
  if (config.hookTouch) {
    hookTouchEvents(element);
  }
  if (config.parent) {
    config.parent.appendChild(element);
  }
  if (config.children) {
    config.children.forEach((child) => element.appendChild(child));
  }

  return element;
};

export const randomString = (length: number): string => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export const countInArray = <T>(array: T[], val: T): number =>
  array.reduce((count, item) => (item === val ? count + 1 : count), 0);

export default {
  randInt,
  randFloat,
  lerp,
  decel,
  getDistance,
  getDirection,
  getAngleDist,
  isNumber,
  isString,
  kFormat,
  capitalizeFirst,
  fixTo,
  sortByPoints,
  lineInRect,
  containsPoint,
  mousifyTouchEvent,
  eventIsTrusted,
  checkTrusted,
  hookTouchEvents,
  removeAllChildren,
  generateElement,
  randomString,
  countInArray,
};
