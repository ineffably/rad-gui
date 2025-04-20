type EventHandler = [
  listener: (event: Event) => void, 
  options?: AddEventListenerOptions
];

export const el = <T extends keyof HTMLElementTagNameMap>(
  tagName: T,
  props: Record<string, any> = {},
  classList: string[] = [],
  eventHandlers: Record<string, EventHandler> = {},
  children: HTMLElement[] = []
) => {
  const element = document.createElement(tagName) as HTMLElementTagNameMap[T];

  element.classList.add(...classList);

  Object.entries(props).forEach(([key, value]) => element[key] = value as any);
  
  Object.entries(eventHandlers).forEach(([eventName, [listener, options]]) =>
    element.addEventListener(eventName, listener, options || {})
  );

  children.forEach(child => element.appendChild(child));

  return element;
}
