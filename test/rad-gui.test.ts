import { RadGUI } from '../src/gui';

describe('RadGUI', () => {
  let gui: RadGUI;
  let testObject: any;

  beforeEach(() => {
    // Setup DOM for testing
    document.body.innerHTML = '<div id="test-container"></div>';
    gui = new RadGUI({ autoPlace: false });
    testObject = {
      text: 'Hello',
      number: 42,
      boolean: true,
      color: '#ff0000',
      option: 'option1',
      action: jest.fn()
    };
  });

  afterEach(() => {
    gui.destroy();
  });

  describe('Constructor', () => {
    test('should create RadGUI instance that extends GUI', () => {
      expect(gui).toBeInstanceOf(RadGUI);
      expect(gui.domElement).toBeInstanceOf(HTMLElement);
      expect(gui.children).toEqual([]);
      expect(gui.controllers).toEqual([]);
      expect(gui.folders).toEqual([]);
    });

    test('should accept constructor options', () => {
      const customGui = new RadGUI({ 
        title: 'Custom GUI',
        width: 400,
        autoPlace: false 
      });
      
      expect(customGui._title).toBe('Custom GUI');
      expect(customGui.domElement.style.getPropertyValue('--width')).toBe('400px');
      
      customGui.destroy();
    });
  });

  describe('addButton', () => {
    test('should create a button control with callback', () => {
      const callback = jest.fn();
      const button = gui.addButton('Test Button', callback);
      
      expect(button).toBeDefined();
      expect(button.property).toBe('Test Button');
      expect(gui.controllers).toHaveLength(1);
      expect(gui.controllers[0]).toBe(button);
    });

    test('should execute callback when button is clicked', () => {
      const callback = jest.fn();
      const button = gui.addButton('Click Me', callback);
      
      // Simulate button click
      const buttonElement = button.domElement.querySelector('button');
      expect(buttonElement).not.toBeNull();
      
      buttonElement!.click();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should add button to DOM', () => {
      const button = gui.addButton('DOM Test', () => {});
      
      expect(gui.$children.contains(button.domElement)).toBe(true);
      expect(button.domElement.querySelector('.name')!.textContent).toBe('DOM Test');
    });
  });

  describe('addText', () => {
    test('should create a text control', () => {
      const textControl = gui.addText(testObject, 'text');
      
      expect(textControl).toBeDefined();
      expect(textControl.property).toBe('text');
      expect(gui.children).toHaveLength(1);
      expect(gui.children[0]).toBe(textControl);
    });

    test('should bind to object property', () => {
      const textControl = gui.addText(testObject, 'text');
      const input = textControl.domElement.querySelector('input') as HTMLInputElement;
      
      expect(input.value).toBe('Hello');
      
      // Update through control
      input.value = 'Updated';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      
      expect(testObject.text).toBe('Updated');
    });

    test('should add text control to DOM', () => {
      const textControl = gui.addText(testObject, 'text');
      
      expect(gui.$children.contains(textControl.domElement)).toBe(true);
      expect(textControl.domElement.querySelector('input')).not.toBeNull();
    });
  });

  describe('addNumber', () => {
    test('should create a number control with all parameters', () => {
      const numberControl = gui.addNumber(testObject, 'number', 0, 100, 1);
      
      expect(numberControl).toBeDefined();
      expect(numberControl.property).toBe('number');
      expect(numberControl._min).toBe(0);
      expect(numberControl._max).toBe(100);
      expect(numberControl._step).toBe(1);
      expect(gui.controllers).toHaveLength(1);
    });

    test('should create a simple number control without parameters', () => {
      const numberControl = gui.addNumber(testObject, 'number');
      
      expect(numberControl).toBeDefined();
      expect(numberControl.property).toBe('number');
      expect(numberControl._min).toBeUndefined();
      expect(numberControl._max).toBeUndefined();
      expect(numberControl._step).toBe(0.1); // Default step value
      expect(numberControl._hasSlider).toBe(false);
    });

    test('should create a number control with min and max only', () => {
      const numberControl = gui.addNumber(testObject, 'number', 0, 100);
      
      expect(numberControl).toBeDefined();
      expect(numberControl._min).toBe(0);
      expect(numberControl._max).toBe(100);
      expect(numberControl._step).toBe(0.1); // Default step value when not specified
      expect(numberControl._hasSlider).toBe(true);
    });

    test('should create slider when min/max provided', () => {
      const numberControl = gui.addNumber(testObject, 'number', 0, 100, 1);
      
      expect(numberControl._hasSlider).toBe(true);
      expect(numberControl.domElement.querySelector('.slider')).not.toBeNull();
    });

    test('should bind to object property', () => {
      const numberControl = gui.addNumber(testObject, 'number', 0, 100, 1);
      const input = numberControl.domElement.querySelector('input') as HTMLInputElement;
      
      expect(input.value).toBe('42');
      
      // Update through control
      numberControl.setValue(75);
      expect(testObject.number).toBe(75);
      expect(input.value).toBe('75');
    });

    test('should add number control to DOM', () => {
      const numberControl = gui.addNumber(testObject, 'number', 0, 100, 1);
      
      expect(gui.$children.contains(numberControl.domElement)).toBe(true);
      expect(numberControl.domElement.querySelector('input')).not.toBeNull();
    });
  });

  describe('addColor', () => {
    test('should create a color control', () => {
      const colorControl = gui.addColor(testObject, 'color');
      
      expect(colorControl).toBeDefined();
      expect(colorControl.property).toBe('color');
      expect(gui.children).toHaveLength(1);
    });

    test('should create color control with custom RGB scale', () => {
      const colorControl = gui.addColor(testObject, 'color', 255);
      
      expect(colorControl._rgbScale).toBe(255);
    });

    test('should bind to object property', () => {
      const colorControl = gui.addColor(testObject, 'color');
      const colorInput = colorControl.domElement.querySelector('input[type="color"]') as HTMLInputElement;
      
      expect(colorInput.value).toBe('#ff0000');
      
      // Update through control
      colorControl.setValue('#00ff00');
      expect(testObject.color).toBe('#00ff00');
    });

    test('should add color control to DOM', () => {
      const colorControl = gui.addColor(testObject, 'color');
      
      expect(gui.$children.contains(colorControl.domElement)).toBe(true);
      expect(colorControl.domElement.querySelector('input[type="color"]')).not.toBeNull();
      expect(colorControl.domElement.querySelector('.display')).not.toBeNull();
    });
  });

  describe('addToggle', () => {
    test('should create a toggle control', () => {
      const toggleControl = gui.addToggle(testObject, 'boolean');
      
      expect(toggleControl).toBeDefined();
      expect(toggleControl.property).toBe('boolean');
      expect(gui.controllers).toHaveLength(1);
    });

    test('should bind to object property', () => {
      const toggleControl = gui.addToggle(testObject, 'boolean');
      const input = toggleControl.domElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
      
      expect(input.checked).toBe(true);
      
      // Update through control
      toggleControl.setValue(false);
      expect(testObject.boolean).toBe(false);
      expect(input.checked).toBe(false);
    });

    test('should add toggle control to DOM', () => {
      const toggleControl = gui.addToggle(testObject, 'boolean');
      
      expect(gui.$children.contains(toggleControl.domElement)).toBe(true);
      expect(toggleControl.domElement.querySelector('input[type="checkbox"]')).not.toBeNull();
    });

    test('should support method chaining', () => {
      const toggleControl = gui.addToggle(testObject, 'boolean')
        .name('Enable Feature');
      
      expect(toggleControl.$name.textContent).toBe('Enable Feature');
    });

    test('should work with onChange callbacks', () => {
      const changeCallback = jest.fn();
      const toggleControl = gui.addToggle(testObject, 'boolean')
        .onChange(changeCallback);
      
      // Trigger change
      toggleControl.setValue(false);
      
      expect(changeCallback).toHaveBeenCalled();
    });
  });

  describe('addOption', () => {
    test('should create option control with array options', () => {
      const options = ['option1', 'option2', 'option3'];
      const optionControl = gui.addOption(testObject, 'option', options);
      
      expect(optionControl).toBeDefined();
      expect(optionControl.property).toBe('option');
      expect(gui.children).toHaveLength(1);
    });

    test('should create option control with object options', () => {
      const options = { 'First': 'option1', 'Second': 'option2' };
      const optionControl = gui.addOption(testObject, 'option', options);
      
      expect(optionControl).toBeDefined();
      expect(optionControl['_values']).toEqual(['option1', 'option2']);
      expect(optionControl['_names']).toEqual(['First', 'Second']);
    });

    test('should bind to object property', () => {
      const options = ['option1', 'option2', 'option3'];
      const optionControl = gui.addOption(testObject, 'option', options);
      const select = optionControl.domElement.querySelector('select') as HTMLSelectElement;
      
      expect(select.value).toBe('option1');
      expect(testObject.option).toBe('option1');
      
      // Update through control
      select.selectedIndex = 1;
      select.dispatchEvent(new Event('change'));
      
      expect(testObject.option).toBe('option2');
    });

    test('should add option control to DOM', () => {
      const options = ['option1', 'option2', 'option3'];
      const optionControl = gui.addOption(testObject, 'option', options);
      
      expect(gui.$children.contains(optionControl.domElement)).toBe(true);
      expect(optionControl.domElement.querySelector('select')).not.toBeNull();
      expect(optionControl.domElement.querySelector('.display')).not.toBeNull();
    });
  });

  describe('addFolder', () => {
    test('should create a folder (child GUI)', () => {
      const folder = gui.addFolder('Test Folder');
      
      expect(folder).toBeDefined();
      expect(folder._title).toBe('Test Folder');
      expect(folder.parent).toBe(gui);
      expect(gui.folders).toHaveLength(1);
      expect(gui.folders[0]).toBe(folder);
    });

    test('should add folder to DOM', () => {
      const folder = gui.addFolder('DOM Folder');
      
      expect(gui.$children.contains(folder.domElement)).toBe(true);
      expect(folder.domElement.querySelector('.title')!.textContent).toBe('DOM Folder');
    });

    test('should allow adding controls to folder', () => {
      const folder = gui.addFolder('Folder with Controls');
      const button = folder.addButton('Folder Button', () => {});
      
      expect(button).toBeDefined();
      expect(folder.controllers).toHaveLength(1);
    });
  });

  describe('remove', () => {
    test('should remove control from GUI', () => {
      const button = gui.addButton('Remove Me', () => {});
      
      expect(gui.children).toHaveLength(1);
      expect(gui.$children.contains(button.domElement)).toBe(true);
      
      gui.remove(button);
      
      expect(gui.children).toHaveLength(0);
      expect(gui.$children.contains(button.domElement)).toBe(false);
    });

    test('should handle removing non-existent control gracefully', () => {
      const button = gui.addButton('Test', () => {});
      gui.remove(button); // Remove once
      
      // Should not throw when removing again
      expect(() => gui.remove(button)).not.toThrow();
    });
  });

  describe('reset', () => {
    test('should reset all controls to initial values', () => {
      const button = gui.addButton('Reset Test', () => {});
      const textControl = gui.addText(testObject, 'text');
      const numberControl = gui.addNumber(testObject, 'number', 0, 100, 1);
      
      // Change values
      testObject.text = 'Changed';
      testObject.number = 99;
      
      // Reset
      gui.reset();
      
      expect(testObject.text).toBe('Hello'); // Back to initial
      expect(testObject.number).toBe(42);    // Back to initial
    });

    test('should reset recursively including folders', () => {
      const folder = gui.addFolder('Reset Folder');
      const textInFolder = folder.addText(testObject, 'text');
      const numberInMain = gui.addNumber(testObject, 'number', 0, 100, 1);
      
      // Change values
      testObject.text = 'Changed';
      testObject.number = 99;
      
      // Reset recursively
      gui.reset(true);
      
      expect(testObject.text).toBe('Hello');
      expect(testObject.number).toBe(42);
    });
  });

  describe('Method chaining and integration', () => {
    test('should support method chaining on returned controls', () => {
      const button = gui.addButton('Chain Test', () => {})
        .name('Custom Button Name');
      
      expect(button.$name.textContent).toBe('Custom Button Name');
    });

    test('should work with onChange callbacks', () => {
      const changeCallback = jest.fn();
      const textControl = gui.addText(testObject, 'text')
        .onChange(changeCallback);
      
      // Trigger change
      textControl.setValue('New Value');
      
      expect(changeCallback).toHaveBeenCalled();
      expect(testObject.text).toBe('New Value');
    });

    test('should work with onFinishChange callbacks', () => {
      const finishCallback = jest.fn();
      const numberControl = gui.addNumber(testObject, 'number', 0, 100, 1)
        .onFinishChange(finishCallback);
      
      // Trigger change and finish
      numberControl.setValue(75);
      numberControl._callOnFinishChange();
      
      expect(finishCallback).toHaveBeenCalled();
    });
  });

  describe('Type safety and TypeScript integration', () => {
    test('should maintain type safety for property access', () => {
      interface TypedObject {
        name: string;
        count: number;
        active: boolean;
      }

      const typedObj: TypedObject = {
        name: 'Test',
        count: 5,
        active: true
      };

      // These should compile without TypeScript errors
      const textControl = gui.addText(typedObj, 'name');
      const numberControl = gui.addNumber(typedObj, 'count', 0, 10, 1);
      
      expect(textControl.property).toBe('name');
      expect(numberControl.property).toBe('count');
    });
  });

  describe('Error handling', () => {
    test('should handle invalid property names gracefully', () => {
      expect(() => {
        gui.addText(testObject, 'nonExistentProperty' as any);
      }).not.toThrow();
    });

    test('should handle empty callback for button', () => {
      expect(() => {
        gui.addButton('Empty Button', undefined as any);
      }).not.toThrow();
    });
  });

  describe('DOM structure and styling', () => {
    test('should maintain proper DOM hierarchy', () => {
      const button = gui.addButton('DOM Test', () => {});
      const text = gui.addText(testObject, 'text');
      
      expect(gui.domElement.querySelector('.children')).toBe(gui.$children);
      expect(gui.$children.children).toHaveLength(2);
      expect(gui.$children.children[0]).toBe(button.domElement);
      expect(gui.$children.children[1]).toBe(text.domElement);
    });

    test('should apply proper CSS classes', () => {
      const button = gui.addButton('CSS Test', () => {});
      
      expect(button.domElement.classList.contains('controller')).toBe(true);
      expect(button.domElement.classList.contains('function')).toBe(true);
    });
  });
}); 