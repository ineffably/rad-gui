import { el } from '../utils/el';

/**
 * BaseControl is the foundation class for all controllers
 * It provides common functionality for managing values, DOM elements,
 * event handling, and state management that all specific controller types use
 */
export default class BaseControl {
  /** Parent GUI instance */
  parent: any;
  /** Object containing the property to control */
  object: any;
  /** Property name being controlled */
  property: any;
  /** Initial value of the controlled property */
  initialValue: any;
  /** Main DOM element for this controller */
  domElement: HTMLElement;
  /** DOM element for displaying the property name */
  $name: HTMLDivElement;
  /** Used for generating unique IDs */
  static nextNameID: any;
  /** DOM element containing the control widget */
  $widget: HTMLDivElement;
  /** DOM element that will be disabled when controller is disabled */
  $elForDisable: any;

  /** Whether the controller is disabled */
  _disabled = false;
  /** Whether the controller is hidden */
  _hidden = false;
  /** Name of the controller (typically matches the property name) */
  _name: any;
  /** Callback for when the value changes */
  _onChange: any;
  /** Whether the value has changed since the last finishChange event */
  _changed = false;
  /** Callback for when value changes are completed */
  _onFinishChange: any;
  /** Whether the controller is actively listening for external changes */
  _listening = false;
  /** ID of the animation frame when listening for changes */
  _listenCallbackID: any;
  /** Previous value when listening for changes */
  _listenPrevValue: any;

  /**
   * Creates a new controller
   * @param parent - The parent GUI instance
   * @param object - Object containing the property to control
   * @param property - Name of the property to control
   * @param className - CSS class name for the controller type
   * @param elementType - HTML element type for the controller
   */
	constructor( parent, object, property, className, elementType: keyof HTMLElementTagNameMap = 'div' ) {
		BaseControl.nextNameID = BaseControl.nextNameID || 0;
    
		this.parent = parent;
		this.object = object;
		this.property = property;
		this.initialValue = this.getValue();

    this.$name = el('div', {}, ['name']);
    this.$widget = el('div', {}, ['widget']);
    this.$elForDisable = this.$widget;

    this.domElement = el(
      elementType, 
      {}, 
      ['controller', className],
      {
        'keydown': [e => e.stopPropagation()],
        'keyup': [e => e.stopPropagation()],
      },
      [this.$name, this.$widget]
    );

		this.parent.children.push( this );
		this.parent.controllers.push( this );
		this.parent.$children.appendChild( this.domElement );
		
    this._listenCallback = this._listenCallback.bind( this );

		this.name( property );
	}

  /**
   * Sets the display name of the controller
   * @param name - The name to display
   * @returns This controller instance (for chaining)
   */
	name( name ) {
		this._name = name;
		this.$name.textContent = name;
		return this;
	}
	
  /**
   * Registers a callback for value changes
   * @param callback - Function called when the value changes
   * @returns This controller instance (for chaining)
   */
	onChange( callback ) {
		this._onChange = callback;
		return this;
	}

  /**
   * Called when the value changes
   * Triggers the onChange callback and notifies the parent GUI
   * @private
   */
	_callOnChange() {
		this.parent._callOnChange( this );
		if ( this._onChange !== undefined ) {
			this._onChange.call( this, this.getValue() );
		}
		this._changed = true;
	}

  /**
   * Registers a callback for when value changes are completed
   * @param callback - Function called when value changes are completed
   * @returns This controller instance (for chaining)
   */
	onFinishChange( callback ) {
		this._onFinishChange = callback;
		return this;
	}

  /**
   * Called when value changes are completed
   * Only triggers callbacks if the value has changed
   * @private
   */
	_callOnFinishChange() {
		// Only call callbacks if value has changed
		if ( this._changed ) {
			this.parent._callOnFinishChange( this );
			
			if ( this._onFinishChange !== undefined ) {
				this._onFinishChange.call( this, this.getValue() );
			}
			this._changed = false;
		}
	}

  /**
   * Resets the value to its initial state
   * @returns This controller instance (for chaining)
   */
	reset() {
		this.setValue( this.initialValue );
		this._callOnFinishChange();
		return this;
	}

  /**
   * Enables or disables the controller
   * @param enabled - Whether to enable the controller
   * @returns This controller instance (for chaining)
   */
	enable( enabled = true ) {
		return this.disable( !enabled );
	}

  /**
   * Disables or enables the controller
   * @param disabled - Whether to disable the controller
   * @returns This controller instance (for chaining)
   */
	disable( disabled = true ) {
		if ( disabled === this._disabled ) return this;

    this._disabled = disabled;
		this.domElement.classList.toggle( 'disabled', disabled );
		this.$elForDisable.toggleAttribute( 'disabled', disabled );

    return this;
	}

  /**
   * Shows or hides the controller
   * @param show - Whether to show the controller
   * @returns This controller instance (for chaining)
   */
	show( show = true ) {
		this._hidden = !show;
		this.domElement.style.display = this._hidden ? 'none' : '';
		return this;
	}

  /**
   * Hides the controller (alias for show(false))
   * @returns This controller instance (for chaining)
   */
	hide() {
		return this.show( false );
	}

  /**
   * Replaces this controller with an options controller
   * @param options - Option values for the new controller
   * @returns The new options controller
   */
	options( options ) {
		const controller = this.parent.add( this.object, this.property, options );
		controller.name( this._name );
		this.destroy();
		return controller;
	}

  /**
   * Sets the minimum value (implemented by subclasses)
   * @param min - Minimum value
   * @returns This controller instance (for chaining)
   */
	setMin( min ) { return this }

  /**
   * Sets the maximum value (implemented by subclasses)
   * @param max - Maximum value
   * @returns This controller instance (for chaining)
   */
	setMax( max ) { return this }

  /**
   * Sets the step size (implemented by subclasses)
   * @param step - Step size
   * @returns This controller instance (for chaining)
   */
	setStep( step ) { return this }

  /**
   * Sets the number of decimal places (implemented by subclasses)
   * @param decimals - Number of decimal places
   * @returns This controller instance (for chaining)
   */
	setDecimals( decimals ) { return this }

  /**
   * Enables or disables listening for external changes to the property
   * @param listen - Whether to listen for changes
   * @returns This controller instance (for chaining)
   */
	listen( listen = true ) {
		this._listening = listen;

    if ( this._listenCallbackID !== undefined ) {
			cancelAnimationFrame( this._listenCallbackID );
			this._listenCallbackID = undefined;
		}

		if ( this._listening ) {
			this._listenCallback();
		}
		return this;
	}

  /**
   * Callback used when listening for external changes
   * @private
   */
	_listenCallback() {
		this._listenCallbackID = requestAnimationFrame( this._listenCallback );
		const curValue = this.save();
		if ( curValue !== this._listenPrevValue ) {
			this.update();
		}
		this._listenPrevValue = curValue;
	}

  /**
   * Gets the current value of the controlled property
   * @returns The current value
   */
	getValue() {
		return this.object[ this.property ];
	}

  /**
   * Sets the value of the controlled property
   * Only updates if the value has changed
   * @param value - The new value
   * @returns This controller instance (for chaining)
   */
	setValue( value ) {
		const currentValue = this.getValue();
		if ( currentValue === value ) return this;
		
		this.object[ this.property ] = value;
		this._callOnChange();
		this.update();
		return this;
	}

  /**
   * Updates the controller's visual state (implemented by subclasses)
   * @returns This controller instance (for chaining)
   */
	update() {
		return this;
	}

  /**
   * Sets the value and triggers the onFinishChange callback
   * @param value - The value to set
   * @returns This controller instance (for chaining)
   */
	load( value ) {
		this.setValue( value );
		this._callOnFinishChange();
		return this;
	}

  /**
   * Returns the current value (used for saving state)
   * @returns The current value
   */
	save() {
		return this.getValue();
	}

  /**
   * Removes the controller from its parent and the DOM
   */
	destroy() {
		this.listen( false );
		this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
		this.parent.controllers.splice( this.parent.controllers.indexOf( this ), 1 );
		this.parent.$children.removeChild( this.domElement );
	}

}
