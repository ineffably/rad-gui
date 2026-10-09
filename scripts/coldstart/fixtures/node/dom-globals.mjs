const NAMES = ['window', 'self', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'Event',
  'KeyboardEvent', 'MouseEvent', 'PointerEvent', 'getComputedStyle', 'matchMedia', 'requestAnimationFrame', 'cancelAnimationFrame'];

export function installDom(window) {
  // jsdom has no matchMedia; browsers do.
  window.matchMedia = (query) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} });
  for (const name of NAMES) {
    const value = name === 'window' || name === 'self' ? window : window[name];
    Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  }
}

export function report(result) {
  const doc = globalThis.document;
  console.log('COLDSTART_RESULT ' + JSON.stringify({
    errors: [],
    coldstart: result,
    roots: doc.querySelectorAll('.rad-gui.root').length,
    stylesInjected: !!doc.getElementById('rad-gui-styles'),
    radGlobal: typeof globalThis.window.rad
  }));
}
