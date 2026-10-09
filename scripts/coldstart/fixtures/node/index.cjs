// Plain Node require(), no bundler.
const { JSDOM } = require('jsdom');

(async () => {
  const { installDom, report } = await import('./dom-globals.mjs');
  installDom(new JSDOM('<!doctype html><html><head></head><body></body></html>', { pretendToBeVisual: true }).window);
  const { GUI } = require('rad-gui');
  const params = { x: 1 };
  let fired;
  new GUI({ title: 'node-cjs' }).add(params, 'x', 0, 100).onChange((value) => { fired = value; }).setValue(42);
  report({ fired, value: params.x });
})().catch((err) => { console.error(err); process.exit(1); });
