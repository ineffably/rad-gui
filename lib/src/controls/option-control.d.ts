import BaseControl from './base-control';
export default class OptionControl extends BaseControl {
    $select: HTMLSelectElement;
    $display: HTMLDivElement;
    private _values;
    private _names;
    constructor(parent: any, object: any, property: any, options: any);
    options(options: any): this;
    update(): this;
}
export { OptionControl };
