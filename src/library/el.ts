/**
 * Defines a tuple type for event handlers.
 * The first element is the event listener function, and the second (optional) element
 * is the options object passed to addEventListener.
 */
type EventHandler = [
  listener: (event: Event) => void, 
  options?: AddEventListenerOptions
];

const _specialProps = ['classList', 'children', 'eventHandlers'];

/**
 * Creates an HTML element with the specified tag name, properties, event handlers.
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
 *   - classList: An array of strings representing CSS classes to add to the element
 *   - children: An array of child HTML elements to append to the created element
 * @param eventHandlers An object mapping event names (e.g., 'click', 'input', 'submit') to EventHandler tuples.
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
 *   { 
 *     id: 'submit-btn', 
 *     textContent: 'Submit',
 *     classList: ['btn', 'btn-primary']
 *   },
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
 *   { 
 *     id: 'contact-form',
 *     classList: ['form-container'],
 *     children: [
 *       el('input', { 
 *         type: 'text',
 *         name: 'username',
 *         placeholder: 'Enter username',
 *         required: true
 *       }),
 *       el('button', { type: 'submit', textContent: 'Send' })
 *     ]
 *   },
 *   {
 *     submit: [(event) => {
 *       event.preventDefault();
 *       console.log('Form submitted!');
 *     }]
 *   }
 * );
 */
export const el = <T extends keyof HTMLElementTagNameMap>(
  tagName: T,
  props: Record<string, any> = {},
  eventHandlers: Record<string, EventHandler> = {}
) => {
  const element = document.createElement(tagName) as HTMLElementTagNameMap[T];

  // Handle regular properties
  Object.entries(props)
    .filter(([key]) => !_specialProps.includes(key))
    .forEach(([key, value]) => element[key] = value as any);

  // Add classes if provided
  if (Array.isArray(props?.classList)) {
    props.classList.filter(Boolean).forEach(cls => element.classList.add(cls));
  }
  
  // Add event handlers
  Object.entries(eventHandlers).forEach(([eventName, [listener, options]]) =>
    element.addEventListener(eventName, listener, options || {})
  );

  // Append children if provided
  if (Array.isArray(props?.children)) {
    props.children.forEach(child => element.appendChild(child));
  }

  return element;
}
