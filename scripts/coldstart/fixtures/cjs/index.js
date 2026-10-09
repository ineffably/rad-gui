const radGui = require('rad-gui');

const { GUI } = radGui;
const params = { x: 1 };
let fired;
const gui = new GUI({ title: 'cjs' });
gui.add(params, 'x', 0, 100).onChange((value) => { fired = value; }).setValue(42);

window.__coldstart = { fired, value: params.x };
