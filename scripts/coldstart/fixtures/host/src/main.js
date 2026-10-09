// A host app with its own code and styles that pulls rad-gui into its production build.
import './app.css';
import { mountPanel } from './panel.js';

const state = { speed: 1, label: 'host' };
document.getElementById('app')?.append(Object.assign(document.createElement('h1'), { textContent: state.label }));

window.__coldstart = mountPanel(state);
