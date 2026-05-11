import type { Character } from 'rickmortyapi';

import styles from './Badge.module.css';

interface Props {
  status: Character['status'];
}

export const Badge = ({ status }: Props) => {
  return (
    <span
      className={`${styles.badge} ${styles[`badge${status}`]}`}
      data-status={status}
    >
      <div className={styles.badgeCircle}></div>
      {status}
    </span>
  );
};
