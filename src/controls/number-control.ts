import BaseControl from './base-control';
import { el } from '../utils/el';

// Constants
const DRAG_THRESHOLD = 5;
const WHEEL_DEBOUNCE_TIME = 400;

/**
 * @displayName NumberControl
 * Control for numerical values with optional slider, step, and range constraints
 */
export default class NumberControl extends BaseControl {
	// Properties
	_decimals: number | undefined;
	_min: number | undefined;
	_max: number | undefined;
	_step: number;
	_stepExplicit: boolean;
	_hasSlider: boolean;
	_inputFocused: boolean;
	private _wheelFinishTimeout: number | undefined;
	private _sliderRect: DOMRect | null = null;
	private _percent: number = 0;

	// DOM Elements
	$input: HTMLInputElement;
	$slider: HTMLDivElement;
	$fill: HTMLDivElement;

	// Cached handler references to avoid rebinding
	private readonly _handleInputBound: () => void;
	private readonly _handleKeyDownBound: (e: KeyboardEvent) => void;
	private readonly _handleInputWheelBound: (e: WheelEvent) => void;
	private readonly _handleSliderMouseDownBound: (e: MouseEvent) => void;
	private readonly _handleSliderTouchStartBound: (e: TouchEvent) => void; 
	private readonly _handleSliderWheelBound: (e: WheelEvent) => void;

	// Utility getters for better performance
	get _hasScrollBar(): boolean {
		const root = this.parent?.root?.$children;
		if (!root) return false;
		return root.scrollHeight > root.clientHeight;
	}

	get _hasMin(): boolean {
		return this._min !== undefined;
	}

	get _hasMax(): boolean {
		return this._max !== undefined;
	}

	// Aliases for convenience
	max = this.setMax;
	min = this.setMin;
	step = this.setStep;
	decimals = this.setDecimals;

	constructor(
		parent: any, 
		object: Record<string, any>, 
		property: string, 
		min?: number, 
		max?: number, 
		step?: number
	) {
		super(parent, object, property, 'number');
		
		// Initialize state
		this._hasSlider = false;
		this._inputFocused = false;
		this._step = 0.1; // Default value
		this._stepExplicit = false;
		
		// Pre-bind event handlers to avoid recreating functions
		this._handleInputBound = this._handleInput.bind(this);
		this._handleKeyDownBound = this._handleKeyDown.bind(this);
		this._handleInputWheelBound = this._handleInputWheel.bind(this);
		this._handleSliderMouseDownBound = this._handleSliderMouseDown.bind(this);
		this._handleSliderTouchStartBound = this._handleSliderTouchStart.bind(this);
		this._handleSliderWheelBound = this._handleSliderWheel.bind(this);
		
		// Initialize input
		this._initInput();
		
		// Set constraints (order matters: min/max first, then step)
		this.setMin(min);
		this.setMax(max);
		
		// Set step (explicit or implicit)
		const stepExplicit = step !== undefined;
		this.setStep(stepExplicit ? step : this._getImplicitStep(), stepExplicit);
		
		// Initial update
		this.update();
	}

	// Public API methods
	setDecimals(decimals: number | undefined): this {
		this._decimals = decimals;
		this.update();
		return this;
	}

	setMin(min: number | undefined): this {
		if (this._min === min) return this; // Skip if unchanged
		
		this._min = min;
		this._onUpdateMinMax();
		return this;
	}

	setMax(max: number | undefined): this {
		if (this._max === max) return this; // Skip if unchanged
		
		this._max = max;
		this._onUpdateMinMax();
		return this;
	}

	setStep(step: number | undefined, explicit = true): this {
		this._step = step ?? 0.1; // Default to 0.1 if undefined
		this._stepExplicit = explicit;
		return this;
	}

	update(): this {
		const value = this.getValue();
		
		// Update slider fill if slider exists
		if (this._hasSlider) {
			// Only calculate percentage if both min and max are defined
			if (this._hasMin && this._hasMax) {
				// Calculate percentage once for efficiency
				this._percent = Math.max(0, Math.min(
					(value - this._min!) / (this._max! - this._min!),
					1
				));
				
				// Set width using calculated percentage
				this.$fill.style.width = `${this._percent * 100}%`;
			}
		}

		// Update input value if not focused
		if (!this._inputFocused) {
			this.$input.value = this._decimals === undefined 
				? value.toString() 
				: value.toFixed(this._decimals);
		}

		return this;
	}

	// Private helper methods with better type safety
	private _getImplicitStep(): number {
		if (this._hasMin && this._hasMax) {
			return (this._max! - this._min!) / 1000;
		}
		return 0.1;
	}

	private _onUpdateMinMax(): void {
		// Only initialize slider if needed and doesn't already exist
		if (!this._hasSlider && this._hasMin && this._hasMax) {
			// Update step if it's implicit
			if (!this._stepExplicit) {
				this.setStep(this._getImplicitStep(), false);
			}
			
			// Initialize slider
			this._initSlider();
			
			// Update UI immediately
			this.update();
		}
	}

	private _setDraggingStyle(active: boolean, axis: 'horizontal' | 'vertical' = 'horizontal'): void {
		if (this.$slider) {
			this.$slider.classList.toggle('active', active);
		}
		document.body.classList.toggle('rad-gui-dragging', active);
		document.body.classList.toggle(`rad-gui-${axis}`, active);
	}

	private _normalizeMouseWheel(e: WheelEvent): number {
		let { deltaX, deltaY } = e;
		
		// Handle special case for Apple Magic Mouse and trackpads
		if (Math.floor(e.deltaY) !== e.deltaY && (e as any).wheelDelta) {
			deltaX = 0;
			deltaY = -(e as any).wheelDelta / 120;
			deltaY *= this._stepExplicit ? 1 : 10;
		}
		
		return deltaX + -deltaY;
	}

	private _arrowKeyMultiplier(e: KeyboardEvent): number {
		// Base multiplier depends on whether step is explicit
		let mult = this._stepExplicit ? 1 : 10;
		
		// Modify multiplier based on modifier keys
		if (e.shiftKey) {
			mult *= 10;
		} else if (e.altKey) {
			mult /= 10;
		}
		
		return mult;
	}

	private _snap(value: number): number {
		// Short-circuit if no step defined or step is zero
		if (!this._step || this._step === 0) return value;
		
		// Find offset (min or 0)
		let offset = 0;
		if (this._hasMin) {
			offset = this._min!;
		} else if (this._hasMax) {
			offset = this._max!;
		}

		// Apply step snapping with offset
		value -= offset;
		value = Math.round(value / this._step) * this._step;
		value += offset;

		// Prevent floating point issues
		return parseFloat(value.toPrecision(15));
	}

	private _clamp(value: number): number {
		// Short-circuit if no constraints
		if (!this._hasMin && !this._hasMax) return value;
		
		// Apply min/max constraints
		if (this._hasMin && value < this._min!) return this._min!;
		if (this._hasMax && value > this._max!) return this._max!;
		
		return value;
	}

	private _snapClampSetValue(value: number): void {
		this.setValue(this._clamp(this._snap(value)));
	}

	// DOM initialization
	private _initInput(): void {
		const isTouch = window.matchMedia('(pointer: coarse)').matches;

		// Create input with event handlers
		this.$input = el('input', {
			type: isTouch ? 'number' : 'text',
			'aria-labelledby': this.$name.id,
			...(isTouch ? { step: 'any' } : {})
		}, {
			input: [this._handleInputBound],
			keydown: [this._handleKeyDownBound],
			wheel: [this._handleInputWheelBound],
			focus: [() => { this._inputFocused = true; }],
			blur: [() => { 
				this._inputFocused = false;
				this.update();
				this._callOnFinishChange();
			}]
		});

		this.$widget.appendChild(this.$input);
		this.$elForDisable = this.$input;
	}

	private _initSlider(): void {
		this._hasSlider = true;

		this.$fill = el('div', {
			classList: ['fill']
		});
		this.domElement.classList.add('hasSlider');

    this.$slider = el('div', {
			classList: ['slider'],
			children: [this.$fill]
		}, {
      'mousedown': [this._handleSliderMouseDownBound],
      'touchstart': [this._handleSliderTouchStartBound, { passive: false }],
      'wheel': [this._handleSliderWheelBound, { passive: false }]
    }); 

		this.$widget.insertBefore(this.$slider, this.$input);
  }

	// Event handlers
	private _handleInput(): void {
		const value = parseFloat(this.$input.value);
		if (isNaN(value)) return;
		
		if (this._stepExplicit) {
			this.setValue(this._clamp(this._snap(value)));
		} else {
			this.setValue(this._clamp(value));
		}
	}

	private _handleKeyDown(e: KeyboardEvent): void {
		// Handle Enter key
		if (e.key === 'Enter') {
			this.$input.blur();
			return;
		}
		
		// Handle arrow keys
		if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
			e.preventDefault();
			const direction = e.code === 'ArrowUp' ? 1 : -1;
			this._incrementValue(this._step * this._arrowKeyMultiplier(e) * direction);
		}
	}

	private _handleInputWheel(e: WheelEvent): void {
		if (!this._inputFocused) return;
		
		e.preventDefault();
		this._incrementValue(this._step * this._normalizeMouseWheel(e));
	}

	private _incrementValue(delta: number): void {
		const value = parseFloat(this.$input.value);
		if (isNaN(value)) return;
		
		this._snapClampSetValue(value + delta);
		this.$input.value = this.getValue().toString();
	}

	private _handleSliderMouseDown(e: MouseEvent): void {
		this._setDraggingStyle(true);
		this._setValueFromClientX(e.clientX);
		
		const handleMouseMove = (e: MouseEvent) => {
			this._setValueFromClientX(e.clientX);
		};
		
		const handleMouseUp = () => {
			this._callOnFinishChange();
			this._setDraggingStyle(false);
			this._sliderRect = null; // Clear cached rect when drag ends
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};
		
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
	}
	
	private _handleSliderTouchStart(e: TouchEvent): void {
		if (e.touches.length > 1) return;

		// If scrollable container, test for scroll vs slider intent
		if (this._hasScrollBar) {
			const prevClientX = e.touches[0].clientX;
			const prevClientY = e.touches[0].clientY;
			let testingForScroll = true;
			
			const touchMove = (e: TouchEvent) => {
				if (!e.touches[0]) return; // Safety check
				
				if (testingForScroll) {
					const dx = e.touches[0].clientX - prevClientX;
					const dy = e.touches[0].clientY - prevClientY;

					if (Math.abs(dx) > Math.abs(dy)) {
						// Horizontal drag - use slider
						testingForScroll = false;
						this._beginTouchDrag(e);
					} else if (Math.abs(dy) > DRAG_THRESHOLD) {
						// Vertical drag exceeding threshold - user is scrolling, abort
						this._cleanupTouchEvents(touchMove, touchEnd);
					}
				} else {
					e.preventDefault();
					this._setValueFromClientX(e.touches[0].clientX);
				}
			};
			
			const touchEnd = () => {
				this._callOnFinishChange();
				this._setDraggingStyle(false);
				this._sliderRect = null; // Clear cached rect when touch ends
				this._cleanupTouchEvents(touchMove, touchEnd);
			};
			
			window.addEventListener('touchmove', touchMove, { passive: false });
			window.addEventListener('touchend', touchEnd);
		} else {
			// Not scrollable, use slider immediately
			this._beginTouchDrag(e);
		}
	}

	private _beginTouchDrag(e: TouchEvent): void {
		if (!e.touches[0]) return; // Safety check
		
		e.preventDefault();
		this._setDraggingStyle(true);
		this._setValueFromClientX(e.touches[0].clientX);
		
		const touchMove = (e: TouchEvent) => {
			if (!e.touches[0]) return; // Safety check
			e.preventDefault();
			this._setValueFromClientX(e.touches[0].clientX);
		};
		
		const touchEnd = () => {
			this._callOnFinishChange();
			this._setDraggingStyle(false);
			this._sliderRect = null; // Clear cached rect when touch ends
			this._cleanupTouchEvents(touchMove, touchEnd);
		};
		
		window.addEventListener('touchmove', touchMove, { passive: false });
		window.addEventListener('touchend', touchEnd);
	}

	private _cleanupTouchEvents(moveHandler: (e: TouchEvent) => void, endHandler: () => void): void {
		window.removeEventListener('touchmove', moveHandler);
		window.removeEventListener('touchend', endHandler);
	}

	private _handleSliderWheel(e: WheelEvent): void {
		// Ignore vertical wheels if there's a scrollbar
		const isVertical = Math.abs(e.deltaX) < Math.abs(e.deltaY);
		if (isVertical && this._hasScrollBar) return;

		e.preventDefault();

		// Calculate delta once for efficiency
		const delta = this._normalizeMouseWheel(e) * this._step;
		
		// Set value
		this._snapClampSetValue(this.getValue() + delta);

		// Force input update
		this.$input.value = this.getValue().toString();

		// Debounce onFinishChange
		if (this._wheelFinishTimeout !== undefined) {
			window.clearTimeout(this._wheelFinishTimeout);
		}
		
		this._wheelFinishTimeout = window.setTimeout(
			() => {
				this._callOnFinishChange();
				this._wheelFinishTimeout = undefined;
			}, 
			WHEEL_DEBOUNCE_TIME
		);
	}

	private _setValueFromClientX(clientX: number): void {
		// Only calculate rect if not already cached
		if (!this._sliderRect) {
			this._sliderRect = this.$slider.getBoundingClientRect();
		}
		
		const rect = this._sliderRect;
		if (!rect || !this._hasMin || !this._hasMax) return;
		
		const value = this._mapRange(
			clientX, 
			rect.left, rect.right, 
			this._min!, this._max!
		);
		
		this._snapClampSetValue(value);
	}

	private _mapRange(v: number, a: number, b: number, c: number, d: number): number {
		return (v - a) / (b - a) * (d - c) + c;
	}
}

export { NumberControl };

