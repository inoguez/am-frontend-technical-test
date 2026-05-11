'use client';
import Image from 'next/image';
import type { Character } from 'rickmortyapi';

import { FavoriteButton } from '@/features/favorites';

import styles from './CharacterCard.module.css';

interface Props {
  character: Character;
  onSelect: (id: number) => void;
  selected?: boolean;
}

export const CharacterCard = ({ character, onSelect, selected }: Props) => {
  return (
    <article className={styles.card} data-selected={selected || undefined}>
      <button
        type='button'
        className={styles.target}
        onClick={() => onSelect(character.id)}
        aria-pressed={selected}
      >
        <h3>{character.name.split(' ').at(0)}</h3>
        <div className={styles.media}>
          <Image fill src={character.image} alt={character.name} />
        </div>
      </button>
      <FavoriteButton character={character} />
    </article>
  );
};
