import type { Character } from 'rickmortyapi';

/**
 * Construye un `Character` con valores por defecto razonables, listo
 * para sobreescribir cualquier campo con `overrides`.
 */
export const buildCharacter = (
  overrides: Partial<Character> = {},
): Character => ({
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: { name: 'Earth', url: '' },
  location: { name: 'Earth', url: '' },
  image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  episode: [],
  url: 'https://rickandmortyapi.com/api/character/1',
  created: '2017-11-04T18:48:46.250Z',
  ...overrides,
});
