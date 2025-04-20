import BaseControl from './base-control';
import { el } from '../utils/el';

export default class ToggleControl extends BaseControl {
  $input: HTMLInputElement;

	constructor( parent, object, property ) {
		super( parent, object, property, 'boolean', 'label' );
    
		this.$input = el('input', {type: 'checkbox', 'aria-labelledby': this.$name.id},[], {
      change: [ () => {
        this.setValue( this.$input.checked );
        this._callOnFinishChange();
      } ]
    } )

		this.$widget.appendChild( this.$input );
		this.$elForDisable = this.$input;
		this.update();
	}

	update() {
		this.$input.checked = this.getValue();
		return this;
	}

}
