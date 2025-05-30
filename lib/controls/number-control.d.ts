import BaseControl from './base-control';
export default class NumberControl extends BaseControl {
    _decimals: number | undefined;
    _min: number | undefined;
    _max: number | undefined;
    _step: number;
    _stepExplicit: boolean;
    _hasSlider: boolean;
    _inputFocused: boolean;
    private _wheelFinishTimeout;
    private _sliderRect;
    private _percent;
    $input: HTMLInputElement;
    $slider: HTMLDivElement;
    $fill: HTMLDivElement;
    private readonly _handleInputBound;
    private readonly _handleKeyDownBound;
    private readonly _handleInputWheelBound;
    private readonly _handleSliderMouseDownBound;
    private readonly _handleSliderTouchStartBound;
    private readonly _handleSliderWheelBound;
    get _hasScrollBar(): boolean;
    get _hasMin(): boolean;
    get _hasMax(): boolean;
    max: (max: number | undefined) => this;
    min: (min: number | undefined) => this;
    step: (step: number | undefined, explicit?: boolean) => this;
    decimals: (decimals: number | undefined) => this;
    constructor(parent: any, object: Record<string, any>, property: string, min?: number, max?: number, step?: number);
    setDecimals(decimals: number | undefined): this;
    setMin(min: number | undefined): this;
    setMax(max: number | undefined): this;
    setStep(step: number | undefined, explicit?: boolean): this;
    update(): this;
    private _getImplicitStep;
    private _onUpdateMinMax;
    private _setDraggingStyle;
    private _normalizeMouseWheel;
    private _arrowKeyMultiplier;
    private _snap;
    private _clamp;
    private _snapClampSetValue;
    private _initInput;
    private _initSlider;
    private _handleInput;
    private _handleKeyDown;
    private _handleInputWheel;
    private _incrementValue;
    private _handleSliderMouseDown;
    private _handleSliderTouchStart;
    private _beginTouchDrag;
    private _cleanupTouchEvents;
    private _handleSliderWheel;
    private _setValueFromClientX;
    private _mapRange;
}
export { NumberControl };
