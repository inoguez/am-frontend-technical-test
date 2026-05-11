import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';

import styles from './SelectedCharacterPanel.module.css';

/** Mismo layout que `<SelectedCharacterPanel />` en estado data-loaded. */
export const SelectedCharacterPanelSkeleton = () => {
  return (
    <article className={styles.panel} aria-hidden='true'>
      <div className={styles.media}>
        <Skeleton radius='0' />
      </div>

      <div className={styles.info}>
        <Skeleton width='60%' height='1.5rem' radius='0.5rem' />
        <Skeleton width='40%' height='1rem' radius='0.5rem' />

        <div className={styles.facts}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton width='50%' height='0.75rem' radius='0.25rem' />
              <Skeleton width='80%' height='1rem' radius='0.25rem' />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
};
