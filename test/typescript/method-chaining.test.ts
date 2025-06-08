import { GUI } from '../../src/gui';

describe('TypeScript Method Chaining Tests', () => {
  let gui: GUI;
  let config: {
    numberValue: number;
    booleanValue: boolean;
    stringValue: string;
    colorValue: string;
    optionValue: string;
  };

  beforeEach(() => {
    gui = new GUI({ autoPlace: false });
    config = {
      numberValue: 10,
      booleanValue: true,
      stringValue: 'hello',
      colorValue: '#ff0000',
      optionValue: 'option1'
    };
  });

  afterEach(() => {
    gui.destroy();
  });

  describe('Number control chaining', () => {
    test('should support min/max/step chaining', () => {
      // Use the specific overload that returns NumberControl
      const controller = gui.add(config, 'numberValue', 0, 100)
        .step(0.1);
      
      expect(controller).toBeDefined();
    });

    test('should support decimals chaining', () => {
      // Use the specific overload that returns NumberControl
      const controller = gui.add(config, 'numberValue', 0, 100)
        .step(0.01)
        .decimals(2);
      
      expect(controller).toBeDefined();
    });

    test('should support onChange chaining', () => {
      const controller = gui.add(config, 'numberValue', 0, 100)
        .onChange((value: number) => {
          console.log('Value changed:', value);
        });
      
      expect(controller).toBeDefined();
    });

    test('should support onFinishChange chaining', () => {
      const controller = gui.add(config, 'numberValue', 0, 100)
        .onFinishChange((value: number) => {
          console.log('Value finished changing:', value);
        });
      
      expect(controller).toBeDefined();
    });

    test('should support combined chaining', () => {
      // Use the specific overload that returns NumberControl
      const controller = gui.add(config, 'numberValue', 0, 100, 1)
        .decimals(0)
        .onChange((value: number) => {
          console.log('Changed:', value);
        })
        .onFinishChange((value: number) => {
          console.log('Finished:', value);
        });
      
      expect(controller).toBeDefined();
    });
  });

  describe('Boolean control chaining', () => {
    test('should support onChange chaining', () => {
      const controller = gui.add(config, 'booleanValue')
        .onChange((value: boolean) => {
          console.log('Boolean changed:', value);
        });
      
      expect(controller).toBeDefined();
    });

    test('should support name chaining', () => {
      const controller = gui.add(config, 'booleanValue')
        .name('Custom Boolean Name')
        .onChange((value: boolean) => {
          console.log('Named boolean:', value);
        });
      
      expect(controller).toBeDefined();
    });
  });

  describe('String control chaining', () => {
    test('should support onChange chaining', () => {
      const controller = gui.add(config, 'stringValue')
        .onChange((value: string) => {
          console.log('String changed:', value);
        });
      
      expect(controller).toBeDefined();
    });
  });

  describe('Option control chaining', () => {
    test('should support options modification', () => {
      const controller = gui.add(config, 'optionValue', ['option1', 'option2'])
        .options(['new1', 'new2', 'new3'])
        .onChange((value: string) => {
          console.log('Option changed:', value);
        });
      
      expect(controller).toBeDefined();
    });
  });

  describe('Color control chaining', () => {
    test('should support color control chaining', () => {
      const controller = gui.addColor(config, 'colorValue')
        .onChange((value: string) => {
          console.log('Color changed:', value);
        });
      
      expect(controller).toBeDefined();
    });
  });

  describe('Control state chaining', () => {
    test('should support enable/disable chaining', () => {
      const controller = gui.add(config, 'numberValue', 0, 100)
        .disable()
        .enable()
        .onChange((value: number) => {
          console.log('Value:', value);
        });
      
      expect(controller).toBeDefined();
    });

    test('should support show/hide chaining', () => {
      const controller = gui.add(config, 'numberValue', 0, 100)
        .hide()
        .show()
        .onChange((value: number) => {
          console.log('Value:', value);
        });
      
      expect(controller).toBeDefined();
    });

    test('should support listen chaining', () => {
      const controller = gui.add(config, 'numberValue', 0, 100)
        .listen()
        .onChange((value: number) => {
          console.log('Value:', value);
        });
      
      expect(controller).toBeDefined();
    });
  });

  describe('Complex chaining scenarios', () => {
    test('should handle dat.gui style complex chaining', () => {
      // This mimics the patterns commonly used in dat.gui examples
      const folder = gui.addFolder('Settings');
      
      const speedController = folder.add(config, 'numberValue', 0, 10)
        .name('Animation Speed')
        .step(0.1)
        .onChange((value: number) => {
          console.log('Speed changed:', value);
        });

      const enabledController = folder.add(config, 'booleanValue')
        .name('Enable Animation')
        .onChange((value: boolean) => {
          speedController.enable(value);
        });

      expect(speedController).toBeDefined();
      expect(enabledController).toBeDefined();
    });

    test('should support conditional chaining', () => {
      let controller = gui.add(config, 'numberValue', 0, 100);
      
      if (config.numberValue > 50) {
        controller = controller.step(10);
      } else {
        controller = controller.step(1);
      }
      
      controller = controller.onChange((value: number) => {
        console.log('Conditional value:', value);
      });

      expect(controller).toBeDefined();
    });
  });
}); 