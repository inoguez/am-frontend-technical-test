'use client';
import { useCallback, useSyncExternalStore } from 'react';

/**
 * Suscripción reactiva a un media query, SSR-safe.
 * En el servidor devuelve `false` para evitar el mismatch de hidratación;
 * el primer paint del cliente reconciliará al valor real.
 */
export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (cb: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
    },
    [query],
  );
  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
};
