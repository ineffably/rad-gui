import { el } from '../utils/el';

export default class BaseControl {
  parent: any;
  object: any;
  property: any;
  initialValue: any;
  domElement: HTMLElement;
  $name: HTMLDivElement;
  static nextNameID: any;
  $widget: HTMLDivElement;
  $elForDisable: any;

  _disabled = false;
  _hidden = false;
  _name: any;
  _onChange: any;
  _changed = false;
  _onFinishChange: any;
  _listening = false;
  _listenCallbackID: any;
  _listenPrevValue: any;

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

	name( name ) {
		this._name = name;
		this.$name.textContent = name;
		return this;
	}
	
	onChange( callback ) {
		this._onChange = callback;
		return this;
	}

	_callOnChange() {
		this.parent._callOnChange( this );
		if ( this._onChange !== undefined ) {
			this._onChange.call( this, this.getValue() );
		}
		this._changed = true;
	}

	onFinishChange( callback ) {
		this._onFinishChange = callback;
		return this;
	}

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

	reset() {
		this.setValue( this.initialValue );
		this._callOnFinishChange();
		return this;
	}

	enable( enabled = true ) {
		return this.disable( !enabled );
	}

	disable( disabled = true ) {
		if ( disabled === this._disabled ) return this;

    this._disabled = disabled;
		this.domElement.classList.toggle( 'disabled', disabled );
		this.$elForDisable.toggleAttribute( 'disabled', disabled );

    return this;
	}

	show( show = true ) {
		this._hidden = !show;
		this.domElement.style.display = this._hidden ? 'none' : '';
		return this;
	}

	hide() {
		return this.show( false );
	}

	options( options ) {
		const controller = this.parent.add( this.object, this.property, options );
		controller.name( this._name );
		this.destroy();
		return controller;
	}

	setMin( min ) { return this }
	setMax( max ) { return this }
	setStep( step ) { return this }
	setDecimals( decimals ) { return this }

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

	_listenCallback() {
		this._listenCallbackID = requestAnimationFrame( this._listenCallback );
		const curValue = this.save();
		if ( curValue !== this._listenPrevValue ) {
			this.update();
		}
		this._listenPrevValue = curValue;
	}

	getValue() {
		return this.object[ this.property ];
	}

	setValue( value ) {
		const currentValue = this.getValue();
		if ( currentValue === value ) return this;
		
		this.object[ this.property ] = value;
		this._callOnChange();
		this.update();
		return this;
	}

	update() {
		return this;
	}

	load( value ) {
		this.setValue( value );
		this._callOnFinishChange();
		return this;
	}

	save() {
		return this.getValue();
	}

	destroy() {
		this.listen( false );
		this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
		this.parent.controllers.splice( this.parent.controllers.indexOf( this ), 1 );
		this.parent.$children.removeChild( this.domElement );
	}

}
