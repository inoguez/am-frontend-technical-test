import { useOptimistic, useTransition } from 'react';

import {
  useAddFavoriteMutation,
  useGetFavoritesQuery,
  useRemoveFavoriteMutation,
} from '@/features/favorites/api/favoritesApi';
import type { Favorite } from '@/features/favorites/types';

type Action =
  | { type: 'add'; favorite: Favorite }
  | { type: 'remove'; id: number };

/**
 * Public API del módulo favorites. Los componentes nunca deben tocar
 * RTK Query ni Redux directamente, todo pasa por este hook.
 *
 * Estrategia de optimismo: `useOptimistic` (React 19) maneja la UI
 * instantánea; RTK Query maneja round-trip + invalidación. Si las
 * mutaciones fallan, RTK Query no actualiza su cache y el optimista
 * "se desinfla" automáticamente al siguiente render.
 */
export function useFavorites() {
  const { data: favorites = [], isLoading, error } = useGetFavoritesQuery();
  const [add] = useAddFavoriteMutation();
  const [remove] = useRemoveFavoriteMutation();
  const [, startTransition] = useTransition();

  /** Delega actualización optimista de la ui al hook de react 19 */
  const [optimistic, applyOptimistic] = useOptimistic(
    favorites,
    (state: Favorite[], action: Action): Favorite[] => {
      if (action.type === 'add') return [...state, action.favorite];
      return state.filter((f) => f.id !== action.id);
    },
  );

  const isFavorite = (id: number) => optimistic.some((f) => f.id === id);

  const toggle = (favorite: Favorite) => {
    /**
     * startTransition es requerido por useOptimistic
     * debe ocurrir dentro de una transition para que React lo asocie con la mutación async correspondiente.
     */
    startTransition(async () => {
      if (isFavorite(favorite.id)) {
        applyOptimistic({ type: 'remove', id: favorite.id });
        await remove(favorite.id)
          .unwrap()
          .catch(() => {});
      } else {
        applyOptimistic({ type: 'add', favorite });
        await add(favorite)
          .unwrap()
          .catch(() => {});
      }
    });
  };

  return { favorites: optimistic, isFavorite, toggle, isLoading, error };
}
