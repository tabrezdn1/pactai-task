import '@testing-library/jest-dom';

// Mock scrollTo which is not implemented in JSDOM
Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
  configurable: true,
  value: () => {},
}); 