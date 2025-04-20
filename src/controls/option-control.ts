import BaseControl from './base-control';
import { el } from '../utils/el';
export default class OptionControl extends BaseControl {
  $select: HTMLSelectElement;
  $display: HTMLDivElement;
  private _values: any;
  private _names: any[];

	constructor( parent, object, property, options ) {

		super( parent, object, property, 'option' );

    this.$select = el('select', {
      'aria-labelledby': this.$name.id
    }, [], {
      change: [() => {
        this.setValue(this._values[this.$select.selectedIndex]);
        this._callOnFinishChange();
      }],
      focus: [() => {
        this.$display.classList.add( 'focus' );
      }],
      blur: [() => {
        this.$display.classList.remove( 'focus' );
      }]
    });

    this.$display = el('div', {}, ['display']);

		this.$widget.appendChild( this.$select );
		this.$widget.appendChild( this.$display );
    
		this.options( options );
	}

	options( options ) {

		this._values = Array.isArray( options ) ? options : Object.values( options );
		this._names = Array.isArray( options ) ? options : Object.keys( options );

		this.$select.replaceChildren();

		this._names.forEach( name => {
      const $option = el('option', {}, [name]);
			this.$select.appendChild( $option );
		} );

		this.update();

		return this;
	}

	update() {
		const value = this.getValue();
		const index = this._values.indexOf( value );
		this.$select.selectedIndex = index;
		this.$display.textContent = index === -1 ? value : this._names[ index ];
		return this;
	}

}
