import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { charactersApi } from '@/features/characters';
import { favoritesApi } from '@/features/favorites';
/**
 * Store global
 *
 * Registra los slices de RTK Query que cada feature define como su public API. */
export const store = configureStore({
  reducer: {
    [charactersApi.reducerPath]: charactersApi.reducer,
    [favoritesApi.reducerPath]: favoritesApi.reducer,
  },
  middleware: (gdm) =>
    /** Agrega los middlewares de RTK Query SIN reemplazar los defaults */
    gdm().concat(charactersApi.middleware, favoritesApi.middleware),
});
/** Habilita refetchOnFocus / refetchOnReconnect en todos los endpoints */
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
