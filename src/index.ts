import { GUI } from './gui';
import { el } from './library/el';

export default GUI;

// declaring rad as the root namespace for GUI
(window as any).rad = { GUI, el };

export {
  GUI,
  el 
}
