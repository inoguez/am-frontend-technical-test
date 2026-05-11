import { act, renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { buildCharacter } from '@/shared/test/buildCharacter';
import { createStoreWrapper } from '@/shared/test/renderWithStore';
import { setupMswServer } from '@/shared/test/setupMswServer';

import { useFavorites } from '@/features/favorites/hooks/useFavorites';
import type { Favorite } from '@/features/favorites/types';

const API = 'http://localhost:3001';

const server = setupMswServer();

const renderUseFavorites = () =>
  renderHook(() => useFavorites(), {
    wrapper: createStoreWrapper().Wrapper,
  });

describe('useFavorites', () => {
  it('should toggle add and remove a favorite optimistically', async () => {
    const rick = buildCharacter();
    const { result } = renderUseFavorites();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isFavorite(rick.id)).toBe(false);

    act(() => result.current.toggle(rick));
    expect(result.current.isFavorite(rick.id)).toBe(true);

    act(() => result.current.toggle(rick));
    expect(result.current.isFavorite(rick.id)).toBe(false);
  });

  it('should block add when the 4-favorite limit is reached', async () => {
    const seed: Favorite[] = Array.from({ length: 4 }, (_, i) => ({
      id: `srv-${i}`,
      ownerId: 'test-owner',
      characterId: i + 1,
      character: buildCharacter({ id: i + 1, name: `c${i + 1}` }),
    }));
    server.use(
      http.get(`${API}/favorites`, () => HttpResponse.json(seed)),
    );

    const { result } = renderUseFavorites();
    await waitFor(() => expect(result.current.favorites.length).toBe(4));
    expect(result.current.isFull).toBe(true);

    const fifth = buildCharacter({ id: 99, name: 'Fifth' });
    act(() => result.current.add(fifth));

    expect(result.current.isFavorite(fifth.id)).toBe(false);
    expect(result.current.favorites.length).toBe(4);
  });

  it('should remove a favorite by characterId', async () => {
    const target = buildCharacter({ id: 7, name: 'Birdperson' });
    const seed: Favorite[] = [
      {
        id: 'srv-7',
        ownerId: 'test-owner',
        characterId: target.id,
        character: target,
      },
    ];
    server.use(
      http.get(`${API}/favorites`, () => HttpResponse.json(seed)),
    );

    const { result } = renderUseFavorites();
    await waitFor(() => expect(result.current.isFavorite(target.id)).toBe(true));

    act(() => result.current.remove(target.id));
    expect(result.current.isFavorite(target.id)).toBe(false);
  });
});
