/**
 * Defines a tuple type for event handlers.
 * The first element is the event listener function, and the second (optional) element
 * is the options object passed to addEventListener.
 */
type EventHandler = [
  listener: (event: Event) => void, 
  options?: AddEventListenerOptions
];

/**
 * Creates an HTML element with the specified tag name, properties, classes, event handlers, and children.
 * This utility function provides a concise way to create and configure DOM elements
 * without lengthy chains of DOM API calls.
 *
 * @template T The specific HTML element type being created.
 * @param tagName The tag name of the HTML element to create (e.g., 'div', 'button', 'input').
 * @param props An object containing properties to set on the element. Common properties include:
 *   - id: The element's ID
 *   - textContent: Text content to set
 *   - value: For input elements
 *   - placeholder: For input elements
 *   - href: For anchor elements
 *   - src: For image elements
 *   - disabled: For form elements
 * @param classList An array of strings representing CSS classes to add to the element.
 * @param eventHandlers An object mapping event names (e.g., 'click', 'input', 'submit') to EventHandler tuples.
 * @param children An array of child HTML elements to append to the created element.
 * @returns The created HTML element with all properties, classes, event handlers, and children applied.
 *
 * @example
 * // Create a simple div
 * const simpleDiv = el('div');
 *
 * @example
 * // Create a button with an ID, classes, and a click handler
 * const myButton = el(
 *   'button',
 *   { id: 'submit-btn', textContent: 'Submit' },
 *   ['btn', 'btn-primary'],
 *   {
 *     click: [(event) => { console.log('Button clicked!', event); }],
 *     // With capture option
 *     focus: [(event) => { console.log('Button focused!'); }, { capture: true }]
 *   }
 * );
 *
 * @example
 * // Create a form with children and event handling
 * const form = el(
 *   'form',
 *   { id: 'contact-form' },
 *   ['form-container'],
 *   {
 *     submit: [(event) => {
 *       event.preventDefault();
 *       console.log('Form submitted!');
 *     }]
 *   },
 *   [
 *     el('input', { 
 *       type: 'text',
 *       name: 'username',
 *       placeholder: 'Enter username',
 *       required: true
 *     }),
 *     el('button', { type: 'submit', textContent: 'Send' })
 *   ]
 * );
 */
export const el = <T extends keyof HTMLElementTagNameMap>(
  tagName: T,
  props: Record<string, any> = {},
  classList: string[] = [],
  eventHandlers: Record<string, EventHandler> = {},
  children: HTMLElement[] = []
) => {
  const element = document.createElement(tagName) as HTMLElementTagNameMap[T];

  if(Array.isArray(classList)) {
    classList.filter(cls => cls).forEach(cls => element.classList.add(cls));
  }

  Object.entries(props).forEach(([key, value]) => element[key] = value as any);
  
  Object.entries(eventHandlers).forEach(([eventName, [listener, options]]) =>
    element.addEventListener(eventName, listener, options || {})
  );

  children.forEach(child => element.appendChild(child));

  return element;
}
