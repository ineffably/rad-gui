import RadDefault, { GUI } from 'rad-gui';
import 'rad-gui/lib/rad-gui.css';

export function mountPanel(state) {
  let fired;
  const gui = new GUI({ title: 'Host panel' });
  gui.add(state, 'speed', 0, 100).onChange((value) => { fired = value; }).setValue(42);
  return { fired, value: state.speed, defaultIsGUI: RadDefault === GUI };
}
