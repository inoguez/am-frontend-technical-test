import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { render, type RenderOptions } from '@testing-library/react';
import type { PropsWithChildren, ReactElement } from 'react';
import { Provider } from 'react-redux';

import { charactersApi } from '@/features/characters';
import { favoritesApi } from '@/features/favorites';

/**
 * Crea un store nuevo con los slices de RTK Query y devuelve un
 * `Wrapper` listo para `renderHook` además del store por si el test
 * necesita leer su estado.
 */
export const createStoreWrapper = () => {
  const store = configureStore({
    reducer: {
      [charactersApi.reducerPath]: charactersApi.reducer,
      [favoritesApi.reducerPath]: favoritesApi.reducer,
    },
    middleware: (gdm) =>
      gdm().concat(charactersApi.middleware, favoritesApi.middleware),
  });
  setupListeners(store.dispatch);

  const Wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );

  return { store, Wrapper };
};

export const renderWithStore = (ui: ReactElement, options?: RenderOptions) => {
  const { Wrapper, store } = createStoreWrapper();
  const result = render(<Wrapper>{ui}</Wrapper>, options);
  return { ...result, store };
};
