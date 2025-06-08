import ToggleControl from '../../src/controls/toggle-control';
import BaseControl from '../../src/controls/base-control';

describe('BooleanController', () => {
  // Mock parent object with required methods and properties
  const createMockParent = () => ({
    children: [],
    controllers: [],
    $children: document.createElement('div'),
    _callOnChange: jest.fn(),
    _callOnFinishChange: jest.fn(),
    add: jest.fn()
  });

  let testObj;
  let mockParent;
  let booleanControl;
  
  beforeEach(() => {
    // Create a fresh test object for each test
    testObj = { testProperty: false };
    mockParent = createMockParent();
    booleanControl = new ToggleControl(mockParent, testObj, 'testProperty');
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a BooleanController instance extending BaseControl', () => {
      expect(booleanControl).toBeInstanceOf(ToggleControl);
      expect(booleanControl).toBeInstanceOf(BaseControl);
    });

    it('should create a checkbox input element', () => {
      expect(booleanControl.$input).toBeInstanceOf(HTMLInputElement);
      expect(booleanControl.$input.type).toBe('checkbox');
    });

    it('should add the input to the widget', () => {
      expect(booleanControl.$widget.contains(booleanControl.$input)).toBe(true);
    });

    it('should set the disable target to the input', () => {
      expect(booleanControl.$elForDisable).toBe(booleanControl.$input);
    });

    it('should call update method to set initial state', () => {
      const controller = new ToggleControl(mockParent, { prop: true }, 'prop');
      expect(controller.$input.checked).toBe(true);
    });
  });

  describe('update method', () => {
    it('should update the checkbox checked state to match the value', () => {
      // Start with false
      expect(booleanControl.$input.checked).toBe(false);
      
      // Change value to true
      testObj.testProperty = true;
      booleanControl.update();
      
      // Should update checkbox
      expect(booleanControl.$input.checked).toBe(true);
    });

    it('should return the instance for chaining', () => {
      const result = booleanControl.update();
      expect(result).toBe(booleanControl);
    });
  });

  describe('event handling', () => {
    it('should update the value when checkbox is changed', () => {
      // Mock the setValue method
      jest.spyOn(booleanControl, 'setValue');
      jest.spyOn(booleanControl, '_callOnFinishChange');
      
      // Simulate checkbox change
      booleanControl.$input.checked = true;
      booleanControl.$input.dispatchEvent(new Event('change'));
      
      // Should update value
      expect(booleanControl.setValue).toHaveBeenCalledWith(true);
      expect(booleanControl._callOnFinishChange).toHaveBeenCalled();
    });
  });

  describe('interaction with base class', () => {
    it('should properly disable the checkbox input', () => {
      booleanControl.disable();
      expect(booleanControl.$input.disabled).toBe(true);
      
      booleanControl.enable();
      expect(booleanControl.$input.disabled).toBe(false);
    });
  });
}); 