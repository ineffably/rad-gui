import '@testing-library/jest-dom';

// Global setup for all tests 

// Mock window.matchMedia for Jest environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Spy on console.error to verify error handling in all tests
const originalConsoleError = console.error;
console.error = jest.fn();

// Restore original console functions after all tests
afterAll(() => {
  console.error = originalConsoleError;
}); 