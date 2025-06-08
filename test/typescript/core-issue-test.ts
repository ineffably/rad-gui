import { GUI } from '../../src/gui';

// Test the core issues from the review
const gui = new GUI({ autoPlace: false });
const config = {
  numberValue: 10,
  booleanValue: true,
  stringValue: 'hello',
  optionValue: 'option1'
};

// Test cases that should now work (these were the main issues)

// ✅ Basic usage - these should work now
const test1 = gui.add(config, 'numberValue');
const test2 = gui.add(config, 'booleanValue');  
const test3 = gui.add(config, 'stringValue');

// ✅ Number with min/max - should work now
const test4 = gui.add(config, 'numberValue', 0, 100);

// ✅ Number with min/max/step - should work now  
const test5 = gui.add(config, 'numberValue', 0, 100, 1);

// ✅ Options array - should work now
const test6 = gui.add(config, 'optionValue', ['option1', 'option2', 'option3']);

// ✅ Options object - should work now
const test7 = gui.add(config, 'optionValue', {
  'Option 1': 'option1',
  'Option 2': 'option2',
  'Option 3': 'option3'
});

// ✅ Method chaining should work
const test8 = gui.add(config, 'numberValue', 0, 100, 1).onChange((value: number) => {
  console.log('Value:', value);
});

// ✅ Folder usage should work
const folder = gui.addFolder('Test');
const test9 = folder.add(config, 'numberValue');
const test10 = folder.add(config, 'numberValue', 0, 100);
const test11 = folder.add(config, 'numberValue', 0, 100, 1);

// Validate that @ts-expect-error cases still fail
// @ts-expect-error - This should still fail (6 parameters)
const shouldFail1 = gui.add(config, 'numberValue', 0, 100, 1, () => {});

// @ts-expect-error - This should still fail (invalid property)
const shouldFail2 = gui.add(config, 'nonExistentProperty');

console.log('Core issue test completed - if this compiles, the main issues are fixed!'); 