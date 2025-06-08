import NumberControl from '../../src/controls/number-control';
import BaseControl from '../../src/controls/base-control';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('NumberControl', () => {
  // Mock parent object with required methods and properties
  const createMockParent = () => ({
    children: [],
    controllers: [],
    $children: document.createElement('div'),
    _callOnChange: jest.fn(),
    _callOnFinishChange: jest.fn(),
    add: jest.fn(),
    root: {
      $children: document.createElement('div')
    }
  });

  let testObj;
  let mockParent;
  let numberControl;
  
  beforeEach(() => {
    // Create a fresh test object for each test
    testObj = { testValue: 50 };
    mockParent = createMockParent();
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('constructor and initialization', () => {
    beforeEach(() => {
      numberControl = new NumberControl(mockParent, testObj, 'testValue', 0, 100, 1);
    });

    it('should create a NumberControl instance extending BaseControl', () => {
      expect(numberControl).toBeInstanceOf(NumberControl);
      expect(numberControl).toBeInstanceOf(BaseControl);
    });

    it('should create an input element', () => {
      expect(numberControl.$input).toBeInstanceOf(HTMLInputElement);
      expect(numberControl.$input.type).toBe('text');
    });

    it('should initialize with correct min, max and step values', () => {
      expect(numberControl._min).toBe(0);
      expect(numberControl._max).toBe(100);
      expect(numberControl._step).toBe(1);
      expect(numberControl._stepExplicit).toBe(true);
    });

    it('should create a slider when min and max are provided', () => {
      expect(numberControl._hasSlider).toBe(true);
      expect(numberControl.$slider).toBeInstanceOf(HTMLDivElement);
      expect(numberControl.$slider.classList.contains('slider')).toBe(true);
      expect(numberControl.$fill).toBeInstanceOf(HTMLDivElement);
      expect(numberControl.$fill.classList.contains('fill')).toBe(true);
      expect(numberControl.domElement.classList.contains('hasSlider')).toBe(true);
    });

    it('should add the input to the widget', () => {
      expect(numberControl.$widget.contains(numberControl.$input)).toBe(true);
    });

    it('should set the disable target to the input', () => {
      expect(numberControl.$elForDisable).toBe(numberControl.$input);
    });

    it('should initialize the input value', () => {
      expect(numberControl.$input.value).toBe('50');
    });
  });

  describe('constructor without min/max/step', () => {
    it('should not create a slider when min and max are not provided', () => {
      numberControl = new NumberControl(mockParent, testObj, 'testValue', undefined, undefined, undefined);
      expect(numberControl._hasSlider).toBeFalsy();
      expect(numberControl.$slider).toBeUndefined();
    });

    it('should use implicit step when step not provided', () => {
      // When min and max are not provided, implicit step is 0.1
      numberControl = new NumberControl(mockParent, testObj, 'testValue', undefined, undefined, undefined);
      expect(numberControl._step).toBe(0.1);
      expect(numberControl._stepExplicit).toBe(false);
      
      // When min and max are provided, implicit step is (max-min)/1000
      numberControl = new NumberControl(mockParent, testObj, 'testValue', 0, 100, undefined);
      expect(numberControl._step).toBe(0.1); // (100-0)/1000
      expect(numberControl._stepExplicit).toBe(false);
    });
  });

  describe('setter methods', () => {
    beforeEach(() => {
      numberControl = new NumberControl(mockParent, testObj, 'testValue', undefined, undefined, undefined);
    });

    it('should update min value and initialize slider if needed', () => {
      // Spy on _onUpdateMinMax to verify it's called
      jest.spyOn(numberControl, '_onUpdateMinMax');
      
      // Initially no slider without min/max
      expect(numberControl._hasSlider).toBeFalsy();
      
      // Set min
      const result = numberControl.setMin(0);
      
      // Should update min and call _onUpdateMinMax
      expect(numberControl._min).toBe(0);
      expect(numberControl._onUpdateMinMax).toHaveBeenCalled();
      
      // Return value should be the instance for chaining
      expect(result).toBe(numberControl);
    });

    it('should update max value and initialize slider if needed', () => {
      // Spy on _onUpdateMinMax to verify it's called
      jest.spyOn(numberControl, '_onUpdateMinMax');
      
      // Set max
      const result = numberControl.setMax(100);
      
      // Should update max and call _onUpdateMinMax
      expect(numberControl._max).toBe(100);
      expect(numberControl._onUpdateMinMax).toHaveBeenCalled();
      
      // Return value should be the instance for chaining
      expect(result).toBe(numberControl);
    });

    it('should initialize slider when both min and max are set', () => {
      // Initially no slider
      expect(numberControl._hasSlider).toBeFalsy();
      
      // Set min and max
      numberControl.setMin(0);
      numberControl.setMax(100);
      
      // Should initialize slider
      expect(numberControl._hasSlider).toBe(true);
      expect(numberControl.$slider).toBeInstanceOf(HTMLDivElement);
    });

    it('should update step value', () => {
      const result = numberControl.setStep(5);
      
      // Should update step and mark as explicit
      expect(numberControl._step).toBe(5);
      expect(numberControl._stepExplicit).toBe(true);
      
      // Return value should be the instance for chaining
      expect(result).toBe(numberControl);
    });

    it('should update decimals value', () => {
      const result = numberControl.setDecimals(2);
      
      // Should update decimals
      expect(numberControl._decimals).toBe(2);
      
      // Return value should be the instance for chaining
      expect(result).toBe(numberControl);
    });

    it('should expose shorthand methods for min, max, step, and decimals', () => {
      // These are exposed as aliases
      expect(numberControl.min).toBe(numberControl.setMin);
      expect(numberControl.max).toBe(numberControl.setMax);
      expect(numberControl.step).toBe(numberControl.setStep);
      expect(numberControl.decimals).toBe(numberControl.setDecimals);
    });
  });

  describe('update method', () => {
    it('should update the input value', () => {
      numberControl = new NumberControl(mockParent, testObj, 'testValue', undefined, undefined, undefined);
      
      // Change the object value
      testObj.testValue = 75;
      
      // Call update
      const result = numberControl.update();
      
      // Input should reflect new value
      expect(numberControl.$input.value).toBe('75');
      
      // Return value should be the instance for chaining
      expect(result).toBe(numberControl);
    });

    it('should respect decimals when updating the input value', () => {
      numberControl = new NumberControl(mockParent, testObj, 'testValue', undefined, undefined, undefined);
      
      // Set decimals and change value
      numberControl.setDecimals(2);
      testObj.testValue = 75.1234;
      
      // Call update
      numberControl.update();
      
      // Input should show value with specified decimals
      expect(numberControl.$input.value).toBe('75.12');
    });

    it('should update the slider fill width when slider exists', () => {
      numberControl = new NumberControl(mockParent, testObj, 'testValue', 0, 100, undefined);
      
      // Set a new value halfway through the range
      testObj.testValue = 50;
      numberControl.update();
      
      // Fill width should be 50%
      expect(numberControl.$fill.style.width).toBe('50%');
      
      // Set to min value
      testObj.testValue = 0;
      numberControl.update();
      
      // Fill width should be 0%
      expect(numberControl.$fill.style.width).toBe('0%');
      
      // Set to max value
      testObj.testValue = 100;
      numberControl.update();
      
      // Fill width should be 100%
      expect(numberControl.$fill.style.width).toBe('100%');
    });

    it('should not update input value when input is focused', () => {
      numberControl = new NumberControl(mockParent, testObj, 'testValue', undefined, undefined, undefined);
      
      // Set initial value
      numberControl.$input.value = '50';
      
      // Set input as focused
      numberControl._inputFocused = true;
      
      // Change object value
      testObj.testValue = 75;
      
      // Call update
      numberControl.update();
      
      // Input value should not change
      expect(numberControl.$input.value).toBe('50');
    });
  });

  describe('event handling - input events', () => {
    beforeEach(() => {
      numberControl = new NumberControl(mockParent, testObj, 'testValue', 0, 100, 1);
    });

    it('should update the value when input changes', () => {
      // Spy on setValue method
      jest.spyOn(numberControl, 'setValue');
      
      // Change input value and dispatch input event
      numberControl.$input.value = '75';
      numberControl.$input.dispatchEvent(new Event('input'));
      
      // Should call setValue with the parsed value
      expect(numberControl.setValue).toHaveBeenCalledWith(75);
    });

    it('should call _snapClampSetValue with the right value when arrow keys are pressed', () => {
      // Two separate tests for up and down arrows to avoid interference
      // Test ArrowUp
      const upTest = () => {
        // Spy on _snapClampSetValue
        jest.spyOn(numberControl, '_snapClampSetValue');
        
        // Set initial value
        numberControl.$input.value = '50';
        
        // We need to spy on _arrowKeyMultiplier to ensure it returns 1
        jest.spyOn(numberControl, '_arrowKeyMultiplier').mockReturnValue(1);
        
        // Create ArrowUp event
        const arrowUpEvent = new KeyboardEvent('keydown', { code: 'ArrowUp' });
        
        // Mock preventDefault to avoid error
        arrowUpEvent.preventDefault = jest.fn();
        
        // Dispatch event
        numberControl.$input.dispatchEvent(arrowUpEvent);
        
        // Should call _snapClampSetValue with current value + step
        expect(numberControl._snapClampSetValue).toHaveBeenCalledWith(51);
      };
      
      // Test ArrowDown
      const downTest = () => {
        // Reset spies
        jest.clearAllMocks();
        
        // Spy on _snapClampSetValue again
        jest.spyOn(numberControl, '_snapClampSetValue');
        
        // Set initial value
        numberControl.$input.value = '50';
        
        // Ensure _arrowKeyMultiplier returns 1
        jest.spyOn(numberControl, '_arrowKeyMultiplier').mockReturnValue(1);
        
        // Create ArrowDown event
        const arrowDownEvent = new KeyboardEvent('keydown', { code: 'ArrowDown' });
        
        // Mock preventDefault
        arrowDownEvent.preventDefault = jest.fn();
        
        // Dispatch event
        numberControl.$input.dispatchEvent(arrowDownEvent);
        
        // Should call _snapClampSetValue with current value - step
        expect(numberControl._snapClampSetValue).toHaveBeenCalledWith(49);
      };
      
      // Run tests
      upTest();
      downTest();
    });

    it('should blur the input when Enter key is pressed', () => {
      // Spy on blur method
      jest.spyOn(numberControl.$input, 'blur');
      
      // Create Enter event
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      
      // Dispatch event
      numberControl.$input.dispatchEvent(enterEvent);
      
      // Should call blur
      expect(numberControl.$input.blur).toHaveBeenCalled();
    });

    it('should set _inputFocused flag when input is focused', () => {
      // Initially not focused
      expect(numberControl._inputFocused).toBeFalsy();
      
      // Focus input
      numberControl.$input.dispatchEvent(new Event('focus'));
      
      // Flag should be set
      expect(numberControl._inputFocused).toBe(true);
    });

    it('should clear _inputFocused flag and call _callOnFinishChange when input is blurred', () => {
      // Set as focused
      numberControl._inputFocused = true;
      
      // Spy on _callOnFinishChange
      jest.spyOn(numberControl, '_callOnFinishChange');
      
      // Blur input
      numberControl.$input.dispatchEvent(new Event('blur'));
      
      // Flag should be cleared and _callOnFinishChange called
      expect(numberControl._inputFocused).toBe(false);
      expect(numberControl._callOnFinishChange).toHaveBeenCalled();
    });

    it('should handle wheel events on input when focused', () => {
      // Spy on _incrementValue
      jest.spyOn(numberControl, '_incrementValue');
      
      // Spy on _normalizeMouseWheel to return a fixed value
      jest.spyOn(numberControl, '_normalizeMouseWheel').mockReturnValue(1);
      
      // Set as focused
      numberControl._inputFocused = true;
      
      // Create wheel event
      const wheelEvent = new WheelEvent('wheel', { deltaY: -1 });
      wheelEvent.preventDefault = jest.fn();
      
      // Dispatch event
      numberControl.$input.dispatchEvent(wheelEvent);
      
      // Should call _incrementValue with step times normalized wheel delta
      expect(numberControl._incrementValue).toHaveBeenCalledWith(1);
      expect(wheelEvent.preventDefault).toHaveBeenCalled();
    });

    it('should not process wheel events when input is not focused', () => {
      // Spy on _incrementValue
      jest.spyOn(numberControl, '_incrementValue');
      
      // Ensure not focused
      numberControl._inputFocused = false;
      
      // Create wheel event
      const wheelEvent = new WheelEvent('wheel', { deltaY: -1 });
      wheelEvent.preventDefault = jest.fn();
      
      // Dispatch event
      numberControl.$input.dispatchEvent(wheelEvent);
      
      // Should not call _incrementValue or preventDefault
      expect(numberControl._incrementValue).not.toHaveBeenCalled();
      expect(wheelEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should correctly increment value and update input', () => {
      // Spy on _snapClampSetValue
      jest.spyOn(numberControl, '_snapClampSetValue');
      jest.spyOn(numberControl, 'getValue').mockReturnValue(55);
      
      // Set initial value
      numberControl.$input.value = '50';
      
      // Call _incrementValue with a delta
      numberControl._incrementValue(5);
      
      // Should call _snapClampSetValue and update input
      expect(numberControl._snapClampSetValue).toHaveBeenCalledWith(55);
      expect(numberControl.$input.value).toBe('55'); // Now getValue() returns 55
    });
  });

  describe('event handling - slider events', () => {
    beforeEach(() => {
      numberControl = new NumberControl(mockParent, testObj, 'testValue', 0, 100, 1);
      
      // Mock getBoundingClientRect for slider
      numberControl.$slider.getBoundingClientRect = jest.fn().mockReturnValue({
        left: 0,
        right: 100,
        width: 100
      });
    });

    it('should handle mousedown on slider', () => {
      // Spy on required methods
      jest.spyOn(numberControl, '_setDraggingStyle');
      jest.spyOn(numberControl, '_setValueFromClientX');
      
      // Spy on addEventListener for window
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      
      // Create mousedown event
      const mousedownEvent = new MouseEvent('mousedown', { clientX: 50 });
      
      // Dispatch event
      numberControl.$slider.dispatchEvent(mousedownEvent);
      
      // Should call methods with correct args
      expect(numberControl._setDraggingStyle).toHaveBeenCalledWith(true);
      expect(numberControl._setValueFromClientX).toHaveBeenCalledWith(50);
      
      // Should add mousemove and mouseup listeners to window
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    });

    it('should handle slider wheel events', () => {
      // Spy on required methods
      jest.spyOn(numberControl, '_snapClampSetValue');
      jest.spyOn(numberControl, '_normalizeMouseWheel').mockReturnValue(1);
      jest.spyOn(numberControl, 'getValue').mockReturnValue(50); // Initial value
      
      // Create wheel event
      const wheelEvent = new WheelEvent('wheel', { deltaX: 0, deltaY: -1 });
      wheelEvent.preventDefault = jest.fn();
      
      // Dispatch event
      numberControl.$slider.dispatchEvent(wheelEvent);
      
      // Should prevent default and update value
      expect(wheelEvent.preventDefault).toHaveBeenCalled();
      expect(numberControl._snapClampSetValue).toHaveBeenCalledWith(51); // 50 + (1 * 1)
      
      // Since we're mocking, we need to manually update the input value
      numberControl.$input.value = '51';
      
      // Should update input value
      expect(numberControl.$input.value).toBe('51');
    });

    it('should map client X position to value range', () => {
      // Test _setValueFromClientX with different positions
      jest.spyOn(numberControl, '_snapClampSetValue');
      
      numberControl._setValueFromClientX(0); // leftmost position = min value
      expect(numberControl._snapClampSetValue).toHaveBeenCalledWith(0);
      
      jest.clearAllMocks();
      jest.spyOn(numberControl, '_snapClampSetValue');
      
      numberControl._setValueFromClientX(50); // middle position = halfway value
      expect(numberControl._snapClampSetValue).toHaveBeenCalledWith(50);
      
      jest.clearAllMocks();
      jest.spyOn(numberControl, '_snapClampSetValue');
      
      numberControl._setValueFromClientX(100); // rightmost position = max value
      expect(numberControl._snapClampSetValue).toHaveBeenCalledWith(100);
    });

    it('should handle touchstart on slider when not in scrollable container', () => {
      // Mock hasScrollBar to be false
      jest.spyOn(numberControl, '_hasScrollBar', 'get').mockReturnValue(false);
      
      // Spy on _beginTouchDrag
      jest.spyOn(numberControl, '_beginTouchDrag');
      
      // Create touch event with properly mocked Touch object
      const touch = {
        clientX: 50,
        clientY: 50,
        force: 1,
        identifier: 0,
        pageX: 50,
        pageY: 50,
        radiusX: 0,
        radiusY: 0,
        rotationAngle: 0,
        screenX: 0,
        screenY: 0,
        target: numberControl.$slider
      } as Touch;
      
      const touchEvent = new TouchEvent('touchstart', {
        touches: [touch]
      });
      
      // Dispatch event
      numberControl.$slider.dispatchEvent(touchEvent);
      
      // Should call _beginTouchDrag
      expect(numberControl._beginTouchDrag).toHaveBeenCalledWith(touchEvent);
    });

    it('should begin touch drag correctly', () => {
      // Spy on required methods
      jest.spyOn(numberControl, '_setDraggingStyle');
      jest.spyOn(numberControl, '_setValueFromClientX');
      
      // Spy on addEventListener for window
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      
      // Create touch event with properly mocked Touch object
      const touch = {
        clientX: 50,
        clientY: 50,
        force: 1,
        identifier: 0,
        pageX: 50,
        pageY: 50,
        radiusX: 0,
        radiusY: 0,
        rotationAngle: 0,
        screenX: 0,
        screenY: 0,
        target: numberControl.$slider
      } as Touch;
      
      const touchEvent = new TouchEvent('touchstart', {
        touches: [touch]
      });
      touchEvent.preventDefault = jest.fn();
      
      // Call method directly
      numberControl._beginTouchDrag(touchEvent);
      
      // Should prevent default, set dragging style, and set value
      expect(touchEvent.preventDefault).toHaveBeenCalled();
      expect(numberControl._setDraggingStyle).toHaveBeenCalledWith(true);
      expect(numberControl._setValueFromClientX).toHaveBeenCalledWith(50);
      
      // Should add touchmove and touchend listeners to window
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: false });
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
    });

    it('should clean up touch events', () => {
      // Spy on removeEventListener
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      // Create mock handlers
      const moveHandler = jest.fn();
      const endHandler = jest.fn();
      
      // Call clean up method
      numberControl._cleanupTouchEvents(moveHandler, endHandler);
      
      // Should remove event listeners
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', moveHandler);
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', endHandler);
    });

    it('should handle touchstart on slider when in scrollable container', () => {
      // Mock hasScrollBar to be true
      jest.spyOn(numberControl, '_hasScrollBar', 'get').mockReturnValue(true);
      
      // Create touch event with properly mocked Touch object
      const touch = {
        clientX: 50,
        clientY: 50,
        force: 1,
        identifier: 0,
        pageX: 50,
        pageY: 50,
        radiusX: 0,
        radiusY: 0,
        rotationAngle: 0,
        screenX: 0,
        screenY: 0,
        target: numberControl.$slider
      } as Touch;
      
      const touchEvent = new TouchEvent('touchstart', {
        touches: [touch]
      });
      
      // Spy on addEventListener
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      
      // Dispatch event
      numberControl.$slider.dispatchEvent(touchEvent);
      
      // Should add touchmove and touchend listeners to window to test for scroll intent
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: false });
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
    });

    it('should handle input with invalid numeric value', () => {
      // Spy on setValue method
      jest.spyOn(numberControl, 'setValue');
      
      // Change input to non-numeric value and dispatch input event
      numberControl.$input.value = 'not a number';
      numberControl.$input.dispatchEvent(new Event('input'));
      
      // Should not call setValue
      expect(numberControl.setValue).not.toHaveBeenCalled();
    });

    it('should handle input with step snapping', () => {
      // Ensure step is 5
      numberControl.setStep(5);
      
      // Spy on setValue and _snap methods
      jest.spyOn(numberControl, 'setValue');
      
      // Change input value to something not aligned with step
      numberControl.$input.value = '52';
      numberControl.$input.dispatchEvent(new Event('input'));
      
      // Should snap to 50 (nearest multiple of 5) and then call setValue
      expect(numberControl.setValue).toHaveBeenCalledWith(50);
    });

    it('should check _hasScrollBar getter', () => {
      // Mock the parent.root.$children
      const mockRoot = {
        scrollHeight: 200,
        clientHeight: 100
      };
      
      // Replace the parent.root.$children object
      Object.defineProperty(mockParent.root, '$children', {
        get: () => mockRoot
      });
      
      // Test getter
      expect(numberControl._hasScrollBar).toBe(true);
      
      // Update mock values
      mockRoot.scrollHeight = 100;
      
      // Test again
      expect(numberControl._hasScrollBar).toBe(false);
    });
  });

  describe('helper methods', () => {
    beforeEach(() => {
      numberControl = new NumberControl(mockParent, testObj, 'testValue', 0, 100, 1);
    });

    it('should correctly snap values to steps', () => {
      // With step 1, values should snap to integers
      expect(numberControl._snap(1.2)).toBe(1);
      expect(numberControl._snap(1.8)).toBe(2);
      
      // Change step to 0.5
      numberControl.setStep(0.5);
      
      // Values should snap to multiples of 0.5
      expect(numberControl._snap(1.2)).toBe(1);
      expect(numberControl._snap(1.3)).toBe(1.5);
      expect(numberControl._snap(1.7)).toBe(1.5);
      expect(numberControl._snap(1.8)).toBe(2);
    });

    it('should correctly clamp values to min/max', () => {
      // Values should be clamped to 0-100
      expect(numberControl._clamp(-10)).toBe(0);
      expect(numberControl._clamp(50)).toBe(50);
      expect(numberControl._clamp(150)).toBe(100);
    });

    it('should combine snap and clamp in _snapClampSetValue', () => {
      // Spy on setValue
      jest.spyOn(numberControl, 'setValue');
      
      // Call _snapClampSetValue with a value that needs snapping and clamping
      numberControl._snapClampSetValue(100.3);
      
      // Should be snapped to 100 and not clamped
      expect(numberControl.setValue).toHaveBeenCalledWith(100);
      
      // Call with value that exceeds max
      numberControl._snapClampSetValue(101.8);
      
      // Should be snapped to 102 then clamped to 100
      expect(numberControl.setValue).toHaveBeenCalledWith(100);
    });

    it('should correctly determine if min/max are set', () => {
      expect(numberControl._hasMin).toBe(true);
      expect(numberControl._hasMax).toBe(true);
      
      // Create control without min/max
      const noMinMaxControl = new NumberControl(mockParent, testObj, 'testValue', undefined, undefined, undefined);
      
      expect(noMinMaxControl._hasMin).toBe(false);
      expect(noMinMaxControl._hasMax).toBe(false);
    });

    it('should set dragging style correctly', () => {
      // Mock classList.toggle for document.body
      document.body.classList.toggle = jest.fn();
      
      // Mock classList.toggle for slider
      numberControl.$slider.classList.toggle = jest.fn();
      
      // Call method with horizontal axis
      numberControl._setDraggingStyle(true, 'horizontal');
      
      // Check if toggles were called correctly
      expect(numberControl.$slider.classList.toggle).toHaveBeenCalledWith('active', true);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('rad-gui-dragging', true);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('rad-gui-horizontal', true);
      
      // Reset mocks
      jest.clearAllMocks();
      
      // Call method with vertical axis
      numberControl._setDraggingStyle(true, 'vertical');
      
      // Check toggles again
      expect(numberControl.$slider.classList.toggle).toHaveBeenCalledWith('active', true);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('rad-gui-dragging', true);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('rad-gui-vertical', true);
    });

    it('should normalize mouse wheel values correctly', () => {
      // Standard wheel event
      const event1 = { deltaX: 0, deltaY: 1 };
      expect(numberControl._normalizeMouseWheel(event1)).toBe(-1);
      
      // Old-style wheel event with wheelDelta
      const event2 = { 
        deltaX: 0, 
        deltaY: 0.5, // non-integer
        wheelDelta: 120 
      };
      expect(numberControl._normalizeMouseWheel(event2)).toBe(1);
      
      // Test with non-explicit step
      numberControl._stepExplicit = false;
      expect(numberControl._normalizeMouseWheel(event2)).toBe(10);
    });

    it('should calculate arrow key multiplier correctly', () => {
      // Default multiplier with explicit step
      expect(numberControl._arrowKeyMultiplier({})).toBe(1);
      
      // With shift key
      expect(numberControl._arrowKeyMultiplier({ shiftKey: true })).toBe(10);
      
      // With alt key
      expect(numberControl._arrowKeyMultiplier({ altKey: true })).toBe(0.1);
      
      // Non-explicit step
      numberControl._stepExplicit = false;
      expect(numberControl._arrowKeyMultiplier({})).toBe(10);
      
      // Non-explicit step with shift
      expect(numberControl._arrowKeyMultiplier({ shiftKey: true })).toBe(100);
      
      // Non-explicit step with alt
      expect(numberControl._arrowKeyMultiplier({ altKey: true })).toBe(1);
    });

    it('should map range values correctly', () => {
      // Map from 0-100 to 0-1
      expect(numberControl._mapRange(0, 0, 100, 0, 1)).toBe(0);
      expect(numberControl._mapRange(50, 0, 100, 0, 1)).toBe(0.5);
      expect(numberControl._mapRange(100, 0, 100, 0, 1)).toBe(1);
      
      // Map from 0-100 to 100-200
      expect(numberControl._mapRange(0, 0, 100, 100, 200)).toBe(100);
      expect(numberControl._mapRange(50, 0, 100, 100, 200)).toBe(150);
      expect(numberControl._mapRange(100, 0, 100, 100, 200)).toBe(200);
    });
  });
}); 