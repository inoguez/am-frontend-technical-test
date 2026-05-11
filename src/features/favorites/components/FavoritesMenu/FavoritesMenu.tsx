'use client';
import { useEffect, useId, useRef, useState } from 'react';

import { useFavorites } from '@/features/favorites/hooks/useFavorites';

import styles from './FavoritesMenu.module.css';

interface Props {
  /** Si se pasa, clickear un item destaca ese personaje (cierra el menú). */
  onSelect?: (characterId: number) => void;
}

/**
 * Botón "FAVS" que comparte contenedor con la lista de favoritos.
 * Al togglear, el contenido del mismo `.root` se reemplaza (trigger
 * ↔ lista) y la altura del contenedor anima vía `interpolate-size:
 * allow-keywords` (CSS estándar; sin medir alturas en JS).
 *
 * Cierra al click-outside y con Escape, devolviendo el foco al
 * trigger cuando vuelve al DOM.
 */
export const FavoritesMenu = ({ onSelect }: Props) => {
  const { favorites, remove } = useFavorites();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreFocus = useRef(false);
  const listId = useId();

  useEffect(() => {
    if (!open) {
      /** Foco devuelto al trigger cuando vuelve a montarse tras cerrar. */
      if (shouldRestoreFocus.current) {
        triggerRef.current?.focus();
        shouldRestoreFocus.current = false;
      }
      return;
    }

    const handlePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        shouldRestoreFocus.current = true;
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const handleItemClick = (characterId: number) => {
    if (!onSelect) return;
    onSelect(characterId);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-open={open || undefined}
      id={listId}
    >
      {open ? (
        <div role='menu' aria-label='Favoritos' className={styles.body}>
          {favorites.length === 0 ? (
            <p className={styles.empty}>Aún no tienes favoritos</p>
          ) : (
            <ul className={styles.list}>
              {favorites.map((favorite) => (
                <li key={favorite.id} className={styles.item}>
                  {onSelect ? (
                    <button
                      type='button'
                      className={styles.name}
                      onClick={() => handleItemClick(favorite.characterId)}
                    >
                      {favorite.character.name}
                    </button>
                  ) : (
                    <span className={styles.name}>
                      {favorite.character.name}
                    </span>
                  )}
                  <button
                    type='button'
                    className={styles.remove}
                    onClick={() => remove(favorite.characterId)}
                    aria-label={`Quitar ${favorite.character.name} de favoritos`}
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <button
          ref={triggerRef}
          type='button'
          className={styles.trigger}
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-controls={listId}
          aria-haspopup='menu'
        >
          FAVS
        </button>
      )}
    </div>
  );
};

const TrashIcon = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='15'
      height='21'
      viewBox='0 0 15 21'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='M13.25 4.875V16.625C13.25 18.558 11.683 20.125 9.75 20.125H5.25C3.317 20.125 1.75 18.558 1.75 16.625V4.875H13.25Z'
        stroke='white'
      />
      <path
        d='M2.5 3.625H12.5C13.4317 3.625 14.2123 4.26268 14.4346 5.125H0.56543C0.787655 4.26268 1.56829 3.625 2.5 3.625Z'
        fill='white'
        stroke='white'
      />
      <rect
        x='10.3125'
        y='7.1875'
        width='0.625'
        height='10.625'
        rx='0.3125'
        fill='#D9D9D9'
        stroke='white'
        strokeWidth='0.625'
      />
      <rect
        x='7.1875'
        y='7.1875'
        width='0.625'
        height='10.625'
        rx='0.3125'
        fill='#D9D9D9'
        stroke='white'
        strokeWidth='0.625'
      />
      <rect
        x='4.0625'
        y='7.1875'
        width='0.625'
        height='10.625'
        rx='0.3125'
        fill='#D9D9D9'
        stroke='white'
        strokeWidth='0.625'
      />
      <rect
        x='4.875'
        y='0.5'
        width='5.25'
        height='2.75'
        fill='#D9D9D9'
        stroke='white'
      />
    </svg>
  );
};
