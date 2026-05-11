'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const PARAM = 'selected';

/**
 * Selección persistida en el URL (`?selected=<id>`). Comparte estado
 * entre refresh y permite deep-links a un personaje destacado sin
 * cambiar de ruta. El `null` representa "ningún seleccionado": el
 * consumidor decide el fallback (típicamente el primer item visible).
 */
export const useSelectedCharacter = () => {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const raw = params.get(PARAM);
  const selectedId = raw && /^\d+$/.test(raw) ? Number(raw) : null;

  const setSelected = useCallback(
    (id: number) => {
      const next = new URLSearchParams(params);
      next.set(PARAM, String(id));
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  return { selectedId, setSelected };
};
