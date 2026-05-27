import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpa DOM entre testes pra isolar componentes
afterEach(() => {
  cleanup();
});

// matchMedia mock — JSDOM não implementa; useTheme + useNumberTicker usam.
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {}, // legacy
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});
