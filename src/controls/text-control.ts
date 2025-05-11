import { el } from '../utils/el';
import BaseControl from './base-control';

/**
 * @displayName TextControl
 * Controller for string values with a text input interface
 * Provides a text input field for editing string values
 */
export default class TextControl extends BaseControl {
  /** The text input element */
  $input: HTMLInputElement;

  /**
   * Creates a new text controller
   * @param parent - The parent GUI instance
   * @param object - Object containing the property to control
   * @param property - Name of the string property to control
   */
  constructor(parent, object, property) {
    super(parent, object, property, 'string');

    this.$input = el('input', {
      type: 'text',
      spellcheck: 'false',
      'aria-labelledby': this.$name.id
    }, {
      input: [() => { this.setValue(this.$input.value) }],
      blur: [() => { this._callOnFinishChange() }],
      keydown: [(e: KeyboardEvent) => {
        if (e.code === 'Enter') {
          this.$input.blur();
        }
      }]
    });

    this.$widget.appendChild(this.$input);
    this.$elForDisable = this.$input;
    this.update();
  }

  /**
   * Updates the text input to reflect the current value
   * @returns This controller instance (for chaining)
   */
  update() {
    this.$input.value = this.getValue();
    return this;
  }

}

export { TextControl };

