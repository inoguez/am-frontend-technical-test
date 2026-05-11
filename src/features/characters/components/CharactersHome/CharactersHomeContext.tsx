'use client';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useCharactersWindow } from '@/features/characters/hooks/useCharactersWindow';
import { useSelectedCharacter } from '@/features/characters/hooks/useSelectedCharacter';

type WindowState = ReturnType<typeof useCharactersWindow>;
type SelectionState = ReturnType<typeof useSelectedCharacter>;

interface CharactersHomeValue {
  window: WindowState;
  selection: SelectionState;
  /** Id efectivo a destacar: el de la URL, o el primer item visible si no hay. */
  effectiveSelectedId: number | null;
}

const Ctx = createContext<CharactersHomeValue | null>(null);

/**
 * Comparte una sola instancia de `useCharactersWindow` y
 * `useSelectedCharacter` entre los shells (mobile/desktop) y los
 * componentes hijos (slider, panel). Sin esto, cada consumidor
 * tendría su propio `useState(page)` y `useState(name)` internos.
 */
export const CharactersHomeProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const window = useCharactersWindow();
  const selection = useSelectedCharacter();

  const effectiveSelectedId =
    selection.selectedId ?? window.visible[0]?.id ?? null;

  const value = useMemo<CharactersHomeValue>(
    () => ({ window, selection, effectiveSelectedId }),
    [window, selection, effectiveSelectedId],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useCharactersHome = (): CharactersHomeValue => {
  const value = useContext(Ctx);
  if (!value) {
    throw new Error(
      'useCharactersHome debe usarse dentro de CharactersHomeProvider',
    );
  }
  return value;
};
