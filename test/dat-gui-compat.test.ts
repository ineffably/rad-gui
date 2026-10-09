import { GUI, RadGUI } from '../src/gui';
import NumberControl from '../src/controls/number-control';
import ColorControl from '../src/controls/color-control';

// Mock the CSS import
jest.mock('../src/rad-gui.css', () => ({}));

// The dat.gui API members from examples/dat-gui-API.md that rad-gui adds for drop-in use
describe('dat.gui compatibility', () => {
  let gui: GUI;

  beforeEach(() => {
    gui = new GUI({ autoPlace: false });
  });

  afterEach(() => {
    gui.destroy();
  });

  describe('constructor options', () => {
    it('uses name as the title', () => {
      const named = new GUI({ autoPlace: false, name: 'My GUI' });
      expect(named.$title.textContent).toBe('My GUI');
      expect(named.name).toBe('My GUI');
    });

    it('prefers title over name', () => {
      const both = new GUI({ autoPlace: false, name: 'name', title: 'title' });
      expect(both.name).toBe('title');
    });

    it('starts closed with closed: true', () => {
      const closed = new GUI({ autoPlace: false, closed: true });
      expect(closed.closed).toBe(true);
      expect(closed.domElement.classList.contains('closed')).toBe(true);
    });

    it('keeps autoPlace and closeOnTop as properties', () => {
      const placed = new GUI({ closeOnTop: true });
      expect(placed.autoPlace).toBe(true);
      expect(placed.closeOnTop).toBe(true);
      expect(gui.autoPlace).toBe(false);
      expect(gui.closeOnTop).toBe(false);
      placed.destroy();
    });
  });

  describe('name property', () => {
    it('reads and writes the title', () => {
      gui.name = 'Renamed';
      expect(gui.$title.textContent).toBe('Renamed');
      expect(gui.name).toBe('Renamed');
    });

    it('is the folder name', () => {
      const folder = gui.addFolder('Flow Field');
      expect(folder.name).toBe('Flow Field');
    });
  });

  describe('closed property', () => {
    it('reflects open() and close()', () => {
      expect(gui.closed).toBe(false);
      gui.close();
      expect(gui.closed).toBe(true);
      gui.open();
      expect(gui.closed).toBe(false);
    });

    it('opens and closes the GUI when set', () => {
      gui.closed = true;
      expect(gui.domElement.classList.contains('closed')).toBe(true);
      gui.closed = false;
      expect(gui.domElement.classList.contains('closed')).toBe(false);
    });
  });

  describe('width property', () => {
    it('returns the width passed to the constructor', () => {
      const wide = new GUI({ autoPlace: false, width: 300 });
      expect(wide.width).toBe(300);
      expect(wide.domElement.style.getPropertyValue('--width')).toBe('300px');
    });

    it('is undefined by default', () => {
      expect(gui.width).toBeUndefined();
    });

    it('updates the element when set', () => {
      gui.width = 420;
      expect(gui.width).toBe(420);
      expect(gui.domElement.style.getPropertyValue('--width')).toBe('420px');
      gui.width = undefined;
      expect(gui.domElement.style.getPropertyValue('--width')).toBe('');
    });
  });

  describe('getRoot', () => {
    it('returns the GUI itself at the top level', () => {
      expect(gui.getRoot()).toBe(gui);
    });

    it('returns the topmost GUI from a nested folder', () => {
      const nested = gui.addFolder('a').addFolder('b');
      expect(nested.getRoot()).toBe(gui);
    });
  });

  describe('remove', () => {
    it('removes a controller from the GUI and the DOM', () => {
      const obj = { x: 1, y: 2 };
      const x = gui.add(obj, 'x');
      gui.add(obj, 'y');
      expect(gui.remove(x)).toBe(gui);
      expect(gui.controllers).not.toContain(x);
      expect(gui.children).not.toContain(x);
      expect(gui.$children.contains(x.domElement)).toBe(false);
      expect(gui.controllers).toHaveLength(1);
    });

    it('stops a listening controller', () => {
      const x = gui.add({ x: 1 }, 'x').listen();
      gui.remove(x);
      expect(x._listening).toBe(false);
    });

    it('ignores a controller from another GUI', () => {
      const other = new GUI({ autoPlace: false });
      const x = other.add({ x: 1 }, 'x');
      gui.remove(x);
      expect(other.controllers).toContain(x);
      other.destroy();
    });

    it('still works on RadGUI', () => {
      const rad = new RadGUI({ autoPlace: false });
      const x = rad.addNumber({ x: 1 }, 'x');
      expect(rad.remove(x)).toBe(rad);
      expect(rad.controllers).not.toContain(x);
      rad.destroy();
    });
  });

  describe('removeFolder', () => {
    it('removes the folder, its controllers and its DOM', () => {
      const folder = gui.addFolder('Colors');
      folder.add({ x: 1 }, 'x');
      expect(gui.removeFolder(folder)).toBe(gui);
      expect(gui.folders).not.toContain(folder);
      expect(gui.children).not.toContain(folder);
      expect(gui.$children.contains(folder.domElement)).toBe(false);
      expect(gui.controllersRecursive()).toHaveLength(0);
    });

    it('ignores a folder that belongs to another GUI', () => {
      const other = new GUI({ autoPlace: false });
      const folder = other.addFolder('Theirs');
      gui.removeFolder(folder);
      expect(other.folders).toContain(folder);
      other.destroy();
    });
  });

  describe('addFolder', () => {
    it('lists each folder once', () => {
      const folder = gui.addFolder('Once');
      expect(gui.folders.filter(f => f === folder)).toHaveLength(1);
    });
  });

  describe('remember, getSaveObject and load', () => {
    it('saves remembered values in dat.gui format', () => {
      const obj = { speed: 5, label: 'hi', explode: () => {} };
      gui.remember(obj);
      gui.add(obj, 'speed');
      gui.add(obj, 'label');
      gui.add(obj, 'explode');
      gui.addFolder('Colors').close();
      obj.speed = 7;

      expect(gui.getSaveObject()).toEqual({
        closed: false,
        preset: 'Default',
        remembered: { Default: { 0: { speed: 7, label: 'hi' } } },
        folders: { Colors: { closed: true, folders: {} } }
      });
    });

    it('includes remembered values from folders', () => {
      const obj = { a: 1, b: 2 };
      gui.remember(obj);
      gui.add(obj, 'a');
      gui.addFolder('More').add(obj, 'b');
      expect(gui.getSaveObject().remembered.Default[0]).toEqual({ a: 1, b: 2 });
    });

    it('leaves out remembered and preset when nothing is remembered', () => {
      gui.add({ a: 1 }, 'a');
      const saved = gui.getSaveObject();
      expect(saved).toEqual({ closed: false, folders: {} });
    });

    it('registers remembered objects on the root GUI', () => {
      const obj = { a: 1 };
      gui.addFolder('f').remember(obj);
      expect(gui._rememberedObjects).toEqual([obj]);
    });

    it('recalls saved values through the load option', () => {
      const saved = (() => {
        const source = new GUI({ autoPlace: false });
        const obj = { speed: 1, label: 'a' };
        source.remember(obj);
        source.add(obj, 'speed', 0, 10);
        source.addFolder('Nested').add(obj, 'label');
        source.addFolder('Closed').close();
        obj.speed = 9;
        obj.label = 'b';
        const result = JSON.parse(JSON.stringify(source.getSaveObject()));
        source.destroy();
        return result;
      })();

      const restored = new GUI({ autoPlace: false, load: saved });
      const obj = { speed: 1, label: 'a' };
      restored.remember(obj);
      const speed = restored.add(obj, 'speed', 0, 10) as NumberControl;
      restored.addFolder('Nested').add(obj, 'label');
      const closed = restored.addFolder('Closed');

      expect(obj).toEqual({ speed: 9, label: 'b' });
      expect(speed.initialValue).toBe(9);
      expect(closed.closed).toBe(true);
      restored.destroy();
    });

    it('recalls only remembered objects', () => {
      const load = { preset: 'Default', remembered: { Default: { 0: { a: 5 } } } };
      const restored = new GUI({ autoPlace: false, load });
      const other = { a: 1 };
      restored.add(other, 'a');
      expect(other.a).toBe(1);
      restored.destroy();
    });

    it('recalls from the chosen preset', () => {
      const load = { preset: 'Default', remembered: { Default: { 0: { a: 5 } }, Fast: { 0: { a: 50 } } } };
      const restored = new GUI({ autoPlace: false, load, preset: 'Fast' });
      const obj = { a: 1 };
      restored.remember(obj);
      restored.add(obj, 'a');
      expect(obj.a).toBe(50);
      expect(restored.preset).toBe('Fast');
      restored.destroy();
    });
  });

  describe('hideable', () => {
    const pressH = (target: EventTarget = window) =>
      target.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', bubbles: true }));

    afterEach(() => {
      GUI._hiddenByKey = false;
    });

    it('toggles hideable root GUIs with the H key', () => {
      const hideable = new GUI({ autoPlace: false, hideable: true });
      pressH();
      expect(hideable._hidden).toBe(true);
      pressH();
      expect(hideable._hidden).toBe(false);
      hideable.destroy();
    });

    it('leaves GUIs alone by default', () => {
      new GUI({ autoPlace: false, hideable: true }).destroy();
      pressH();
      expect(gui._hidden).toBe(false);
      pressH();
    });

    it('ignores H typed into an input', () => {
      const hideable = new GUI({ autoPlace: false, hideable: true });
      const input = document.createElement('input');
      document.body.appendChild(input);
      pressH(input);
      expect(hideable._hidden).toBe(false);
      input.remove();
      hideable.destroy();
    });

    it('stops toggling a destroyed GUI', () => {
      const hideable = new GUI({ autoPlace: false, hideable: true });
      hideable.destroy();
      expect(GUI._hideables.has(hideable)).toBe(false);
    });
  });

  describe('controller', () => {
    it('remove() removes it from its GUI', () => {
      const x = gui.add({ x: 1 }, 'x');
      expect(x.remove()).toBe(x);
      expect(gui.controllers).not.toContain(x);
      expect(gui.$children.contains(x.domElement)).toBe(false);
    });

    it('updateDisplay() refreshes the widget from the object', () => {
      const obj = { label: 'a' };
      const text = gui.add(obj, 'label');
      obj.label = 'changed';
      expect(text.updateDisplay()).toBe(text);
      expect((text.domElement.querySelector('input') as HTMLInputElement).value).toBe('changed');
    });

    it('isModified() compares with the initial value', () => {
      const obj = { x: 1 };
      const x = gui.add(obj, 'x');
      expect(x.isModified()).toBe(false);
      x.setValue(2);
      expect(x.isModified()).toBe(true);
      x.setValue(1);
      expect(x.isModified()).toBe(false);
    });

    it('isModified() sees in-place color changes', () => {
      const obj = { color: [0, 128, 255] };
      const color = gui.addColor(obj, 'color') as ColorControl;
      expect(color.isModified()).toBe(false);
      color.load('#ff0000');
      expect(color.isModified()).toBe(true);
    });

    it('supports min/max/step chaining on numbers', () => {
      const n = gui.add({ x: 1 }, 'x') as NumberControl;
      expect(n.min(-10).max(10).step(0.25)).toBe(n);
      expect(n._min).toBe(-10);
      expect(n._max).toBe(10);
      expect(n._step).toBe(0.25);
    });
  });
});
