import { el } from '../src/utils/el';

describe('el function', () => {
  test('creates an HTML element with the specified tag name', () => {
    const div = el('div');
    expect(div.tagName).toBe('DIV');
  });

  test('sets properties on the element', () => {
    const input = el('input', { type: 'text', placeholder: 'Enter text' });
    expect(input.type).toBe('text');
    expect(input.placeholder).toBe('Enter text');
  });

  test('adds classes to the element', () => {
    const div = el('div', {}, ['class1', 'class2']);
    expect(div.classList.contains('class1')).toBe(true);
    expect(div.classList.contains('class2')).toBe(true);
  });

  test('adds event listeners to the element', () => {
    const clickHandler = jest.fn();
    const div = el('div', {}, [], { click: [clickHandler] });
    
    div.click();
    expect(clickHandler).toHaveBeenCalledTimes(1);
  });

  test('appends children to the element', () => {
    const child1 = el('span');
    const child2 = el('p');
    const div = el('div', {}, [], {}, [child1, child2]);
    
    expect(div.children.length).toBe(2);
    expect(div.children[0]).toBe(child1);
    expect(div.children[1]).toBe(child2);
  });

  test('creates a complete element with all options', () => {
    const clickHandler = jest.fn();
    const child = el('span', { textContent: 'Child' });
    
    const div = el(
      'div',
      { id: 'test-div', title: 'Test Div' },
      ['test-class'],
      { click: [clickHandler] },
      [child]
    );
    
    expect(div.tagName).toBe('DIV');
    expect(div.id).toBe('test-div');
    expect(div.title).toBe('Test Div');
    expect(div.classList.contains('test-class')).toBe(true);
    expect(div.children.length).toBe(1);
    expect(div.children[0]).toBe(child);
    
    div.click();
    expect(clickHandler).toHaveBeenCalledTimes(1);
  });
}); 