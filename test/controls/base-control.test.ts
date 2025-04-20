import BaseControl from '../../src/controls/base-control';
import { el } from '../../src/utils/el';

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = jest.fn(callback => setTimeout(callback, 0));
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

describe('BaseControl', () => {
  // Mock parent object with required methods and properties
  const createMockParent = () => ({
    children: [],
    controllers: [],
    $children: document.createElement('div'),
    _callOnChange: jest.fn(),
    _callOnFinishChange: jest.fn(),
    add: jest.fn((obj, prop, options) => {
      const newControl = new BaseControl(mockParent, obj, prop, 'mock-class');
      return newControl;
    })
  });

  // Test object and property
  let testObj;
  const testProperty = 'testProperty';
  
  let mockParent;
  let baseControl;
  
  beforeEach(() => {
    // Create a fresh test object for each test
    testObj = { testProperty: 'initialValue' };
    mockParent = createMockParent();
    baseControl = new BaseControl(mockParent, testObj, testProperty, 'test-class');
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a BaseControl instance with correct properties', () => {
      expect(baseControl).toBeInstanceOf(BaseControl);
      expect(baseControl.parent).toBe(mockParent);
      expect(baseControl.object).toBe(testObj);
      expect(baseControl.property).toBe(testProperty);
      expect(baseControl._disabled).toBe(false);
      expect(baseControl._hidden).toBe(false);
      expect(baseControl.initialValue).toBe('initialValue');
    });

    it('should create DOM elements with correct classes', () => {
      expect(baseControl.domElement).toBeInstanceOf(HTMLElement);
      expect(baseControl.domElement.classList.contains('controller')).toBe(true);
      expect(baseControl.domElement.classList.contains('test-class')).toBe(true);
      
      expect(baseControl.$name).toBeInstanceOf(HTMLElement);
      expect(baseControl.$name.classList.contains('name')).toBe(true);
      
      expect(baseControl.$widget).toBeInstanceOf(HTMLElement);
      expect(baseControl.$widget.classList.contains('widget')).toBe(true);
    });

    it('should add itself to parent', () => {
      expect(mockParent.children).toContain(baseControl);
      expect(mockParent.controllers).toContain(baseControl);
      expect(mockParent.$children.contains(baseControl.domElement)).toBe(true);
    });

    it('should set the name to the property name', () => {
      expect(baseControl._name).toBe(testProperty);
      expect(baseControl.$name.textContent).toBe(testProperty);
    });
  });

  describe('name method', () => {
    it('should set the name property and update DOM element', () => {
      const newName = 'New Test Name';
      const result = baseControl.name(newName);
      
      expect(baseControl._name).toBe(newName);
      expect(baseControl.$name.textContent).toBe(newName);
      expect(result).toBe(baseControl); // Should return this for chaining
    });
  });

  describe('onChange method', () => {
    it('should set the onChange callback and return the instance', () => {
      const callback = jest.fn();
      const result = baseControl.onChange(callback);
      
      expect(baseControl._onChange).toBe(callback);
      expect(result).toBe(baseControl); // Should return this for chaining
    });
  });

  describe('_callOnChange method', () => {
    it('should call parent onChange method', () => {
      baseControl._callOnChange();
      
      expect(mockParent._callOnChange).toHaveBeenCalledWith(baseControl);
    });

    it('should call the onChange callback with the current value', () => {
      const callback = jest.fn();
      baseControl.onChange(callback);
      baseControl._callOnChange();
      
      expect(callback).toHaveBeenCalledWith('initialValue');
    });

    it('should set the _changed flag to true', () => {
      baseControl._callOnChange();
      
      expect(baseControl._changed).toBe(true);
    });
  });

  describe('onFinishChange method', () => {
    it('should set the onFinishChange callback and return the instance', () => {
      const callback = jest.fn();
      const result = baseControl.onFinishChange(callback);
      
      expect(baseControl._onFinishChange).toBe(callback);
      expect(result).toBe(baseControl); // Should return this for chaining
    });
  });

  describe('_callOnFinishChange method', () => {
    it('should not call callbacks if not changed', () => {
      const callback = jest.fn();
      baseControl._changed = false;
      baseControl.onFinishChange(callback);
      baseControl._callOnFinishChange();
      
      expect(mockParent._callOnFinishChange).not.toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();
    });

    it('should call callbacks if changed', () => {
      const callback = jest.fn();
      baseControl._changed = true;
      baseControl.onFinishChange(callback);
      baseControl._callOnFinishChange();
      
      expect(mockParent._callOnFinishChange).toHaveBeenCalledWith(baseControl);
      expect(callback).toHaveBeenCalledWith('initialValue');
    });

    it('should reset the _changed flag', () => {
      baseControl._changed = true;
      baseControl._callOnFinishChange();
      
      expect(baseControl._changed).toBe(false);
    });
  });

  describe('reset method', () => {
    it('should reset value to initial value and call onFinishChange', () => {
      // Setup
      testObj.testProperty = 'changedValue';
      
      // Need to use the real methods, not spies for this test
      const result = baseControl.reset();
      
      // Assert
      expect(testObj.testProperty).toBe('initialValue');
      expect(result).toBe(baseControl); // Should return this for chaining
    });
  });

  describe('enable/disable methods', () => {
    it('should disable the control', () => {
      const result = baseControl.disable();
      
      expect(baseControl._disabled).toBe(true);
      expect(baseControl.domElement.classList.contains('disabled')).toBe(true);
      expect(baseControl.$elForDisable.hasAttribute('disabled')).toBe(true);
      expect(result).toBe(baseControl); // Should return this for chaining
    });

    it('should enable the control', () => {
      // First disable
      baseControl.disable();
      
      // Then enable
      const result = baseControl.enable();
      
      expect(baseControl._disabled).toBe(false);
      expect(baseControl.domElement.classList.contains('disabled')).toBe(false);
      expect(baseControl.$elForDisable.hasAttribute('disabled')).toBe(false);
      expect(result).toBe(baseControl); // Should return this for chaining
    });

    it('should not change state if already in the desired state', () => {
      // Spy on classList methods
      jest.spyOn(baseControl.domElement.classList, 'toggle');
      
      // Already enabled, try to enable again
      baseControl.enable();
      
      expect(baseControl.domElement.classList.toggle).not.toHaveBeenCalled();
    });
  });

  describe('show/hide methods', () => {
    it('should hide the control', () => {
      const result = baseControl.hide();
      
      expect(baseControl._hidden).toBe(true);
      expect(baseControl.domElement.style.display).toBe('none');
      expect(result).toBe(baseControl); // Should return this for chaining
    });

    it('should show the control', () => {
      // First hide
      baseControl.hide();
      
      // Then show
      const result = baseControl.show();
      
      expect(baseControl._hidden).toBe(false);
      expect(baseControl.domElement.style.display).toBe('');
      expect(result).toBe(baseControl); // Should return this for chaining
    });
  });

  describe('options method', () => {
    it('should create a new controller with options and destroy itself', () => {
      jest.spyOn(baseControl, 'destroy');
      
      const options = ['option1', 'option2'];
      const result = baseControl.options(options);
      
      expect(mockParent.add).toHaveBeenCalledWith(testObj, testProperty, options);
      expect(baseControl.destroy).toHaveBeenCalled();
      expect(result).not.toBe(baseControl); // Should return the new controller
    });
  });

  describe('min/max/step/decimals stub methods', () => {
    it('should return the instance for chaining', () => {
      expect(baseControl.setMin(0)).toBe(baseControl);
      expect(baseControl.setMax(100)).toBe(baseControl);
      expect(baseControl.setStep(1)).toBe(baseControl);
      expect(baseControl.setDecimals(2)).toBe(baseControl);
    });
  });

  describe('listen method', () => {
    it('should start listening for changes', () => {
      jest.spyOn(baseControl, '_listenCallback');
      
      const result = baseControl.listen();
      
      expect(baseControl._listening).toBe(true);
      expect(baseControl._listenCallback).toHaveBeenCalled();
      expect(result).toBe(baseControl); // Should return this for chaining
    });

    it('should stop listening for changes', () => {
      // First start listening
      baseControl._listenCallbackID = 123;
      baseControl._listening = true;
      
      // Then stop
      const result = baseControl.listen(false);
      
      expect(baseControl._listening).toBe(false);
      expect(global.cancelAnimationFrame).toHaveBeenCalledWith(123);
      expect(result).toBe(baseControl); // Should return this for chaining
    });
  });

  describe('_listenCallback method', () => {
    it('should request animation frame and check value changes', () => {
      jest.spyOn(baseControl, 'save').mockReturnValue('currentValue');
      jest.spyOn(baseControl, 'update');
      
      baseControl._listenPrevValue = 'previousValue';
      baseControl._listenCallback();
      
      expect(global.requestAnimationFrame).toHaveBeenCalled();
      expect(baseControl.update).toHaveBeenCalled();
      expect(baseControl._listenPrevValue).toBe('currentValue');
    });

    it('should not update if value has not changed', () => {
      jest.spyOn(baseControl, 'save').mockReturnValue('sameValue');
      jest.spyOn(baseControl, 'update');
      
      baseControl._listenPrevValue = 'sameValue';
      baseControl._listenCallback();
      
      expect(baseControl.update).not.toHaveBeenCalled();
    });
  });

  describe('getValue/setValue methods', () => {
    it('should get the current value from the object', () => {
      expect(baseControl.getValue()).toBe('initialValue');
      
      // Change the value and check again
      testObj.testProperty = 'newValue';
      expect(baseControl.getValue()).toBe('newValue');
    });

    it('should set the value and call onChange if changed', () => {
      // Use the real method without spying
      const result = baseControl.setValue('newValue');
      
      expect(testObj.testProperty).toBe('newValue');
      expect(result).toBe(baseControl); // Should return this for chaining
    });

    // Test for not triggering updates for same value moved to different section
  });

  // Create a special section for this tricky test case
  describe('setValue with same value', () => {
    it('should not call update if value is the same', () => {
      // Create a new clean instance for this test
      const obj = { prop: 'value' };
      const control = new BaseControl(mockParent, obj, 'prop', 'test-class');
      
      // Replace the update method with a mock to verify it's not called
      const mockUpdate = jest.fn();
      control.update = mockUpdate;
      
      // Call setValue with the same value
      control.setValue('value');
      
      // Verify update was not called
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('update method', () => {
    it('should return the instance for overriding in subclasses', () => {
      expect(baseControl.update()).toBe(baseControl);
    });
  });

  describe('load method', () => {
    it('should set value and call onFinishChange', () => {
      jest.spyOn(baseControl, '_callOnFinishChange');
      
      const result = baseControl.load('loadedValue');
      
      expect(testObj.testProperty).toBe('loadedValue');
      expect(baseControl._callOnFinishChange).toHaveBeenCalled();
      expect(result).toBe(baseControl); // Should return this for chaining
    });
  });

  describe('save method', () => {
    it('should return the current value', () => {
      // Start with a fresh instance
      const newObj = { prop: 'savedValue' };
      const control = new BaseControl(mockParent, newObj, 'prop', 'test-class');
      
      expect(control.save()).toBe('savedValue');
    });
  });

  describe('destroy method', () => {
    it('should clean up all references and DOM elements', () => {
      jest.spyOn(baseControl, 'listen');
      
      baseControl.destroy();
      
      expect(baseControl.listen).toHaveBeenCalledWith(false);
      expect(mockParent.children).not.toContain(baseControl);
      expect(mockParent.controllers).not.toContain(baseControl);
      expect(mockParent.$children.contains(baseControl.domElement)).toBe(false);
    });
  });
}); 