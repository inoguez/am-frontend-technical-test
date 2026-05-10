import type { Character } from 'rickmortyapi';

import styles from './Badge.module.css';

interface Props {
  status: Character['status'];
}

export function Badge({ status }: Props) {
  return (
    <span className={`${styles.badge} ${styles[status.toLowerCase()]}`}>
      {status}
    </span>
  );
}
