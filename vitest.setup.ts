import '@testing-library/jest-dom/vitest';

// jsdom does not implement ResizeObserver — provide a no-op stub for tests
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
