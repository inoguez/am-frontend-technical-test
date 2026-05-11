import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { buildCharacter } from '@/shared/test/buildCharacter';
import { renderWithStore } from '@/shared/test/renderWithStore';
import { setupMswServer } from '@/shared/test/setupMswServer';

import { CharacterCard } from '@/features/characters/components/CharacterCard/CharacterCard';

setupMswServer();

describe('CharacterCard', () => {
  it('should render the first word of the character name', () => {
    const rick = buildCharacter({ id: 1, name: 'Rick Sanchez' });
    renderWithStore(<CharacterCard character={rick} onSelect={() => {}} />);

    expect(screen.getByRole('heading', { name: 'Rick' })).toBeInTheDocument();
  });

  it('should call onSelect with the character id when the card is clicked', async () => {
    const onSelect = vi.fn();
    const rick = buildCharacter({ id: 42, name: 'Rick Sanchez' });
    renderWithStore(<CharacterCard character={rick} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('heading', { name: 'Rick' }));
    expect(onSelect).toHaveBeenCalledWith(42);
  });

  it('should set aria-pressed when the selected prop is true', () => {
    const rick = buildCharacter({ id: 1, name: 'Rick Sanchez' });
    renderWithStore(
      <CharacterCard character={rick} onSelect={() => {}} selected />,
    );

    expect(screen.getByRole('button', { pressed: true })).toBeInTheDocument();
  });

  it('should expose a non-pressed state when selected is false or unset', () => {
    const rick = buildCharacter({ id: 1, name: 'Rick Sanchez' });
    renderWithStore(
      <CharacterCard character={rick} onSelect={() => {}} selected={false} />,
    );

    /**
     * Hay dos botones en la card (el target y el favorito). El target
     * lleva `aria-pressed="false"`, el favorito también. Acá basta con
     * verificar que ninguno está en estado "pressed".
     */
    expect(screen.queryByRole('button', { pressed: true })).toBeNull();
  });
});
