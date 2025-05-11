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

/**
 * GUI is the main container class for creating control panels
 * It manages a collection of controllers and can contain nested folders (child GUIs)
 */
export class GUI {
  /** Parent GUI instance if this is a folder */
  parent: GUI;
  /** Whether to automatically place the GUI in the document body */
  autoPlace: boolean;
  /** Width of the GUI in pixels */
  width: any;
  /** Whether folders should be closed by default */
  closeFolders: boolean;
  /** Whether to inject CSS styles */
  injectStyles: boolean;
  /** Whether to include touch-friendly styles */
  touchStyles: boolean;
  /** The root GUI instance (this instance or the topmost parent) */
  root: any;
  /** Array of child elements (controllers and folders) */
  children: any[];
  /** Array of controllers in this GUI */
  controllers: any[];
  /** Array of folders (child GUIs) in this GUI */
  folders: any[];
  /** The main DOM element for this GUI */
  domElement: HTMLDivElement;
  /** The title button element */
  $title: HTMLButtonElement;
  /** The container for child elements */
  $children: HTMLDivElement;
  /** The container element if provided */
  container: HTMLDivElement
  /** Whether the GUI is closed (folded) */
  _closed: boolean;
  /** Whether the GUI is hidden */
  _hidden: boolean;
  /** Callback for value changes */
  _onChange: any;
  /** Callback for when value changes are completed */
  _onFinishChange: any;
  /** Callback for open/close events */
  _onOpenClose: any;
  /** The title of the GUI */
  _title: string;
  /** Whether child folders should be closed by default */
  _closeFolders: boolean;
  _onFinishChangeCallback: any;
  _onChangeCallback: any;
  _onOpenCloseCallback: any;

  /**
   * Creates a new GUI instance
   * @param options - Configuration options
   * @param options.parent - Parent GUI instance (if this is a folder)
   * @param options.autoPlace - Whether to automatically append to document.body
   * @param options.container - Custom container element
   * @param options.width - Width in pixels
   * @param options.title - Title of the GUI
   * @param options.closeFolders - Whether folders should be closed by default
   * @param options.injectStyles - Whether to inject CSS styles
   * @param options.touchStyles - Whether to include touch-friendly styles
   */
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

    this.$title = el('button', { 
      'aria-expanded': 'true',
      classList: ['title']
    }, {
      click: [() => this.openAnimated(this._closed)],
      touchstart: [() => { }, { passive: true }]
    });

    this.$children = el('div', { 
      classList: ['children'] 
    });

    this.domElement = el('div', { 
      classList: ['rad-gui', 'root'],
      children: [this.$title, this.$children]
    });
    
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

  /**
   * Adds a controller to the GUI
   * @param object - Object containing the property to control
   * @param property - Name of the property to control
   * @param $1 - Min value or options object
   * @param max - Max value
   * @param step - Step size
   * @returns The created controller
   */
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

  /**
   * Adds a color controller to the GUI
   * @param object - Object containing the property to control
   * @param property - Name of the property to control
   * @param rgbScale - Scale for RGB values (default 1)
   * @returns The created color controller
   */
  addColor(object, property, rgbScale = 1) {
    return new ColorControl(this, object, property, rgbScale);
  }

  /**
   * Adds a folder (nested GUI) to the GUI
   * @param title - Title of the folder
   * @returns The created folder (GUI instance)
   */
  addFolder(title) {
    const folder = new GUI({ parent: this, title });
    
    // Add the folder to the parent's folders array
    this.folders.push(folder);
    
    // Add the folder's DOM element to the parent's $children element
    this.$children.appendChild(folder.domElement);
    
    // Close the folder if closeFolders is true
    if (this.root._closeFolders) folder.close();
    
    return folder;
  }

  /**
   * Loads saved controller values
   * @param obj - Object containing saved state
   * @param recursive - Whether to load state for nested folders
   * @returns This GUI instance (for chaining)
   */
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

  /**
   * Alias for save(true)
   */
  remember(...args) {
    this.save(true);
  }

  /**
   * Saves the current state of all controllers
   * @param recursive - Whether to save state for nested folders
   * @returns Object containing the saved state
   */
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

  /**
   * Opens or closes the GUI
   * @param open - Whether to open the GUI
   * @returns This GUI instance (for chaining)
   */
  open(open = true) {
    this._setClosed(!open);
    this.$title.setAttribute('aria-expanded', (!this._closed) + '');
    this.domElement.classList.toggle('closed', this._closed);
    return this;
  }

  /**
   * Closes the GUI (alias for open(false))
   * @returns This GUI instance (for chaining)
   */
  close() {
    return this.open(false);
  }

  /**
   * Sets the closed state and triggers callbacks
   * @param closed - Whether the GUI should be closed
   * @private
   */
  _setClosed(closed) {
    if (this._closed === closed) return;
    this._closed = closed;
    this._callOnOpenClose(this);
  }

  /**
   * Shows or hides the GUI
   * @param show - Whether to show the GUI
   * @returns This GUI instance (for chaining)
   */
  show(show = true) {
    this._hidden = !show;
    this.domElement.style.display = this._hidden ? 'none' : '';
    return this;
  }

  /**
   * Hides the GUI (alias for show(false))
   * @returns This GUI instance (for chaining)
   */
  hide() {
    return this.show(false);
  }

  /**
   * Opens or closes the GUI with a smooth animation
   * @param open - Whether to open the GUI
   * @returns This GUI instance (for chaining)
   */
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

  /**
   * Sets the title of the GUI
   * @param title - The new title
   * @returns This GUI instance (for chaining)
   */
  title(title) {
    this._title = title;
    this.$title.textContent = title;
    return this;
  }

  /**
   * Resets all controllers to their initial values
   * @param recursive - Whether to reset controllers in nested folders
   * @returns This GUI instance (for chaining)
   */
  reset(recursive = true) {
    const controllers = recursive ? this.controllersRecursive() : this.controllers;
    controllers.forEach(c => c.reset());
    return this;
  }

  /**
   * Registers a callback for value changes
   * @param callback - Function called when any controller's value changes
   * @returns This GUI instance (for chaining)
   */
  onChange(callback) {
    this._onChange = callback;
    return this;
  }

  /**
   * Called when a controller's value changes
   * @param controller - The controller that triggered the change
   * @private
   */
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

  /**
   * Registers a callback for when value changes are completed
   * @param callback - Function called when any controller finishes changing
   * @returns This GUI instance (for chaining)
   */
  onFinishChange(callback) {
    this._onFinishChange = callback;
    return this;
  }

  /**
   * Called when a controller finishes changing its value
   * @param controller - The controller that triggered the change
   * @private
   */
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

  /**
   * Registers a callback for open/close events
   * @param callback - Function called when any GUI or folder is opened or closed
   * @returns This GUI instance (for chaining)
   */
  onOpenClose(callback) {
    this._onOpenClose = callback;
    return this;
  }

  /**
   * Called when a GUI or folder is opened or closed
   * @param changedGUI - The GUI that was opened or closed
   * @private
   */
  _callOnOpenClose(changedGUI) {
    if (this.parent) {
      this.parent._callOnOpenClose(changedGUI);
    }

    if (this._onOpenClose !== undefined) {
      this._onOpenClose.call(this, changedGUI);
    }
  }

  /**
   * Removes the GUI from the DOM and parent
   */
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

  /**
   * Gets all controllers from this GUI and its nested folders
   * @returns Array of all controllers
   */
  controllersRecursive() {
    let controllers = [...this.controllers];
    
    for (const folder of this.folders) {
      controllers = controllers.concat(folder.controllersRecursive());
    }
    
    return controllers;
  }

  /**
   * Gets all folders from this GUI and its nested folders
   * @returns Array of all folders without duplicates
   */
  foldersRecursive() {
    // Helper function to collect all folders recursively without duplicates
    const collectFolders = (gui, folderSet = new Set()) => {
      // Add each folder to the Set
      gui.folders.forEach(folder => {
        folderSet.add(folder);
        // Recursively collect subfolders
        collectFolders(folder, folderSet);
      });
      
      return folderSet;
    };
    
    // Collect all folders in a Set (which ensures uniqueness)
    const folderSet = collectFolders(this);
    
    // Convert Set to Array and return
    return Array.from(folderSet);
  }

}

export default GUI;
