import FunctionControl from '../../src/controls/function-control';
import BaseControl from '../../src/controls/base-control';

describe('FunctionController', () => {
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
  let functionControl;
  let mockFunction;
  
  beforeEach(() => {
    // Create a fresh test object with a function property for each test
    mockFunction = jest.fn();
    testObj = { testFunction: mockFunction };
    mockParent = createMockParent();
    functionControl = new FunctionControl(mockParent, testObj, 'testFunction');
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a FunctionController instance extending BaseControl', () => {
      expect(functionControl).toBeInstanceOf(FunctionControl);
      expect(functionControl).toBeInstanceOf(BaseControl);
    });

    it('should create a button element', () => {
      expect(functionControl.$button).toBeInstanceOf(HTMLButtonElement);
    });

    it('should add the $name element to the button', () => {
      expect(functionControl.$button.contains(functionControl.$name)).toBe(true);
    });

    it('should add the button to the widget', () => {
      expect(functionControl.$widget.contains(functionControl.$button)).toBe(true);
    });

    it('should set the disable target to the button', () => {
      expect(functionControl.$elForDisable).toBe(functionControl.$button);
    });
  });

  describe('event handling', () => {
    it('should call the function when button is clicked', () => {
      // Simulate button click
      functionControl.$button.click();
      
      // Should call the function
      expect(mockFunction).toHaveBeenCalled();
    });
    
    it('should call the function with the correct context (this)', () => {
      // Create a function that uses 'this'
      const contextFunc = jest.fn(function() {
        return this;
      });
      
      // Create new controller with this function
      testObj.contextFunction = contextFunc;
      const ctxController = new FunctionControl(mockParent, testObj, 'contextFunction');
      
      // Simulate button click
      ctxController.$button.click();
      
      // Function should be called with the correct 'this' context
      expect(contextFunc).toHaveBeenCalled();
      expect(contextFunc.mock.results[0].value).toBe(testObj);
    });

    it('should call _callOnChange after function execution', () => {
      // Create a sequence tracking variable
      let sequence = [];
      
      // Mock the function to track sequence
      mockFunction.mockImplementation(() => {
        sequence.push('function');
      });
      
      // Mock _callOnChange to track sequence
      jest.spyOn(functionControl, '_callOnChange').mockImplementation(() => {
        sequence.push('onChange');
      });
      
      // Simulate button click
      functionControl.$button.click();
      
      // Verify the sequence of calls
      expect(sequence).toEqual(['function', 'onChange']);
    });

    it('should prevent default on click event', () => {
      // Instead of trying to access the handler directly, we can test 
      // indirectly by creating a new controller and testing the behavior
      
      // Create a new controller with a new instance
      const newObj = { foo: jest.fn() };
      const newController = new FunctionControl(mockParent, newObj, 'foo');
      
      // Create a custom event with preventDefault spy
      const mockPreventDefault = jest.fn();
      const clickEvent = new MouseEvent('click');
      clickEvent.preventDefault = mockPreventDefault;
      
      // Dispatch the event directly on the button
      newController.$button.dispatchEvent(clickEvent);
      
      // Assert that foo was called
      expect(newObj.foo).toHaveBeenCalled();
      
      // Test if using addEventListener properly by dispatching an event
      // This would only work if both the function call and preventDefault work
      expect(mockPreventDefault).toHaveBeenCalled();
    });
  });

  describe('interaction with base class', () => {
    it('should properly disable the button', () => {
      functionControl.disable();
      expect(functionControl.$button.disabled).toBe(true);
      
      functionControl.enable();
      expect(functionControl.$button.disabled).toBe(false);
    });
  });
}); 