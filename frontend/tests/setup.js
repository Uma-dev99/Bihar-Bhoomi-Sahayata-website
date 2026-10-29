import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  window.localStorage.clear();
  window.scrollTo = vi.fn();
  document.documentElement.lang = '';
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
