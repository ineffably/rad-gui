import BaseControl from './base-control';
import { el } from '../utils/el';

export default class FunctionControl extends BaseControl {
  $button: HTMLButtonElement;

	constructor( parent, object, property ) {
		super( parent, object, property, 'function' );

		this.$button = el( 'button', {}, [], {
      click: [e => {
        e.preventDefault();
        this.getValue().call( this.object );
        this._callOnChange();
      }],
      touchstart: [() => {}, { passive: true }]
    }, [this.$name]);

    this.$widget.appendChild( this.$button );

		this.$elForDisable = this.$button;
	}

}
