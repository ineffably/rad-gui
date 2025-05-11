import BaseControl from './base-control';
export default class ColorControl extends BaseControl {
    $input: HTMLInputElement;
    $text: HTMLInputElement;
    $display: HTMLDivElement;
    _format: any;
    _rgbScale: any;
    _initialValueHexString: any;
    _textFocused: boolean;
    constructor(parent: any, object: any, property: any, rgbScale: any);
    reset(): this;
    _setValueFromHexString(value: any): void;
    save(): any;
    load(value: any): this;
    update(): this;
}
export { ColorControl };
