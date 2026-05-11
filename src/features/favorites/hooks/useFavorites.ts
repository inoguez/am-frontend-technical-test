import { useOptimistic, useTransition } from 'react';

import { useOwnerId } from '@/shared/hooks/useOwnerId';

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

/** Cupo máximo de favoritos por usuario (regla de negocio del Figma). */
export const FAVORITES_LIMIT = 4;

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
 *
 * Límite de 4 favoritos: se aplica acá (capa de dominio) y no en los
 * componentes, así cualquier consumidor presente o futuro respeta la
 * regla sin poder eludirla.
 */
export const useFavorites = () => {
  const ownerId = useOwnerId();
  const {
    data: favorites = [],
    isLoading,
    error,
  } = useGetFavoritesQuery(ownerId ?? '', { skip: !ownerId });
  const [addMutation] = useAddFavoriteMutation();
  const [removeMutation] = useRemoveFavoriteMutation();
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

  const isFull = optimistic.length >= FAVORITES_LIMIT;

  const remove = (characterId: number) => {
    if (!ownerId) return;
    const existing = optimistic.find((f) => f.characterId === characterId);
    if (!existing) return;

    startTransition(async () => {
      applyOptimistic({ type: 'remove', recordId: existing.id });
      await removeMutation(existing.id)
        .unwrap()
        .catch(() => {});
    });
  };

  const add = (character: Character) => {
    if (!ownerId || isFull) return;
    if (isFavorite(character.id)) return;

    startTransition(async () => {
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
      await addMutation({ ownerId, characterId: character.id, character })
        .unwrap()
        .catch(() => {});
    });
  };

  const toggle = (character: Character) => {
    if (isFavorite(character.id)) {
      remove(character.id);
    } else {
      add(character);
    }
  };

  return {
    favorites: optimistic,
    isFavorite,
    isFull,
    toggle,
    add,
    remove,
    isLoading,
    error,
  };
};
