import { GUI } from 'rad-gui';
import 'rad-gui/lib/rad-gui.css';

const params = { x: 1 };
let fired;
const gui = new GUI({ title: 'esm' });
gui.add(params, 'x', 0, 100).onChange((value) => { fired = value; }).setValue(42);

window.__coldstart = { fired, value: params.x };
