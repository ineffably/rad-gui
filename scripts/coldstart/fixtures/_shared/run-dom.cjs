// Loads built bundles into a headless jsdom document and prints what happened.
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');

const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', (err) => errors.push(String((err && (err.stack || err.message)) || err)));
virtualConsole.on('error', (...args) => errors.push('console.error: ' + args.join(' ')));

const dom = new JSDOM('<!doctype html><html><head></head><body><div id="app"></div></body></html>', {
  runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/', virtualConsole
});
const { window } = dom;
// jsdom has no matchMedia; browsers do. COLDSTART_NO_MATCHMEDIA=1 leaves it out to show what a bare jsdom consumer hits.
if (!process.env.COLDSTART_NO_MATCHMEDIA) {
  window.matchMedia = (query) => ({ matches: false, media: query, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false });
}
for (const file of process.argv.slice(2)) {
  try {
    window.eval(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    errors.push(`${file}: ${(err && err.stack) || err}`);
  }
}
setTimeout(() => {
  const doc = window.document;
  console.log('COLDSTART_RESULT ' + JSON.stringify({
    errors,
    coldstart: window.__coldstart,
    roots: doc.querySelectorAll('.rad-gui.root').length,
    stylesInjected: !!doc.getElementById('rad-gui-styles'),
    radGlobal: typeof window.rad
  }));
  window.close();
}, 50);
