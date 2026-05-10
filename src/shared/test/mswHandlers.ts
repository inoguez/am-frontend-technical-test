import { http, HttpResponse } from 'msw';
import type { Character } from 'rickmortyapi';

const rick: Character = {
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: { name: 'Earth', url: '' },
  location: { name: 'Earth', url: '' },
  image: 'rick.png',
  episode: [],
  url: 'https://rickandmortyapi.com/api/character/1',
  created: '2017-11-04T18:48:46.250Z',
};

export const handlers = [
  http.get('https://rickandmortyapi.com/api/character', () =>
    HttpResponse.json({
      info: { count: 1, pages: 1, next: null, prev: null },
      results: [rick],
    }),
  ),
  http.get('https://rickandmortyapi.com/api/character/:id', () =>
    HttpResponse.json(rick),
  ),
  http.get('http://localhost:3001/favorites', () => HttpResponse.json([])),
  http.post('http://localhost:3001/favorites', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: 'srv-1', ...body });
  }),
  http.delete(
    'http://localhost:3001/favorites/:id',
    () => new HttpResponse(null, { status: 200 }),
  ),
];
