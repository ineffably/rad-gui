import BaseControl from './base-control';
import { el } from '../library/el';

/**
 * Controller for function values with a button interface
 * Provides a button that calls the function when clicked
 * @displayName FunctionControl
 */
export default class FunctionControl extends BaseControl {
  /** The button element used to trigger the function */
  $button: HTMLButtonElement;

  /**
   * Creates a new function controller
   * @param parent - The parent GUI instance
   * @param object - Object containing the property to control
   * @param property - Name of the function property to call
   */
	constructor( parent, object, property ) {
		super( parent, object, property, 'function' );

		this.$button = el( 'button', {
      children: [this.$name]
    }, {
      click: [e => {
        e.preventDefault();
        this.getValue().call( this.object );
        this._callOnChange();
      }],
      touchstart: [() => {}, { passive: true }]
    });

    this.$widget.appendChild( this.$button );

		this.$elForDisable = this.$button;
	}

}

export { FunctionControl };
