import ToggleControl from './controls/toggle-control';
import ColorControl from './controls/color-control';
import FunctionControl from './controls/function-control';
import NumberControl from './controls/number-control';
import OptionControl from './controls/option-control';
import TextControl from './controls/text-control';
import { el } from './utils/el';

import './rad-gui.css';

let stylesInjected = false;
const stylesheet = 'pretend me a stylesheet';
const _injectStyles = (styles) => {
  console.log('injecting styles', styles);
}

export class GUI {
  parent: GUI;
  autoPlace: boolean;
  width: any;
  closeFolders: boolean;
  injectStyles: boolean;
  touchStyles: boolean;
  root: any;
  children: any[];
  controllers: any[];
  folders: any[];
  domElement: HTMLDivElement;
  $title: HTMLButtonElement;
  $children: HTMLDivElement;
  container: HTMLDivElement
  _closed: boolean;
  _hidden: boolean;
  _onChange: any;
  _onFinishChange: any;
  _onOpenClose: any;
  _title: string;
  _closeFolders: boolean;
  _onFinishChangeCallback: any;
  _onChangeCallback: any;
  _onOpenCloseCallback: any;

  constructor({
    parent,
    autoPlace = parent === undefined,
    container,
    width,
    title = 'Controls',
    closeFolders = false,
    injectStyles = true,
    touchStyles = true
  } = {} as any) {
    this.parent = parent;
    this.root = parent ? parent.root : this;
    this.children = [];
    this.controllers = [];
    this.folders = [];
    this._closed = false;
    this._hidden = false;
    this._onChange = undefined;
    this._onFinishChange = undefined;
    this._onOpenClose = undefined;

    if (parent) {
      parent.children.push(this);
      parent.folders.push(this);
    }

    this.$title = el('button', { 'aria-expanded': 'true' }, ['title'], {
      click: [() => this.openAnimated(this._closed)],
      touchstart: [() => { }, { passive: true }]
    });

    this.$children = el('div', {}, ['children']);
    this.$children.classList.add('children');

    this.domElement = el('div', {}, ['rad-gui', 'root'], {}, [this.$title, this.$children]);
    if (touchStyles) {
      this.domElement.classList.add('allow-touch-styles');
    }

    this.title(title);

    if (!stylesInjected && injectStyles) {
      _injectStyles(stylesheet);
      stylesInjected = true;
    }

    if (container) {
      this.container = container;
      container.appendChild(this.domElement);
    }
    else if (autoPlace) {
      this.domElement.classList.add('autoPlace');
      document.body.appendChild(this.domElement);
    }

    if (width) {
      this.domElement.style.setProperty('--width', width + 'px');
    }

    this._closeFolders = closeFolders;
  }

  add(object, property, $1, max, step) {
    if (Object($1) === $1) {
      return new OptionControl(this, object, property, $1);
    }

    const initialValue = object[property];
    switch (typeof initialValue) {
      case 'number':
        return new NumberControl(this, object, property, $1, max, step);
      case 'boolean':
        return new ToggleControl(this, object, property);
      case 'string':
        return new TextControl(this, object, property);
      case 'function':
        return new FunctionControl(this, object, property);
    }

    // eslint-disable-next-line no-console
    console.error(`gui.add failed	property:`, property, `	object:`, object, `	value:`, initialValue);

  }

  addColor(object, property, rgbScale = 1) {
    return new ColorControl(this, object, property, rgbScale);
  }

  addFolder(title) {
    const folder = new GUI({ parent: this, title });
    this.folders.push(folder);
    if (this.root._closeFolders) folder.close();
    return folder;
  }

  load(obj, recursive = true) {
    if (obj.controllers) {
      this.controllers.forEach(c => {
        if (c instanceof FunctionControl) return;
        if (c._name in obj.controllers) {
          c.load(obj.controllers[c._name]);
        }
      });
    }

    if (recursive && obj.folders) {
      this.folders.forEach(f => {
        if (f._title in obj.folders) {
          f.load(obj.folders[f._title]);
        }
      });
    }
    return this;
  }

  remember(...args) {
    this.save(true);
  }

  save(recursive = true) {
    const obj = {
      controllers: {},
      folders: {}
    };

    // Track processed titles to avoid duplicates
    const processedTitles = new Set();

    this.controllers.forEach(c => {
      if (c instanceof FunctionControl) return;
      if (Object.prototype.hasOwnProperty.call(obj.controllers, c._name)) {
        throw new Error(`Cannot save GUI with duplicate property "${c._name}"`);
      }
      obj.controllers[c._name] = c.save();
    });

    if (recursive) {
      this.folders.forEach(f => {
        // Skip if we've already processed this folder title
        if (processedTitles.has(f._title)) return;
        
        processedTitles.add(f._title);
        obj.folders[f._title] = f.save();
      });
    }
    return obj;
  }

  open(open = true) {
    this._setClosed(!open);
    this.$title.setAttribute('aria-expanded', (!this._closed) + '');
    this.domElement.classList.toggle('closed', this._closed);
    return this;
  }

  close() {
    return this.open(false);
  }

  _setClosed(closed) {
    if (this._closed === closed) return;
    this._closed = closed;
    this._callOnOpenClose(this);
  }

  show(show = true) {
    this._hidden = !show;
    this.domElement.style.display = this._hidden ? 'none' : '';
    return this;
  }

  hide() {
    return this.show(false);
  }

  openAnimated(open = true) {
    // set state immediately
    this._setClosed(!open);
    this.$title.setAttribute('aria-expanded', !this._closed + '');

    // wait for next frame to measure $children
    requestAnimationFrame(() => {
      // explicitly set initial height for transition
      const initialHeight = this.$children.clientHeight;
      this.$children.style.height = initialHeight + 'px';

      this.domElement.classList.add('transition');

      const onTransitionEnd = e => {
        if (e.target !== this.$children) return;
        this.$children.style.height = '';
        this.domElement.classList.remove('transition');
        this.$children.removeEventListener('transitionend', onTransitionEnd);
      };

      this.$children.addEventListener('transitionend', onTransitionEnd);

      // todo: this is wrong if children's scrollHeight makes for a gui taller than maxHeight
      const targetHeight = !open ? 0 : this.$children.scrollHeight;

      this.domElement.classList.toggle('closed', !open);

      requestAnimationFrame(() => {
        this.$children.style.height = targetHeight + 'px';
      });

    });

    return this;

  }

  title(title) {
    this._title = title;
    this.$title.textContent = title;
    return this;
  }

  reset(recursive = true) {
    const controllers = recursive ? this.controllersRecursive() : this.controllers;
    controllers.forEach(c => c.reset());
    return this;
  }

  onChange(callback) {
    this._onChange = callback;
    return this;
  }

  _callOnChange(controller) {

    if (this.parent) {
      this.parent._callOnChange(controller);
    }

    if (this._onChange !== undefined) {
      this._onChange.call(this, {
        object: controller.object,
        property: controller.property,
        value: controller.getValue(),
        controller
      });
    }
  }

  onFinishChange(callback) {
    this._onFinishChange = callback;
    return this;
  }

  _callOnFinishChange(controller) {

    if (this.parent) {
      this.parent._callOnFinishChange(controller);
    }

    if (this._onFinishChange !== undefined) {
      this._onFinishChange.call(this, {
        object: controller.object,
        property: controller.property,
        value: controller.getValue(),
        controller
      });
    }
  }

  onOpenClose(callback) {
    this._onOpenClose = callback;
    return this;
  }

  _callOnOpenClose(changedGUI) {
    if (this.parent) {
      this.parent._callOnOpenClose(changedGUI);
    }

    if (this._onOpenClose !== undefined) {
      this._onOpenClose.call(this, changedGUI);
    }
  }

  destroy() {
    if (this.parent) {
      this.parent.children.splice(this.parent.children.indexOf(this), 1);
      this.parent.folders.splice(this.parent.folders.indexOf(this), 1);
    }
    if (this.domElement.parentElement) {
      this.domElement.parentElement.removeChild(this.domElement);
    }
    Array.from(this.children).forEach(c => c.destroy());
  }

  controllersRecursive() {
    let controllers = [...this.controllers];
    
    for (const folder of this.folders) {
      controllers = controllers.concat(folder.controllers);
    }
    
    return controllers;
  }

  foldersRecursive() {
    let folders = [...this.folders];
    
    for (const folder of this.folders) {
      folders = folders.concat(folder.folders);
    }
    
    return folders;
  }

}
