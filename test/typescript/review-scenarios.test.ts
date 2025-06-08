import { GUI } from '../../src/gui';

/**
 * Tests that validate the specific scenarios mentioned in the rad-gui review
 * These tests should fail compilation before fixes and pass after fixes
 */
describe('Review Scenario Validation Tests', () => {
  let gui: GUI;
  let config: {
    property: number;
    booleanProp: boolean;
    selectedTile: string;
    gridSize: number;
  };

  beforeEach(() => {
    gui = new GUI({ autoPlace: false });
    config = {
      property: 10,
      booleanProp: true,
      selectedTile: 'tile1',
      gridSize: 20
    };
  });

  afterEach(() => {
    gui.destroy();
  });

  describe('Problematic patterns from review', () => {
    test('scenario: folder.add(config, property, min, max, step, callback)', () => {
      const folder = gui.addFolder('Test Folder');
      
      // This was the problematic pattern that failed with "Expected 5 arguments, but got 6"
      // @ts-expect-error - This should fail TypeScript compilation  
      const controller = folder.add(config, 'property', 0, 100, 1, (value: number) => {
        console.log('Callback value:', value);
      });
    });

    test('scenario: folder.add(config, booleanProp, false, true, 1, callback)', () => {
      const folder = gui.addFolder('Test Folder');
      
      // This was another problematic pattern from the review
      // @ts-expect-error - This should fail TypeScript compilation
      const controller = folder.add(config, 'booleanProp', false, true, 1, (value: boolean) => {
        console.log('Boolean callback:', value);
      });
    });

    test('scenario: tileFolder.add(config, selectedTile, options, undefined, undefined, callback)', () => {
      const tileFolder = gui.addFolder('Tile Placement');
      const options = { 'Tile 1': 'tile1', 'Tile 2': 'tile2', 'Tile 3': 'tile3' };
      
      // This was a complex problematic pattern from the review
      // @ts-expect-error - This should fail TypeScript compilation
      const controller = tileFolder.add(config, 'selectedTile', options, undefined, undefined, (value: string) => {
        console.log('Selected tile:', value);
      });
    });
  });

  describe('Correct patterns that should work', () => {
    test('basic add patterns', () => {
      // These should work without TypeScript errors after fix
      const controller1 = gui.add(config, 'property');
      const controller2 = gui.add(config, 'property', 0, 100);
      const controller3 = gui.add(config, 'property', 0, 100, 1);
      const controller4 = gui.add(config, 'booleanProp');
      
      expect(controller1).toBeDefined();
      expect(controller2).toBeDefined();
      expect(controller3).toBeDefined();
      expect(controller4).toBeDefined();
    });

    test('callback patterns with onChange', () => {
      // The correct pattern using method chaining
      const controller1 = gui.add(config, 'property', 0, 100, 1).onChange((value: number) => {
        console.log('Property changed:', value);
      });

      const controller2 = gui.add(config, 'booleanProp').onChange((value: boolean) => {
        console.log('Boolean changed:', value);
      });

      expect(controller1).toBeDefined();
      expect(controller2).toBeDefined();
    });

    test('option patterns', () => {
      // Array options
      const controller1 = gui.add(config, 'selectedTile', ['tile1', 'tile2', 'tile3']);
      
      // Object options
      const controller2 = gui.add(config, 'selectedTile', {
        'Tile 1': 'tile1',
        'Tile 2': 'tile2', 
        'Tile 3': 'tile3'
      });

      expect(controller1).toBeDefined();
      expect(controller2).toBeDefined();
    });
  });

  describe('Migration patterns', () => {
    test('dat.gui to rad-gui migration patterns', () => {
      // These should be the equivalent correct patterns for common dat.gui usage
      
      // Instead of: gui.add(obj, 'prop', min, max, step, callback)
      // Use: gui.add(obj, 'prop', min, max, step).onChange(callback)
      const migratedController = gui.add(config, 'gridSize', 5, 50).onChange((value: number) => {
        console.log('Grid size changed:', value);
      });

      expect(migratedController).toBeDefined();
    });

    test('complex folder migration', () => {
      const folder = gui.addFolder('Settings');
      
      // Complex chaining that should work
      const controller = folder.add(config, 'property', 0, 100)
        .step(1)
        .onChange((value: number) => {
          console.log('Value:', value);
        })
        .onFinishChange((value: number) => {
          console.log('Finished:', value);
        });

      expect(controller).toBeDefined();
    });
  });

  describe('Edge cases from review', () => {
    test('empty folder creation should work', () => {
      const infoFolder = gui.addFolder('Tile System');
      // Should be able to create folders without controls
      expect(infoFolder).toBeDefined();
    });

    test('remember functionality', () => {
      gui.add(config, 'property', 0, 100);
      gui.add(config, 'booleanProp');
      
      // Should work without errors
      gui.remember(config);
      
      const saveData = gui.save();
      expect(saveData).toBeDefined();
      expect(saveData.controllers).toBeDefined();
    });
  });
}); 