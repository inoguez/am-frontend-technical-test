'use client';
import Image from 'next/image';

import { Badge } from '@/shared/ui/Badge/Badge';

import { useGetCharacterByIdQuery } from '@/features/characters/api/charactersApi';

import styles from './SelectedCharacterPanel.module.css';
import { SelectedCharacterPanelSkeleton } from './SelectedCharacterPanelSkeleton';

interface Props {
  id: number | null;
}

/**
 * Panel grande con el detalle del personaje "destacado" en la home.

 * la selección vive en `?selected=` y la card se actualiza inline.
 */
export const SelectedCharacterPanel = ({ id }: Props) => {
  const { data, isLoading, isError } = useGetCharacterByIdQuery(id!, {
    skip: id == null,
  });

  if (id == null) {
    return <div className={styles.empty}>Selecciona un personaje</div>;
  }
  if (isLoading) return <SelectedCharacterPanelSkeleton />;
  if (isError || !data) {
    return <p className={styles.error}>No se pudo cargar el personaje</p>;
  }

  return (
    <article className={styles.panel}>
      <div className={styles.media}>
        <Badge status={data.status} />
        <Image fill src={data.image} alt={data.name} />
      </div>

      <div className={styles.info}>
        <header className={styles.header}>
          <h2 className={styles.name}>{data.name}</h2>
          <p className={styles.subtitle}>
            {data.species} {data.type && `· ${data.type}`}
          </p>
        </header>

        <dl className={styles.facts}>
          <div>
            <dt>Origin</dt>
            <dd>{data.origin.name}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{data.location.name}</dd>
          </div>
          <div>
            <dt>Gender</dt>
            <dd>{data.gender}</dd>
          </div>
          <div>
            <dt>Episodes</dt>
            <dd>{data.episode.length}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
};
