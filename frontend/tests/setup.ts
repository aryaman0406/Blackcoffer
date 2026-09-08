import '@testing-library/jest-dom';

// Polyfill ResizeObserver & matchMedia for JSDOM / React Three Fiber / Recharts
if (typeof window !== 'undefined') {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = window.ResizeObserver || ResizeObserverMock;
  globalThis.ResizeObserver = globalThis.ResizeObserver || ResizeObserverMock;

  if (!window.matchMedia) {
    window.matchMedia = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  }
}
