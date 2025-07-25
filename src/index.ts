import { GUI, RadGUI } from './gui';
import { el } from './library/el';
import injectStyles, { hasInjectedStyles } from './library/inject-styles';

// Import CSS to ensure it's processed by webpack
import './rad-gui.css';

export default GUI;

// declaring rad as the root namespace for GUI
(window as any).rad = { GUI, RadGUI, el, injectStyles };

export {
  GUI,
  RadGUI,
  el,
  injectStyles,
  hasInjectedStyles
}
