type EventHandler = [
    listener: (event: Event) => void,
    options?: AddEventListenerOptions
];
export declare const el: <T extends keyof HTMLElementTagNameMap>(tagName: T, props?: Record<string, any>, classList?: string[], eventHandlers?: Record<string, EventHandler>, children?: HTMLElement[]) => HTMLElementTagNameMap[T];
export {};
