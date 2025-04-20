import OptionControl from '../../src/controls/option-control';
import BaseControl from '../../src/controls/base-control';

describe('OptionControl', () => {
  // Mock parent object with required methods and properties
  const createMockParent = () => ({
    children: [],
    controllers: [],
    $children: document.createElement('div'),
    _callOnChange: jest.fn(),
    _callOnFinishChange: jest.fn(),
    add: jest.fn()
  });

  // Test option configurations
  const arrayOptions = ['option1', 'option2', 'option3'];
  const objectOptions = { key1: 'value1', key2: 'value2', key3: 'value3' };

  let testObj;
  let mockParent;
  let optionControl;
  
  beforeEach(() => {
    // Create a fresh test object for each test
    testObj = { selectedOption: 'option1' };
    mockParent = createMockParent();
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('constructor and initialization', () => {
    beforeEach(() => {
      optionControl = new OptionControl(mockParent, testObj, 'selectedOption', arrayOptions);
    });

    it('should create an OptionControl instance extending BaseControl', () => {
      expect(optionControl).toBeInstanceOf(OptionControl);
      expect(optionControl).toBeInstanceOf(BaseControl);
    });

    it('should create a select element', () => {
      expect(optionControl.$select).toBeInstanceOf(HTMLSelectElement);
    });

    it('should create a display div element', () => {
      expect(optionControl.$display).toBeInstanceOf(HTMLDivElement);
      expect(optionControl.$display.classList.contains('display')).toBe(true);
    });

    it('should add the select and display elements to the widget', () => {
      expect(optionControl.$widget.contains(optionControl.$select)).toBe(true);
      expect(optionControl.$widget.contains(optionControl.$display)).toBe(true);
    });

    it('should call options method with provided options during initialization', () => {
      // Check if options were properly initialized
      expect(optionControl.$select.children.length).toBe(arrayOptions.length);
      
      // Check display shows correct text
      expect(optionControl.$display.textContent).toBe('option1');
      
      // Check that the correct number of options were created
      expect(optionControl.$select.options.length).toBe(arrayOptions.length);
    });
  });

  describe('options method', () => {
    it('should initialize with array options', () => {
      optionControl = new OptionControl(mockParent, testObj, 'selectedOption', arrayOptions);
      
      // Check that the correct number of options were created
      expect(optionControl.$select.children.length).toBe(arrayOptions.length);
      expect(optionControl.$select.options.length).toBe(arrayOptions.length);
      
      // Check that values array is set correctly internally
      expect(optionControl['_values']).toEqual(arrayOptions);
      expect(optionControl['_names']).toEqual(arrayOptions);
    });

    it('should initialize with object options', () => {
      optionControl = new OptionControl(mockParent, testObj, 'selectedOption', objectOptions);
      
      // Check that the correct number of options were created
      expect(optionControl.$select.children.length).toBe(Object.keys(objectOptions).length);
      
      // Check that values and names are set correctly internally
      expect(optionControl['_values']).toEqual(Object.values(objectOptions));
      expect(optionControl['_names']).toEqual(Object.keys(objectOptions));
    });

    it('should return the instance for chaining', () => {
      optionControl = new OptionControl(mockParent, testObj, 'selectedOption', arrayOptions);
      const result = optionControl.options(objectOptions);
      expect(result).toBe(optionControl);
    });

    it('should update existing options when called again', () => {
      optionControl = new OptionControl(mockParent, testObj, 'selectedOption', arrayOptions);
      
      // Initially has array options
      expect(optionControl.$select.children.length).toBe(arrayOptions.length);
      
      // Update with object options
      optionControl.options(objectOptions);
      
      // Should now have object keys as options
      expect(optionControl.$select.children.length).toBe(Object.keys(objectOptions).length);
      
      // Check that values and names are updated correctly
      expect(optionControl['_values']).toEqual(Object.values(objectOptions));
      expect(optionControl['_names']).toEqual(Object.keys(objectOptions));
    });

    it('should call update after setting options', () => {
      // Create the component
      optionControl = new OptionControl(mockParent, { selectedOption: 'value1' }, 'selectedOption', objectOptions);
      
      // Spy on update method
      jest.spyOn(optionControl, 'update');
      
      // Call options again
      optionControl.options(arrayOptions);
      
      // Should call update
      expect(optionControl.update).toHaveBeenCalled();
    });
  });

  describe('update method', () => {
    beforeEach(() => {
      testObj = { selectedOption: 'option2' };
      optionControl = new OptionControl(mockParent, testObj, 'selectedOption', arrayOptions);
    });

    it('should set selectedIndex based on the current value', () => {
      // option2 is at index 1
      expect(optionControl.$select.selectedIndex).toBe(1);
      
      // Change value to option3
      testObj.selectedOption = 'option3';
      optionControl.update();
      
      // Selected index should now be 2
      expect(optionControl.$select.selectedIndex).toBe(2);
    });

    it('should update display text content based on selected option', () => {
      // Initially option2
      expect(optionControl.$display.textContent).toBe('option2');
      
      // Change to option3
      testObj.selectedOption = 'option3';
      optionControl.update();
      
      // Display should update
      expect(optionControl.$display.textContent).toBe('option3');
    });

    it('should handle values not in the options list', () => {
      // Set value not in options
      testObj.selectedOption = 'non-existent';
      optionControl.update();
      
      // Selected index should be -1
      expect(optionControl.$select.selectedIndex).toBe(-1);
      
      // Display should show the actual value
      expect(optionControl.$display.textContent).toBe('non-existent');
    });

    it('should return the instance for chaining', () => {
      const result = optionControl.update();
      expect(result).toBe(optionControl);
    });

    it('should work correctly with object options', () => {
      // Create with object options
      const objOptionControl = new OptionControl(
        mockParent,
        { selectedOption: 'value2' },
        'selectedOption',
        objectOptions
      );
      
      // Check initial state
      expect(objOptionControl.$select.selectedIndex).toBe(1); // key2 is at index 1
      expect(objOptionControl.$display.textContent).toBe('key2');
      
      // Change to value3
      objOptionControl.getValue = jest.fn().mockReturnValue('value3');
      objOptionControl.update();
      
      // Should update to key3
      expect(objOptionControl.$select.selectedIndex).toBe(2);
      expect(objOptionControl.$display.textContent).toBe('key3');
    });
  });

  describe('event handling', () => {
    beforeEach(() => {
      optionControl = new OptionControl(mockParent, testObj, 'selectedOption', arrayOptions);
    });

    it('should update the value and call _callOnFinishChange when select changes', () => {
      // Spy on methods
      jest.spyOn(optionControl, 'setValue');
      jest.spyOn(optionControl, '_callOnFinishChange');
      
      // Change selected option
      optionControl.$select.selectedIndex = 2; // option3
      optionControl.$select.dispatchEvent(new Event('change'));
      
      // Should call setValue with option3
      expect(optionControl.setValue).toHaveBeenCalledWith('option3');
      expect(optionControl._callOnFinishChange).toHaveBeenCalled();
    });

    it('should add focus class to display when select is focused', () => {
      // Initially no focus class
      expect(optionControl.$display.classList.contains('focus')).toBe(false);
      
      // Focus the select
      optionControl.$select.dispatchEvent(new Event('focus'));
      
      // Should add focus class
      expect(optionControl.$display.classList.contains('focus')).toBe(true);
    });

    it('should remove focus class from display when select is blurred', () => {
      // Add focus class first
      optionControl.$display.classList.add('focus');
      
      // Blur the select
      optionControl.$select.dispatchEvent(new Event('blur'));
      
      // Should remove focus class
      expect(optionControl.$display.classList.contains('focus')).toBe(false);
    });
  });

  describe('interaction with base class', () => {
    beforeEach(() => {
      optionControl = new OptionControl(mockParent, testObj, 'selectedOption', arrayOptions);
    });

    it('should properly disable the component', () => {
      // In OptionControl, $elForDisable is not specifically set to $select,
      // so it defaults to $widget from BaseControl
      optionControl.disable();
      
      // The component should be visually disabled
      expect(optionControl.domElement.classList.contains('disabled')).toBe(true);
      
      // The widget should have the disabled attribute
      expect(optionControl.$widget.hasAttribute('disabled')).toBe(true);
    });
  });
}); 