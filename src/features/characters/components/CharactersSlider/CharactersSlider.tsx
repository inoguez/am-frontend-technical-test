'use client';
import type { CSSProperties } from 'react';

import { ArrowButton } from '@/shared/ui/ArrowButton/ArrowButton';

import { CharacterCard } from '@/features/characters/components/CharacterCard/CharacterCard';
import { CharacterCardSkeleton } from '@/features/characters/components/CharacterCard/CharacterCardSkeleton';
import { useCharactersHome } from '@/features/characters/components/CharactersHome/CharactersHomeContext';

import styles from './CharactersSlider.module.css';

interface Props {
  /** Flechas verticales (desktop) u horizontales (mobile). */
  orientation: 'horizontal' | 'vertical';
}

/**
 * Slider de personajes con paginación virtual sobre la página de la API.
 * Lee del CharactersHomeProvider: la búsqueda, la ventana y la
 * selección viven en el contexto compartido.
 */
export const CharactersSlider = ({ orientation }: Props) => {
  const {
    window: {
      visible,
      visibleCount,
      isFetching,
      error,
      isError,
      next,
      prev,
      atStart,
      atEnd,
      totalCount,
    },
    selection: { setSelected },
    effectiveSelectedId,
  } = useCharactersHome();

  if (isError && (error as { status?: number })?.status === 404)
    return <p>El personaje que intentas buscar no existe</p>;
  if (isError) return <p>Error cargando personajes</p>;

  const gridStyle = { '--visible': visibleCount } as CSSProperties;
  /**
   * Con un solo resultado no hay nada que recorrer; las arrows
   * estarían disabled en ambos extremos y ocuparían espacio sin uso.
   */
  const showArrows = totalCount !== 1;

  return (
    <div className={styles.window} data-orientation={orientation}>
      {showArrows && (
        <ArrowButton
          className={styles.firstArrow}
          onClick={prev}
          disabled={atStart}
          variant={orientation === 'vertical' ? 'up' : 'left'}
        />
      )}

      <div className={styles.grid} style={gridStyle}>
        {isFetching
          ? Array.from({ length: visibleCount }).map((_, i) => (
              <CharacterCardSkeleton key={i} />
            ))
          : visible.map((c) => (
              <CharacterCard
                key={c.id}
                character={c}
                onSelect={setSelected}
                selected={c.id === effectiveSelectedId}
              />
            ))}
      </div>

      {showArrows && (
        <ArrowButton
          className={styles.secondArrow}
          disabled={atEnd}
          onClick={next}
          variant={orientation === 'vertical' ? 'down' : 'right'}
        />
      )}
    </div>
  );
};
