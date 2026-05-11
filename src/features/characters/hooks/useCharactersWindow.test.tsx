import { act, renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { buildCharacter } from '@/shared/test/buildCharacter';
import { createStoreWrapper } from '@/shared/test/renderWithStore';
import { setupMswServer } from '@/shared/test/setupMswServer';

import { useCharactersWindow } from '@/features/characters/hooks/useCharactersWindow';

const API = 'https://rickandmortyapi.com/api';
const PAGE_SIZE = 20;

const server = setupMswServer();

/** Counter para validar que el prefetch dispare al acercarse al final. */
let page2Calls = 0;

const characters = (start: number, count: number) =>
  Array.from({ length: count }, (_, i) =>
    buildCharacter({ id: start + i, name: `c${start + i}` }),
  );

beforeEach(() => {
  page2Calls = 0;
  server.use(
    http.get(`${API}/character`, ({ request }) => {
      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? 1);
      if (page === 2) page2Calls += 1;

      const totalPages = 2;
      return HttpResponse.json({
        info: {
          count: PAGE_SIZE * totalPages,
          pages: totalPages,
          next: page < totalPages ? `${API}/character?page=${page + 1}` : null,
          prev: page > 1 ? `${API}/character?page=${page - 1}` : null,
        },
        results: characters((page - 1) * PAGE_SIZE + 1, PAGE_SIZE),
      });
    }),
  );
});

const renderWindow = () =>
  renderHook(() => useCharactersWindow(), {
    wrapper: createStoreWrapper().Wrapper,
  });

describe('useCharactersWindow', () => {
  it('should expose the first window of the current page', async () => {
    const { result } = renderWindow();
    await waitFor(() => expect(result.current.visible.length).toBe(2));

    expect(result.current.visible.map((c) => c.id)).toEqual([1, 2]);
    expect(result.current.atStart).toBe(true);
  });

  it('should advance the window within the same page when next() is called', async () => {
    const { result } = renderWindow();
    await waitFor(() => expect(result.current.visible.length).toBe(2));

    act(() => result.current.next());
    expect(result.current.visible.map((c) => c.id)).toEqual([3, 4]);
    expect(result.current.page).toBe(1);
  });

  it('should bump to the next API page when next() crosses the page boundary', async () => {
    const { result } = renderWindow();
    await waitFor(() => expect(result.current.visible.length).toBe(2));

    /**
     * 10 saltos de 2 items recorren los 20 de page 1 y el último
     * dispara setPage(2). El reset del windowIndex + la nueva data
     * dejan la ventana en los primeros 2 items de page 2.
     */
    for (let i = 0; i < 10; i += 1) {
      act(() => result.current.next());
    }

    await waitFor(() => expect(result.current.page).toBe(2));
    await waitFor(() =>
      expect(result.current.visible.map((c) => c.id)).toEqual([21, 22]),
    );
  });

  it('should prefetch the next page when within the threshold', async () => {
    const { result } = renderWindow();
    await waitFor(() => expect(result.current.visible.length).toBe(2));
    expect(page2Calls).toBe(0);

    // Avanzamos hasta los últimos items para gatillar el prefetch.
    for (let i = 0; i < 9; i += 1) {
      act(() => result.current.next());
    }

    await waitFor(() => expect(page2Calls).toBeGreaterThan(0));
    expect(result.current.page).toBe(1); // sigue en page 1, solo prefetcheó.
  });

  it('should reset the window when the search name changes', async () => {
    const { result } = renderWindow();
    await waitFor(() => expect(result.current.visible.length).toBe(2));

    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.visible.map((c) => c.id)).toEqual([5, 6]);

    act(() => result.current.setName('rick'));
    await waitFor(() =>
      expect(result.current.visible.map((c) => c.id)).toEqual([1, 2]),
    );
  });
});
