import type { CSSProperties } from 'react';

import styles from './Skeleton.module.css';

interface Props {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
}

/**
 * Placeholder de carga con shimmer animado. Por defecto ocupa el
 * 100% del contenedor padre, así que la forma del skeleton se
 * controla desde afuera (un grid o un wrapper con `aspect-ratio`).
 * Los props de tamaño son atajos para casos sueltos.
 */
export const Skeleton = ({ width, height, radius, className }: Props) => {
  const style: CSSProperties = {
    width,
    height,
    borderRadius: radius,
  };

  return (
    <div
      className={[styles.skeleton, className].filter(Boolean).join(' ')}
      style={style}
      aria-hidden='true'
      role='presentation'
    />
  );
};
