import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';

import styles from './CharacterCard.module.css';

/**
 * Mismo bounding box que `<CharacterCard />` para que el slider no
 * salte de tamaño cuando se reemplaza el skeleton por la card real.
 */
export const CharacterCardSkeleton = () => {
  return (
    <div className={styles.card} aria-hidden='true'>
      <div className={styles.target}>
        <div className={styles.media}>
          <Skeleton radius='0.75rem' />
        </div>
        <Skeleton width='60%' height='1rem' radius='0.5rem' />
      </div>
      <Skeleton width='80%' height='1.5rem' radius='999px' />
    </div>
  );
};
