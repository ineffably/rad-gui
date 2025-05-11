type EventHandler = [
    listener: (event: Event) => void,
    options?: AddEventListenerOptions
];
export declare const el: <T extends keyof HTMLElementTagNameMap>(tagName: T, props?: Record<string, any>, eventHandlers?: Record<string, EventHandler>) => HTMLElementTagNameMap[T];
export {};
