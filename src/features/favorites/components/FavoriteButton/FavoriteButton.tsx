'use client';
import clsx from 'clsx';

import type { Character } from '@/features/characters';
import { useFavorites } from '@/features/favorites/hooks/useFavorites';

import styles from './FavoriteButton.module.css';

interface Props {
  character: Character;
}

export const FavoriteButton = ({ character }: Props) => {
  const { isFavorite, isFull, toggle } = useFavorites();
  const active = isFavorite(character.id);
  /** Bloqueado solo cuando el cupo está lleno y este no es uno de los 4. */
  const blocked = !active && isFull;

  return (
    <button
      className={clsx(styles.favoriteButton, {
        [styles.active]: active,
        [styles.inactive]: !active,
      })}
      onClick={() => toggle(character)}
      disabled={blocked}
      aria-pressed={active}
      aria-label={
        blocked
          ? 'Cupo de favoritos lleno (máximo 4)'
          : active
            ? 'Quitar de favoritos'
            : 'Agregar a favoritos'
      }
      title={blocked ? 'Máximo 4 favoritos' : undefined}
    >
      <svg
        width='24'
        height='21'
        viewBox='0 0 24 21'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M10.5844 19.9396L10.4672 19.8318L2.25469 12.2052C0.815625 10.8693 0 8.9943 0 7.03024V6.87555C0 3.57555 2.34375 0.744299 5.5875 0.125549C7.43437 -0.230701 9.32344 0.195862 10.8281 1.25524C11.25 1.55524 11.6438 1.90211 12 2.30055C12.1969 2.07555 12.4078 1.8693 12.6328 1.67711C12.8062 1.52711 12.9844 1.38649 13.1719 1.25524C14.6766 0.195862 16.5656 -0.230701 18.4125 0.120862C21.6562 0.739612 24 3.57555 24 6.87555V7.03024C24 8.9943 23.1844 10.8693 21.7453 12.2052L13.5328 19.8318L13.4156 19.9396C13.0312 20.2959 12.525 20.4974 12 20.4974C11.475 20.4974 10.9688 20.3005 10.5844 19.9396ZM11.2078 4.78961C11.1891 4.77555 11.175 4.7568 11.1609 4.73805L10.3266 3.80055L10.3219 3.79586C9.23906 2.5818 7.60313 2.02867 6.00938 2.33336C3.825 2.75055 2.25 4.65367 2.25 6.87555V7.03024C2.25 8.36617 2.80781 9.64586 3.7875 10.5552L12 18.1818L20.2125 10.5552C21.1924 9.64485 21.7495 8.36781 21.75 7.03024V6.87555C21.75 4.65836 20.175 2.75055 17.9953 2.33336C16.4016 2.02867 14.7609 2.58649 13.6828 3.79586L13.6781 3.80055L13.6734 3.80524L12.8391 4.74274C12.825 4.76149 12.8063 4.77555 12.7922 4.7943C12.5813 5.00524 12.2953 5.12242 12 5.12242C11.7047 5.12242 11.4187 5.00524 11.2078 4.7943'
          fill={active ? '#E40000' : 'white'}
        />
      </svg>
      Like
    </button>
  );
};
