import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';

import { charactersApi } from '@/features/characters';
import { favoritesApi } from '@/features/favorites';

export function renderWithStore(
  ui: React.ReactElement,
  options?: RenderOptions,
) {
  const store = configureStore({
    reducer: {
      [charactersApi.reducerPath]: charactersApi.reducer,
      [favoritesApi.reducerPath]: favoritesApi.reducer,
    },
    middleware: (gdm) =>
      gdm().concat(charactersApi.middleware, favoritesApi.middleware),
  });
  setupListeners(store.dispatch);
  return render(<Provider store={store}>{ui}</Provider>, options);
}
