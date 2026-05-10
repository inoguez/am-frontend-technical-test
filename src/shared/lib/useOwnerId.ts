'use client';
import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'am.ownerId';

let cached: string | null = null;

const readOrCreateOwnerId = (): string => {
  if (cached) return cached;
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  cached = id;
  return id;
};

/** El UUID se mantiene estable durante toda la sesión, no hay nada a lo que suscribirse. */
const subscribe = () => () => {};

const getServerSnapshot = () => null;

/**
 * Genera y/o lee un UUID por browser para aislar los favoritos de cada
 * usuario en json-server.
 *
 * Usa useSyncExternalStore en lugar de useState + useEffect para
 * evitar el render extra que dispararía el setState post-mount.
 */
export const useOwnerId = (): string | null => {
  return useSyncExternalStore(
    subscribe,
    readOrCreateOwnerId,
    getServerSnapshot,
  );
};
