// Native Node ESM, no bundler: can an ESM consumer get named exports from the package?
import { JSDOM } from 'jsdom';
import { installDom, report } from './dom-globals.mjs';

installDom(new JSDOM('<!doctype html><html><head></head><body></body></html>', { pretendToBeVisual: true }).window);
const ns = await import('rad-gui');
const GUI = ns.GUI;
if (typeof GUI !== 'function') {
  throw new Error(`named export GUI is ${typeof GUI} under Node ESM; namespace keys: ${Object.keys(ns).join(', ')}`);
}
const params = { x: 1 };
let fired;
new GUI({ title: 'node-esm' }).add(params, 'x', 0, 100).onChange((value) => { fired = value; }).setValue(42);
report({ fired, value: params.x, namespaceKeys: Object.keys(ns) });
