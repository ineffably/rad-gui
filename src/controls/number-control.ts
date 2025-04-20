import BaseControl from './base-control';
import { el } from '../utils/el';

// Constants
const DRAG_THRESHOLD = 5;
const WHEEL_DEBOUNCE_TIME = 400;

/**
 * @displayName NumberControl
 */
export default class NumberControl extends BaseControl {
	// Properties
	_decimals: any;
	_min: any;
	_max: any;
	_step: any;
	_stepExplicit: boolean;
	_hasSlider: any;
	_inputFocused: boolean;

	// DOM Elements
	$input: HTMLInputElement;
	$slider: HTMLDivElement;
	$fill: HTMLDivElement;

	// Utility getters
	get _hasScrollBar() {
		const root = this.parent.root.$children;
		return root.scrollHeight > root.clientHeight;
	}

	get _hasMin() {
		return this._min !== undefined;
	}

	get _hasMax() {
		return this._max !== undefined;
	}

	// Aliases for convenience
	max = this.setMax;
	min = this.setMin;
	step = this.setStep;
	decimals = this.setDecimals;

	constructor(parent, object, property, min?, max?, step?) {
		super(parent, object, property, 'number');
		this._initInput();
		this.setMin(min);
		this.setMax(max);
		const stepExplicit = step !== undefined;
		this.setStep(stepExplicit ? step : this._getImplicitStep(), stepExplicit);
		this.update();
	}

	// Public API methods
	setDecimals(decimals) {
		this._decimals = decimals;
		this.update();
		return this;
	}

	setMin(min) {
		this._min = min;
		this._onUpdateMinMax();
		return this;
	}

	setMax(max) {
		this._max = max;
		this._onUpdateMinMax();
		return this;
	}

	setStep(step, explicit = true) {
		this._step = step;
		this._stepExplicit = explicit;
		return this;
	}

	update() {
		const value = this.getValue();
		
		// Update slider fill if slider exists
		if (this._hasSlider) {
			let percent = (value - this._min) / (this._max - this._min);
			percent = Math.max(0, Math.min(percent, 1));
			this.$fill.style.width = `${percent * 100}%`;
		}

		// Update input value if not focused
		if (!this._inputFocused) {
			this.$input.value = this._decimals === undefined 
				? value.toString() 
				: value.toFixed(this._decimals);
		}

		return this;
	}

	// Private helper methods
	_getImplicitStep() {
		if (this._hasMin && this._hasMax) {
			return (this._max - this._min) / 1000;
		}
		return 0.1;
	}

	_onUpdateMinMax() {
		if (!this._hasSlider && this._hasMin && this._hasMax) {
			if (!this._stepExplicit) {
				this.setStep(this._getImplicitStep(), false);
			}
			this._initSlider();
			this.update();
		}
	}

	_setDraggingStyle(active, axis = 'horizontal') {
		if (this.$slider) {
			this.$slider.classList.toggle('active', active);
		}
		document.body.classList.toggle('rad-gui-dragging', active);
		document.body.classList.toggle(`rad-gui-${axis}`, active);
	}

	_normalizeMouseWheel(e) {
		let { deltaX, deltaY } = e;
		if (Math.floor(e.deltaY) !== e.deltaY && e.wheelDelta) {
			deltaX = 0;
			deltaY = -e.wheelDelta / 120;
			deltaY *= this._stepExplicit ? 1 : 10;
		}
		return deltaX + -deltaY;
	}

	_arrowKeyMultiplier(e) {
		let mult = this._stepExplicit ? 1 : 10;
		if (e.shiftKey) {
			mult *= 10;
		} else if (e.altKey) {
			mult /= 10;
		}
		return mult;
	}

	_snap(value) {
		// Make the steps "start" at min or max
		let offset = 0;
		if (this._hasMin) {
			offset = this._min;
		} else if (this._hasMax) {
			offset = this._max;
		}

		value -= offset;
		value = Math.round(value / this._step) * this._step;
		value += offset;

		// Prevent "flyaway" decimals
		return parseFloat(value.toPrecision(15));
	}

	_clamp(value) {
		if (value < this._min) value = this._min;
		if (value > this._max) value = this._max;
		return value;
	}

	_snapClampSetValue(value) {
		this.setValue(this._clamp(this._snap(value)));
	}

	// DOM initialization
	_initInput() {
		const isTouch = window.matchMedia('(pointer: coarse)').matches;

		// Create input with event handlers
		this.$input = el('input', {
			type: isTouch ? 'number' : 'text',
			'aria-labelledby': this.$name.id,
			...(isTouch ? { step: 'any' } : {})
		}, [], {
			input: [this._handleInput.bind(this)],
			keydown: [this._handleKeyDown.bind(this)],
			wheel: [this._handleInputWheel.bind(this)],
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

	_initSlider() {
		this._hasSlider = true;

		this.$fill = el('div', {}, ['fill']);
		this.domElement.classList.add('hasSlider');

    this.$slider = el('div', {}, ['slider'], {
      'mousedown': [this._handleSliderMouseDown.bind(this)],
      'touchstart': [this._handleSliderTouchStart.bind(this), { passive: false }],
      'wheel': [this._handleSliderWheel.bind(this), { passive: false }]
    }, [this.$fill]); 

		this.$widget.insertBefore(this.$slider, this.$input);
  }

	// Event handlers
	_handleInput() {
		let value = parseFloat(this.$input.value);
		if (isNaN(value)) return;
		
		if (this._stepExplicit) {
			value = this._snap(value);
		}
		
		this.setValue(this._clamp(value));
	}

	_handleKeyDown(e) {
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

	_handleInputWheel(e) {
		if (!this._inputFocused) return;
		
		e.preventDefault();
		this._incrementValue(this._step * this._normalizeMouseWheel(e));
	}

	_incrementValue(delta) {
		const value = parseFloat(this.$input.value);
		if (isNaN(value)) return;
		
		this._snapClampSetValue(value + delta);
		this.$input.value = this.getValue().toString();
	}

	_handleSliderMouseDown(e) {
		this._setDraggingStyle(true);
		this._setValueFromClientX(e.clientX);
		
		const mouseMove = this._handleSliderMouseMove.bind(this);
		const mouseUp = () => {
			this._callOnFinishChange();
			this._setDraggingStyle(false);
			window.removeEventListener('mousemove', mouseMove);
			window.removeEventListener('mouseup', mouseUp);
		};
		
		window.addEventListener('mousemove', mouseMove);
		window.addEventListener('mouseup', mouseUp);
	}

	_handleSliderMouseMove(e) {
		this._setValueFromClientX(e.clientX);
	}

	_handleSliderTouchStart(e) {
		if (e.touches.length > 1) return;

		// If scrollable container, test for scroll vs slider intent
		if (this._hasScrollBar) {
			const prevClientX = e.touches[0].clientX;
			const prevClientY = e.touches[0].clientY;
			let testingForScroll = true;
			
			const touchMove = (e) => {
				if (testingForScroll) {
					const dx = e.touches[0].clientX - prevClientX;
					const dy = e.touches[0].clientY - prevClientY;

					if (Math.abs(dx) > Math.abs(dy)) {
						// Horizontal drag - use slider
						testingForScroll = false;
						this._beginTouchDrag(e);
					} else {
						// Vertical drag - user is scrolling, abort
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
				this._cleanupTouchEvents(touchMove, touchEnd);
			};
			
			window.addEventListener('touchmove', touchMove, { passive: false });
			window.addEventListener('touchend', touchEnd);
		} else {
			// Not scrollable, use slider immediately
			this._beginTouchDrag(e);
		}
	}

	_beginTouchDrag(e) {
		e.preventDefault();
		this._setDraggingStyle(true);
		this._setValueFromClientX(e.touches[0].clientX);
		
		const touchMove = (e) => {
			e.preventDefault();
			this._setValueFromClientX(e.touches[0].clientX);
		};
		
		const touchEnd = () => {
			this._callOnFinishChange();
			this._setDraggingStyle(false);
			this._cleanupTouchEvents(touchMove, touchEnd);
		};
		
		window.addEventListener('touchmove', touchMove, { passive: false });
		window.addEventListener('touchend', touchEnd);
	}

	_cleanupTouchEvents(moveHandler, endHandler) {
		window.removeEventListener('touchmove', moveHandler);
		window.removeEventListener('touchend', endHandler);
	}

	_handleSliderWheel(e) {
		// Ignore vertical wheels if there's a scrollbar
		const isVertical = Math.abs(e.deltaX) < Math.abs(e.deltaY);
		if (isVertical && this._hasScrollBar) return;

		e.preventDefault();

		// Set value
		const delta = this._normalizeMouseWheel(e) * this._step;
		this._snapClampSetValue(this.getValue() + delta);

		// Force input update
		this.$input.value = this.getValue().toString();

		// Debounce onFinishChange
		clearTimeout(this._wheelFinishTimeout);
		this._wheelFinishTimeout = setTimeout(
			() => this._callOnFinishChange(), 
			WHEEL_DEBOUNCE_TIME
		);
	}

	_setValueFromClientX(clientX) {
		const rect = this.$slider.getBoundingClientRect();
		const value = this._mapRange(
			clientX, 
			rect.left, rect.right, 
			this._min, this._max
		);
		this._snapClampSetValue(value);
	}

	_mapRange(v, a, b, c, d) {
		return (v - a) / (b - a) * (d - c) + c;
	}

	// Property to store debounce timeout
	private _wheelFinishTimeout: any;
}

export { NumberControl };

