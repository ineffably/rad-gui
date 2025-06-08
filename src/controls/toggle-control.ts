import BaseControl from './base-control';
import { el } from '../library/el';

/**
 * @displayName ToggleControl
 * Controller for boolean values with a checkbox interface
 * Provides a simple checkbox input to toggle between true and false
 */
export default class ToggleControl extends BaseControl {
  /** The checkbox input element */
  $input: HTMLInputElement;

  /**
   * Creates a new toggle controller
   * @param parent - The parent GUI instance
   * @param object - Object containing the property to control
   * @param property - Name of the boolean property to control
   */
	constructor( parent, object, property ) {
		super( parent, object, property, 'boolean', 'label' );
    
		this.$input = el('input', {
      type: 'checkbox', 
      'aria-labelledby': this.$name.id
    }, {
      change: [ () => {
        this.setValue( this.$input.checked );
        this._callOnFinishChange();
      } ]
    });

		this.$widget.appendChild( this.$input );
		this.$elForDisable = this.$input;
		this.update();
	}

  /**
   * Updates the checkbox state to reflect the current value
   * @returns This controller instance (for chaining)
   */
	update() {
		this.$input.checked = this.getValue();
		return this;
	}

}

export { ToggleControl };

