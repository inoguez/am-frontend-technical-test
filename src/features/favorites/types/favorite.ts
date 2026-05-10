import type { Character } from '@/features/characters';

/**
 * Record de favoritos persistido en json-server.
 */
export type Favorite = {
  id: string;
  ownerId: string;
  characterId: number;
  character: Character;
};

export type NewFavorite = Omit<Favorite, 'id'>;
