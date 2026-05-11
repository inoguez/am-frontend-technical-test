import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { buildCharacter } from '@/shared/test/buildCharacter';
import { renderWithStore } from '@/shared/test/renderWithStore';
import { setupMswServer } from '@/shared/test/setupMswServer';

import { FavoritesMenu } from '@/features/favorites/components/FavoritesMenu/FavoritesMenu';
import type { Favorite } from '@/features/favorites/types';

const API = 'http://localhost:3001';

const server = setupMswServer();

const seedFavorites = (): Favorite[] => [
  {
    id: 'srv-1',
    ownerId: 'test',
    characterId: 1,
    character: buildCharacter({ id: 1, name: 'Rick' }),
  },
  {
    id: 'srv-2',
    ownerId: 'test',
    characterId: 2,
    character: buildCharacter({ id: 2, name: 'Morty' }),
  },
];

describe('FavoritesMenu', () => {
  it('should render the FAVS trigger when closed', () => {
    renderWithStore(<FavoritesMenu />);
    expect(
      screen.getByRole('button', { name: /favs/i }),
    ).toBeInTheDocument();
  });

  it('should open the menu and list the current favorites when trigger is clicked', async () => {
    server.use(
      http.get(`${API}/favorites`, () => HttpResponse.json(seedFavorites())),
    );
    renderWithStore(<FavoritesMenu />);

    await userEvent.click(screen.getByRole('button', { name: /favs/i }));

    expect(await screen.findByText('Rick')).toBeInTheDocument();
    expect(screen.getByText('Morty')).toBeInTheDocument();
  });

  it('should remove a favorite when its trash button is clicked', async () => {
    let store = seedFavorites();
    server.use(
      http.get(`${API}/favorites`, () => HttpResponse.json(store)),
      http.delete(`${API}/favorites/:id`, ({ params }) => {
        store = store.filter((f) => f.id !== params.id);
        return new HttpResponse(null, { status: 200 });
      }),
    );
    renderWithStore(<FavoritesMenu />);

    await userEvent.click(screen.getByRole('button', { name: /favs/i }));
    await screen.findByText('Rick');

    await userEvent.click(
      screen.getByRole('button', { name: /quitar rick/i }),
    );
    await waitFor(() => expect(screen.queryByText('Rick')).not.toBeInTheDocument());
  });

  it('should select a favorite when its name is clicked and close the menu', async () => {
    server.use(
      http.get(`${API}/favorites`, () => HttpResponse.json(seedFavorites())),
    );
    const onSelect = (id: number) => {
      received = id;
    };
    let received = 0;
    renderWithStore(<FavoritesMenu onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('button', { name: /favs/i }));
    await userEvent.click(await screen.findByRole('button', { name: 'Morty' }));

    expect(received).toBe(2);
    expect(screen.getByRole('button', { name: /favs/i })).toBeInTheDocument();
  });
});
