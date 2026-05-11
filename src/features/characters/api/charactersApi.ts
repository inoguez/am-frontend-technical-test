import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  getCharacter,
  getCharacters,
  type Character,
  type CharacterFilter,
  type Info,
} from 'rickmortyapi';

type CharactersList = Info<Character[]>;

export const charactersApi = createApi({
  reducerPath: 'charactersApi',
  /**
   * `fakeBaseQuery()` reemplaza `fetchBaseQuery` porque cada endpoint
   *  gestiona su request vía `queryFn`.
   */
  baseQuery: fakeBaseQuery(),
  endpoints: (build) => ({
    getCharacters: build.query<CharactersList, CharacterFilter>({
      queryFn: async (filter) => {
        const res = await getCharacters(filter);
        if (res.status >= 400) {
          return { error: { status: res.status, data: res.statusMessage } };
        }
        return { data: res.data };
      },
    }),
    getCharacterById: build.query<Character, number>({
      queryFn: async (id) => {
        const res = await getCharacter(id);
        if (res.status >= 400) {
          return { error: { status: res.status, data: res.statusMessage } };
        }
        return { data: res.data };
      },
    }),
  }),
});

export const {
  useGetCharactersQuery,
  useGetCharacterByIdQuery,
  usePrefetch,
} = charactersApi;
