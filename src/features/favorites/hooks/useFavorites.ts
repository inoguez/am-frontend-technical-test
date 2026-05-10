import { useOptimistic, useTransition } from 'react';

import { useOwnerId } from '@/shared/lib/useOwnerId';

import type { Character } from '@/features/characters';
import {
  useAddFavoriteMutation,
  useGetFavoritesQuery,
  useRemoveFavoriteMutation,
} from '@/features/favorites/api/favoritesApi';
import type { Favorite } from '@/features/favorites/types';

type Action =
  | { type: 'add'; favorite: Favorite }
  | { type: 'remove'; recordId: string };

/**
 * Public API del módulo favorites. Los componentes nunca deben tocar
 * RTK Query ni Redux directamente, todo pasa por este hook.
 *
 * Estrategia de optimismo: `useOptimistic` (React 19) maneja la UI
 * instantánea; RTK Query maneja round-trip + invalidación. Si las
 * mutaciones fallan, RTK Query no actualiza su cache y el optimista
 * "se desinfla" automáticamente al siguiente render.
 *
 * Aislamiento por usuario: cada browser tiene un ownerId (UUID en
 * localStorage) que se incluye en el GET y en cada POST. Mientras
 * ownerId aún no está disponible (SSR o primer paint), el query
 * se pausa con skip.
 */
export function useFavorites() {
  const ownerId = useOwnerId();
  const {
    data: favorites = [],
    isLoading,
    error,
  } = useGetFavoritesQuery(ownerId ?? '', { skip: !ownerId });
  const [add] = useAddFavoriteMutation();
  const [remove] = useRemoveFavoriteMutation();
  const [, startTransition] = useTransition();

  /** Delega actualización optimista de la ui al hook de react 19 */
  const [optimistic, applyOptimistic] = useOptimistic(
    favorites,
    (state: Favorite[], action: Action): Favorite[] => {
      if (action.type === 'add') return [...state, action.favorite];
      return state.filter((f) => f.id !== action.recordId);
    },
  );

  const isFavorite = (characterId: number) =>
    optimistic.some((f) => f.characterId === characterId);

  const toggle = (character: Character) => {
    if (!ownerId) return;

    const existing = optimistic.find((f) => f.characterId === character.id);

    /**
     * startTransition es requerido por useOptimistic
     * debe ocurrir dentro de una transition para que React lo asocie con la mutación async correspondiente.
     */
    startTransition(async () => {
      if (existing) {
        applyOptimistic({ type: 'remove', recordId: existing.id });
        await remove(existing.id)
          .unwrap()
          .catch(() => {});
      } else {
        /**
         * Para el optimista usamos un `id` provisional (`temp-...`).
         * RTK Query reemplazará esta entrada al invalidar el cache
         * con el record real devuelto por json-server.
         */
        const optimisticFavorite: Favorite = {
          id: `temp-${character.id}`,
          ownerId,
          characterId: character.id,
          character,
        };
        applyOptimistic({ type: 'add', favorite: optimisticFavorite });
        await add({ ownerId, characterId: character.id, character })
          .unwrap()
          .catch(() => {});
      }
    });
  };

  return { favorites: optimistic, isFavorite, toggle, isLoading, error };
}
