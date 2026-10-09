// A CommonJS host app (require/module.exports throughout) bundled by webpack for production.
require('./app.css');
const { mountPanel } = require('./panel');

const state = { speed: 1, label: 'host-cjs' };
const app = document.getElementById('app');
if (app) app.appendChild(Object.assign(document.createElement('h1'), { textContent: state.label }));

window.__coldstart = mountPanel(state);
