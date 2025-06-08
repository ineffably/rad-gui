/**
 * DOM testing utilities
 */

/**
 * Simulates a click event on an element
 */
export function fireClick(element: HTMLElement): void {
  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  element.dispatchEvent(clickEvent);
}

/**
 * Simulates an input event on an input element
 */
export function fireInput(element: HTMLInputElement, value: string): void {
  element.value = value;
  const inputEvent = new Event('input', {
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(inputEvent);
}

/**
 * Creates a DOM container for tests and adds it to the document body
 */
export function createTestContainer(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);
  return container;
}

/**
 * Removes a test container from the document
 */
export function removeTestContainer(container: HTMLElement): void {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
} 