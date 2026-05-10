/**
 * Re-export del SDK por modularidad
 */
import type { Character } from 'rickmortyapi';

export type CharacterStatus = Character['status']; // 'Dead' | 'Alive' | 'unknown'

export type {
  Character,
  CharacterLocation,
  CharacterFilter,
  ApiResponse,
  Info,
} from 'rickmortyapi';
