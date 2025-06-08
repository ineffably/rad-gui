import { GUI } from '../../src/gui';

describe('TypeScript Basic Usage Tests', () => {
  let gui: GUI;
  let config: {
    numberValue: number;
    booleanValue: boolean;
    stringValue: string;
    functionValue: () => void;
    optionValue: string;
  };

  beforeEach(() => {
    gui = new GUI({ autoPlace: false });
    config = {
      numberValue: 10,
      booleanValue: true,
      stringValue: 'hello',
      functionValue: () => console.log('test'),
      optionValue: 'option1'
    };
  });

  afterEach(() => {
    gui.destroy();
  });

  describe('add() method overloads', () => {
    test('should work with 2 parameters (object, property)', () => {
      // These should compile without TypeScript errors after fix
      const numberController = gui.add(config, 'numberValue');
      expect(numberController).toBeDefined();

      const booleanController = gui.add(config, 'booleanValue');
      expect(booleanController).toBeDefined();

      const stringController = gui.add(config, 'stringValue');
      expect(stringController).toBeDefined();

      const functionController = gui.add(config, 'functionValue');
      expect(functionController).toBeDefined();
    });

    test('should work with 3 parameters for options (object, property, options)', () => {
      // Array options
      const controller1 = gui.add(config, 'optionValue', ['option1', 'option2', 'option3']);
      expect(controller1).toBeDefined();

      // Object options
      const controller2 = gui.add(config, 'optionValue', {
        'Option 1': 'option1',
        'Option 2': 'option2',
        'Option 3': 'option3'
      });
      expect(controller2).toBeDefined();
    });

    test('should work with 4 parameters (object, property, min, max)', () => {
      const controller = gui.add(config, 'numberValue', 0, 100);
      expect(controller).toBeDefined();
    });

    test('should work with 5 parameters (object, property, min, max, step)', () => {
      const controller = gui.add(config, 'numberValue', 0, 100, 1);
      expect(controller).toBeDefined();
    });
  });

  describe('problematic patterns from review', () => {
    test('should NOT accept 6 parameters (with callback)', () => {
      // This pattern should be rejected by TypeScript
      // @ts-expect-error - This should fail TypeScript compilation
      const controller = gui.add(config, 'numberValue', 0, 100, 1, (value: number) => {
        console.log('callback:', value);
      });
    });

    test('should work with method chaining for callbacks', () => {
      // This is the correct pattern that should work
      const controller = gui.add(config, 'numberValue', 0, 100, 1)
        .onChange((value: number) => {
          console.log('Value changed:', value);
        });
      
      expect(controller).toBeDefined();
    });
  });

  describe('folder usage', () => {
    test('should work with folders', () => {
      const folder = gui.addFolder('Test Folder');
      
      const controller1 = folder.add(config, 'numberValue');
      const controller2 = folder.add(config, 'numberValue', 0, 100);
      const controller3 = folder.add(config, 'numberValue', 0, 100, 1);
      
      expect(controller1).toBeDefined();
      expect(controller2).toBeDefined();
      expect(controller3).toBeDefined();
    });
  });

  describe('type safety', () => {
    test('should provide proper type safety for property names', () => {
      // Valid property names should work
      gui.add(config, 'numberValue');
      gui.add(config, 'booleanValue');
      gui.add(config, 'stringValue');
      
      // Invalid property names should fail TypeScript compilation
      // @ts-expect-error - Property doesn't exist
      gui.add(config, 'nonExistentProperty');
    });

    test('should return correct controller types', () => {
      const numberController = gui.add(config, 'numberValue', 0, 100);
      const booleanController = gui.add(config, 'booleanValue');
      const stringController = gui.add(config, 'stringValue');
      const functionController = gui.add(config, 'functionValue');
      const optionController = gui.add(config, 'optionValue', ['a', 'b', 'c']);
      
      // These should have appropriate methods available
      expect(typeof numberController.min).toBe('function');
      expect(typeof numberController.max).toBe('function');
      expect(typeof numberController.step).toBe('function');
      
      expect(typeof booleanController.onChange).toBe('function');
      expect(typeof stringController.onChange).toBe('function');
      expect(typeof functionController.onChange).toBe('function');
      expect(typeof optionController.options).toBe('function');
    });
  });
}); 