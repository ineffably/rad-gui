import { GUI, ControlEventData } from 'rad-gui';

const params = { x: 1 };
let fired: number | undefined;
const gui = new GUI({ title: 'ts' });
gui.add(params, 'x', 0, 100).onChange((value: number) => { fired = value; }).setValue(42);

const lastEvent: ControlEventData<number> | undefined = undefined;
(window as any).__coldstart = { fired, value: params.x, lastEvent };
