import BaseControl from './base-control';
import { el } from '../utils/el';

import getColorFormat from '../utils/color-formats';
import normalizeColorString from '../utils/normalize-color-string';

export default class ColorControl extends BaseControl {
  $input: HTMLInputElement;
  $text: HTMLInputElement;
  $display: HTMLDivElement;
  _format: any;
  _rgbScale: any;
  _initialValueHexString: any;
  _textFocused: boolean;

  constructor(parent, object, property, rgbScale) {
    super(parent, object, property, 'color');
    
    this.$input = el('input', {
      type: 'color',
      tabindex: '-1',
      'aria-labelledby': this.$name.id
    }, [], {
      blur: [() => { this._callOnFinishChange() }],
      input: [() => { this._setValueFromHexString(this.$input.value) }]
    });
        
    this.$text = el('input', {
      type: 'text',
      spellcheck: 'false',
      tabindex: '-1',
      'aria-labelledby': this.$name.id
    }, [],
      {
        blur: [() => {
          this._textFocused = false;
          this.update();
          this._callOnFinishChange();
        }],
        input: [(e: Event) => {
          const tryParse  = normalizeColorString((e.target as HTMLInputElement).value);
          if (tryParse) {
            this._setValueFromHexString(tryParse);
          }
        }],
        focus: [() => {
          this._textFocused = true;
          this.$text.select();
        }]
      }
    );

    this.$display = el('div', {}, ['display'], {}, [this.$input]);

    this.$widget.appendChild(this.$display);
    this.$widget.appendChild(this.$text);

    this._format = getColorFormat(this.initialValue);
    this._rgbScale = rgbScale;

    this._initialValueHexString = this.save();
    this._textFocused = false;

    this.$elForDisable = this.$text;

    this.update();
  }

  reset() {
    this._setValueFromHexString(this._initialValueHexString);
    return this;
  }

  _setValueFromHexString(value) {
    if (this._format.isPrimitive) {
      const newValue = this._format.fromHexString(value);
      this.setValue(newValue);
    } else {
      this._format.fromHexString(value, this.getValue(), this._rgbScale);
      this._callOnChange();
      this.update();
    }
  }

  save() {
    return this._format.toHexString(this.getValue(), this._rgbScale);
  }

  load(value) {
    this._setValueFromHexString(value);
    this._callOnFinishChange();
    return this;
  }

  update() {
    this.$input.value = this._format.toHexString(this.getValue(), this._rgbScale) as string;
    if (!this._textFocused) {
      this.$text.value = this.$input.value.substring(1);
    }
    this.$display.style.backgroundColor = this.$input.value;
    return this;
  }
}

