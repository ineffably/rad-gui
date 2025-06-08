import TextControl from '../../src/controls/text-control';
import BaseControl from '../../src/controls/base-control';

describe('TextControl', () => {
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
  let textControl;
  
  beforeEach(() => {
    // Create a fresh test object for each test
    testObj = { testText: 'initial value' };
    mockParent = createMockParent();
    textControl = new TextControl(mockParent, testObj, 'testText');
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a TextControl instance extending BaseControl', () => {
      expect(textControl).toBeInstanceOf(TextControl);
      expect(textControl).toBeInstanceOf(BaseControl);
    });

    it('should create a text input element', () => {
      expect(textControl.$input).toBeInstanceOf(HTMLInputElement);
      expect(textControl.$input.type).toBe('text');
    });

    it('should add the input to the widget', () => {
      expect(textControl.$widget.contains(textControl.$input)).toBe(true);
    });

    it('should set the disable target to the input', () => {
      expect(textControl.$elForDisable).toBe(textControl.$input);
    });

    it('should set spellcheck to false on the input', () => {
      expect(textControl.$input.spellcheck).toBe("false");
    });

    it('should call update method to set initial value', () => {
      expect(textControl.$input.value).toBe('initial value');
    });
  });

  describe('update method', () => {
    it('should update the input value to match the object property', () => {
      // Change the object property
      testObj.testText = 'updated value';
      
      // Call update
      textControl.update();
      
      // Input should reflect the new value
      expect(textControl.$input.value).toBe('updated value');
    });

    it('should return the instance for chaining', () => {
      const result = textControl.update();
      expect(result).toBe(textControl);
    });
  });

  describe('event handling', () => {
    it('should update the value when input changes', () => {
      // Spy on setValue method
      jest.spyOn(textControl, 'setValue');
      
      // Change input value and dispatch input event
      textControl.$input.value = 'new text';
      textControl.$input.dispatchEvent(new Event('input'));
      
      // Should call setValue with the new value
      expect(textControl.setValue).toHaveBeenCalledWith('new text');
    });

    it('should call _callOnFinishChange on blur', () => {
      // Spy on _callOnFinishChange method
      jest.spyOn(textControl, '_callOnFinishChange');
      
      // Dispatch blur event
      textControl.$input.dispatchEvent(new Event('blur'));
      
      // Should call _callOnFinishChange
      expect(textControl._callOnFinishChange).toHaveBeenCalled();
    });

    it('should blur the input when Enter key is pressed', () => {
      // Spy on the blur method
      jest.spyOn(textControl.$input, 'blur');
      
      // Create a keyboard event for Enter key
      const enterEvent = new KeyboardEvent('keydown', { code: 'Enter' });
      
      // Dispatch the event
      textControl.$input.dispatchEvent(enterEvent);
      
      // Should call blur
      expect(textControl.$input.blur).toHaveBeenCalled();
    });

    it('should not blur the input when other keys are pressed', () => {
      // Spy on the blur method
      jest.spyOn(textControl.$input, 'blur');
      
      // Create a keyboard event for a different key
      const spaceEvent = new KeyboardEvent('keydown', { code: 'Space' });
      
      // Dispatch the event
      textControl.$input.dispatchEvent(spaceEvent);
      
      // Should not call blur
      expect(textControl.$input.blur).not.toHaveBeenCalled();
    });
  });

  describe('interaction with base class', () => {
    it('should properly disable the input', () => {
      textControl.disable();
      expect(textControl.$input.disabled).toBe(true);
      
      textControl.enable();
      expect(textControl.$input.disabled).toBe(false);
    });
  });
}); 