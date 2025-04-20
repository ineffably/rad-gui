import { el } from '../utils/el';
import BaseControl from './base-control';

export default class TextControl extends BaseControl {
  $input: HTMLInputElement;

  constructor(parent, object, property) {
    super(parent, object, property, 'string');

    this.$input = el('input', {
      type: 'text',
      spellcheck: 'false',
      'aria-labelledby': this.$name.id
    }, [], {
      input: [() => { this.setValue(this.$input.value) }],
      blur: [() => { this._callOnFinishChange() }],
      keydown: [(e: KeyboardEvent) => {
        if (e.code === 'Enter') {
          this.$input.blur();
        }
      },
      ]
    });

    this.$widget.appendChild(this.$input);
    this.$elForDisable = this.$input;
    this.update();
  }

  update() {
    this.$input.value = this.getValue();
    return this;
  }

}
