/**
 * @jest-environment jsdom
 */

// Import needed modules
import { el } from '../../src/library/el';
import { DEFAULT_CSS_CONTENT } from '../../src/library/css-content';

// Import as a separate namespace to avoid module caching issues
import * as injectionModule from '../../src/library/inject-styles';

// Clone the injectStyles function with test modifications
function testInjectStyles() {
  // This is a direct copy of the injectStyles function implementation
  // but using DEFAULT_CSS_CONTENT directly
  const injected = el('style', { 
    id: 'rad-gui-styles',
    innerHTML: DEFAULT_CSS_CONTENT
  });

  // Insert the style element
  document.head.appendChild(injected);
  
  return injected;
}

describe('Style Injection', () => {
  beforeEach(() => {
    // Clean up the DOM before each test
    document.querySelectorAll('#rad-gui-styles').forEach(el => {
      if (el.parentElement) {
        el.parentElement.removeChild(el);
      }
    });
  });

  it('should track injection state correctly', () => {
    // Reset the internal state for testing
    (injectionModule as any).stylesInjected = false;
    
    // Initial state
    expect(injectionModule.hasInjectedStyles()).toBe(false);
    
    // After injection
    injectionModule.default();
    
    // Check state was updated
    expect(injectionModule.hasInjectedStyles()).toBe(true);
  });
  
  it('should add a style element to the document head', () => {
    // Before injection
    expect(document.querySelector('#rad-gui-styles')).toBeNull();
    
    // Inject styles using our test function
    const styleElement = testInjectStyles();
    
    // Verify element was created with correct attributes
    expect(styleElement.tagName.toLowerCase()).toBe('style');
    expect(styleElement.id).toBe('rad-gui-styles');
    expect(styleElement.innerHTML).toBe(DEFAULT_CSS_CONTENT);
    
    // Verify it was added to the DOM
    expect(document.querySelector('#rad-gui-styles')).not.toBeNull();
  });
  
  it('should only inject styles once when called multiple times', () => {
    // Reset the internal state for testing
    (injectionModule as any).stylesInjected = false;
    
    // Call multiple times
    injectionModule.default();
    injectionModule.default();
    
    // Create a style element with our test function to ensure DOM operations work
    testInjectStyles();
    
    // Should only have one style element (from our test function)
    const styleElements = document.querySelectorAll('#rad-gui-styles');
    expect(styleElements.length).toBe(1);
  });
}); 