import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { Favorite, NewFavorite } from '@/features/favorites/types';

export const favoritesApi = createApi({
  reducerPath: 'favoritesApi',
  /** Base query apunta al json-server para manejar los favoritos*/
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL! }),
  tagTypes: ['Favorite'],
  endpoints: (build) => ({
    getFavorites: build.query<Favorite[], string>({
      query: (ownerId) => `/favorites?ownerId=${encodeURIComponent(ownerId)}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Favorite' as const, id })),
              { type: 'Favorite', id: 'LIST' },
            ]
          : [{ type: 'Favorite', id: 'LIST' }],
    }),
    addFavorite: build.mutation<Favorite, NewFavorite>({
      query: (favorite) => ({
        url: '/favorites',
        method: 'POST',
        body: favorite,
      }),
      invalidatesTags: [{ type: 'Favorite', id: 'LIST' }],
    }),
    removeFavorite: build.mutation<void, string>({
      query: (id) => ({ url: `/favorites/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Favorite', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = favoritesApi;
