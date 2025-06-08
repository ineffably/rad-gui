import { GUI } from '../src/gui';

// Mock the style injection to avoid polluting the test environment
jest.mock('../src/rad-gui.css', () => ({}));

describe('Nested Folders', () => {
  let gui: GUI;
  let container: HTMLDivElement;

  // Setup before each test
  beforeEach(() => {
    // Create a container for the GUI
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Create a new GUI instance
    gui = new GUI({ container });
  });

  // Cleanup after each test
  afterEach(() => {
    if (gui) {
      gui.destroy();
    }
    if (container.parentElement) {
      document.body.removeChild(container);
    }
  });

  it('should add a single level folder correctly', () => {
    // Create a folder
    const folder = gui.addFolder('Level 1');
    
    // Check if the folder is in the folders array
    expect(gui.folders).toContain(folder);
    
    // Check that the folder's parent is set correctly
    expect(folder.parent).toBe(gui);
    
    // Check title is set correctly
    expect(folder._title).toBe('Level 1');
    expect(folder.$title.textContent).toBe('Level 1');
    
    // Verify that the folder is properly added to the DOM
    // This was one of the issues we fixed - folders not being added to the parent's $children
    expect(gui.$children.contains(folder.domElement)).toBe(true);
  });

  it('should add a two-level nested folder correctly', () => {
    // Create two levels of folders
    const level1 = gui.addFolder('Level 1');
    const level2 = level1.addFolder('Level 2');
    
    // Check if the folders are in the folders arrays
    expect(gui.folders).toContain(level1);
    expect(level1.folders).toContain(level2);
    
    // Check parent relationships
    expect(level1.parent).toBe(gui);
    expect(level2.parent).toBe(level1);
    
    // Check titles
    expect(level1._title).toBe('Level 1');
    expect(level2._title).toBe('Level 2');
    
    // Verify that the DOM structure is properly nested
    // Level 1 should be in gui's children
    expect(gui.$children.contains(level1.domElement)).toBe(true);
    // Level 2 should be in level1's children
    expect(level1.$children.contains(level2.domElement)).toBe(true);
  });

  it('should support deeply nested folders (5 levels)', () => {
    // Create deeply nested folders
    const level1 = gui.addFolder('Level 1');
    const level2 = level1.addFolder('Level 2');
    const level3 = level2.addFolder('Level 3');
    const level4 = level3.addFolder('Level 4');
    const level5 = level4.addFolder('Level 5');
    
    // Verify they are correctly added to the folders arrays
    expect(gui.folders).toContain(level1);
    expect(level1.folders).toContain(level2);
    expect(level2.folders).toContain(level3);
    expect(level3.folders).toContain(level4);
    expect(level4.folders).toContain(level5);
    
    // Verify they have the correct parent relationships
    expect(level1.parent).toBe(gui);
    expect(level2.parent).toBe(level1);
    expect(level3.parent).toBe(level2);
    expect(level4.parent).toBe(level3);
    expect(level5.parent).toBe(level4);
    
    // Check titles from deepest to root
    expect(level5._title).toBe('Level 5');
    expect(level4._title).toBe('Level 4');
    expect(level3._title).toBe('Level 3');
    expect(level2._title).toBe('Level 2');
    expect(level1._title).toBe('Level 1');
    
    // Verify that the DOM structure is properly nested for all levels
    expect(gui.$children.contains(level1.domElement)).toBe(true);
    expect(level1.$children.contains(level2.domElement)).toBe(true);
    expect(level2.$children.contains(level3.domElement)).toBe(true);
    expect(level3.$children.contains(level4.domElement)).toBe(true);
    expect(level4.$children.contains(level5.domElement)).toBe(true);
  });

  it('should allow adding controllers to deeply nested folders', () => {
    // Create a test object
    const testObj = { value: 50 };
    
    // Create deeply nested folders
    const level1 = gui.addFolder('Level 1');
    const level2 = level1.addFolder('Level 2');
    const level3 = level2.addFolder('Level 3');
    
    // Add a controller to the deepest folder
    const controller = level3.add(testObj, 'value', 0, 100, 1);
    
    // Verify the controller was added to the correct folder
    expect(level3.controllers).toContain(controller);
    expect(controller.parent).toBe(level3);
    
    // Verify the controller appears in the DOM under the correct folder
    expect(level3.$children.contains(controller.domElement)).toBe(true);
  });

  it('should properly close/open nested folders', () => {
    // Create nested folders
    const level1 = gui.addFolder('Level 1');
    const level2 = level1.addFolder('Level 2');
    
    // Initially both folders should be open
    expect(level1._closed).toBe(false);
    expect(level2._closed).toBe(false);
    
    // Close level1
    level1.close();
    
    expect(level1._closed).toBe(true);
    expect(level1.domElement.classList.contains('closed')).toBe(true);
    
    // Level 2 should still be open, but since parent is closed, it's not visible
    expect(level2._closed).toBe(false);
    
    // Open level1 again
    level1.open();
    
    expect(level1._closed).toBe(false);
    expect(level1.domElement.classList.contains('closed')).toBe(false);
    
    // Level 2 should still be open
    expect(level2._closed).toBe(false);
  });

  it('should properly collect all nested folders with foldersRecursive', () => {
    // Create nested folders
    const level1 = gui.addFolder('Level 1');
    const level2a = level1.addFolder('Level 2A');
    const level2b = level1.addFolder('Level 2B');
    const level3 = level2a.addFolder('Level 3');
    
    // Get all folders recursively from the root GUI
    const allFolders = gui.foldersRecursive();
    
    // Check if each folder is included exactly once in the result
    const folderTitles = allFolders.map(f => (f as GUI)._title);
    const uniqueTitles = [...new Set(folderTitles)];
    
    // Verify all folders are included
    expect(uniqueTitles).toContain('Level 1');
    expect(uniqueTitles).toContain('Level 2A');
    expect(uniqueTitles).toContain('Level 2B');
    expect(uniqueTitles).toContain('Level 3');
    
    // Verify that the deepest level is included (fixes the missing Level 3 issue)
    expect(allFolders).toContain(level3);
    
    // Verify the recursive relationship
    expect(gui.foldersRecursive()).toContain(level1);
    expect(gui.foldersRecursive()).toContain(level2a);
    expect(gui.foldersRecursive()).toContain(level2b);
    expect(gui.foldersRecursive()).toContain(level3);
    
    // The folders should not have duplicates (each folder should only appear once)
    // We fixed this issue in the implementation
    const countLevel1 = folderTitles.filter(title => title === 'Level 1').length;
    const countLevel2A = folderTitles.filter(title => title === 'Level 2A').length;
    const countLevel2B = folderTitles.filter(title => title === 'Level 2B').length;
    const countLevel3 = folderTitles.filter(title => title === 'Level 3').length;
    
    expect(countLevel1).toBe(1);
    expect(countLevel2A).toBe(1);
    expect(countLevel2B).toBe(1);
    expect(countLevel3).toBe(1);
    
    // Total count should match the number of folders we created
    expect(allFolders.length).toBe(4);
  });
}); 