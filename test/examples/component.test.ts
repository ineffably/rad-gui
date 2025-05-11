import { el } from '../../src/utils/el';
import { createTestContainer, removeTestContainer, fireClick } from '../utils/dom';

/**
 * Example component: A simple counter
 */
function createCounter() {
  let count = 0;
  
  const updateCount = (newCount: number) => {
    count = newCount;
    countDisplay.textContent = count.toString();
  };
  
  const countDisplay = el('span', { 
    textContent: count.toString(),
    classList: ['count-display']
  });
  
  const incrementButton = el('button', { 
    textContent: '+',
    classList: ['increment']
  });
  
  const decrementButton = el('button', { 
    textContent: '-',
    classList: ['decrement']
  });
  
  incrementButton.addEventListener('click', () => updateCount(count + 1));
  decrementButton.addEventListener('click', () => updateCount(count - 1));
  
  const container = el('div', {
    classList: ['counter-container'],
    children: [
      decrementButton,
      countDisplay,
      incrementButton
    ]
  });
  
  return container;
}

describe('Counter Component', () => {
  let container: HTMLElement;
  let counterComponent: HTMLElement;
  
  beforeEach(() => {
    container = createTestContainer();
    counterComponent = createCounter();
    container.appendChild(counterComponent);
  });
  
  afterEach(() => {
    removeTestContainer(container);
  });
  
  test('should render with initial count of 0', () => {
    const countDisplay = counterComponent.querySelector('.count-display');
    expect(countDisplay?.textContent).toBe('0');
  });
  
  test('should increment count when + button is clicked', () => {
    const incrementButton = counterComponent.querySelector('.increment') as HTMLElement;
    const countDisplay = counterComponent.querySelector('.count-display');
    
    fireClick(incrementButton);
    expect(countDisplay?.textContent).toBe('1');
    
    fireClick(incrementButton);
    expect(countDisplay?.textContent).toBe('2');
  });
  
  test('should decrement count when - button is clicked', () => {
    const decrementButton = counterComponent.querySelector('.decrement') as HTMLElement;
    const incrementButton = counterComponent.querySelector('.increment') as HTMLElement;
    const countDisplay = counterComponent.querySelector('.count-display');
    
    // First increment to 2
    fireClick(incrementButton);
    fireClick(incrementButton);
    expect(countDisplay?.textContent).toBe('2');
    
    // Then decrement
    fireClick(decrementButton);
    expect(countDisplay?.textContent).toBe('1');
  });
}); 