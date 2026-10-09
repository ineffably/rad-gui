const radGui = require('rad-gui');
require('rad-gui/lib/rad-gui.css');

function mountPanel(state) {
  let fired;
  const gui = new radGui.GUI({ title: 'Host panel (CommonJS)' });
  gui.add(state, 'speed', 0, 100).onChange((value) => { fired = value; }).setValue(42);
  return {
    fired,
    value: state.speed,
    // What require('rad-gui') hands a CommonJS caller
    requireShape: {
      GUI: typeof radGui.GUI,
      default: typeof radGui.default,
      defaultIsGUI: radGui.default === radGui.GUI,
      callable: typeof radGui === 'function'
    }
  };
}

module.exports = { mountPanel };
