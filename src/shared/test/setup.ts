import '@testing-library/jest-dom';

/**
 * favoritesApi lee `NEXT_PUBLIC_API_URL` al inicializarse. En tests no
 * hay Next, así que lo fijamos a la misma URL que usa el dev server.
 */
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';

/**
 * jsdom no implementa `matchMedia`. `useMediaQuery` lo usa, así que
 * exponemos un stub mínimo que siempre devuelve `matches: false`
 * (equivalente a viewport mobile en los tests).
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});
