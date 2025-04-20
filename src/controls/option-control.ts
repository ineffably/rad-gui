import BaseControl from './base-control';
import { el } from '../utils/el';

/**
 * Controller for values with a select dropdown interface
 * Provides a dropdown menu for selecting from predefined options
 * @displayName OptionControl
 */
export default class OptionControl extends BaseControl {
  /** The select element for the dropdown */
  $select: HTMLSelectElement;
  /** Display element showing the current selection */
  $display: HTMLDivElement;
  /** Array of option values */
  private _values: any;
  /** Array of option display names */
  private _names: any[];

  /**
   * Creates a new option controller
   * @param parent - The parent GUI instance
   * @param object - Object containing the property to control
   * @param property - Name of the property to control
   * @param options - Object with key/value pairs or array of values for the options
   */
  constructor(parent, object, property, options) {

    super(parent, object, property, 'option');

    this.$select = el('select', {
      'aria-labelledby': this.$name.id
    }, [], {
      change: [() => {
        this.setValue(this._values[this.$select.selectedIndex]);
        this._callOnFinishChange();
      }],
      focus: [() => {
        this.$display.classList.add('focus');
      }],
      blur: [() => {
        this.$display.classList.remove('focus');
      }]
    });

    this.$display = el('div', {}, ['display']);

    this.$widget.appendChild(this.$select);
    this.$widget.appendChild(this.$display);

    this.options(options);
  }

  /**
   * Sets or updates the available options
   * @param options - Object with key/value pairs or array of values for the options
   * @returns This controller instance (for chaining)
   */
  options(options) {

    this._values = Array.isArray(options) ? options : Object.values(options);
    this._names = Array.isArray(options) ? options : Object.keys(options);

    this.$select.replaceChildren();

    this._names.forEach((name = '') => {
      const $option = el('option', { textContent: name });
      this.$select.appendChild($option);
    });

    this.update();

    return this;
  }

  /**
   * Updates the dropdown to reflect the current value
   * @returns This controller instance (for chaining)
   */
  update() {
    const value = this.getValue();
    const index = this._values.indexOf(value);
    this.$select.selectedIndex = index;
    this.$display.textContent = index === -1 ? value : this._names[index];
    return this;
  }

}

export { OptionControl };
