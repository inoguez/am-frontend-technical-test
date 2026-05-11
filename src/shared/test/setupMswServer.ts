import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { handlers } from './mswHandlers';

/**
 * Inicia un servidor MSW con los handlers por defecto y engancha el
 * ciclo de vida estándar de Vitest. Devuelve el server para que cada
 * test pueda hacer `server.use(...)` y sobreescribir respuestas.
 */
export const setupMswServer = () => {
  const server = setupServer(...handlers);
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  return server;
};
