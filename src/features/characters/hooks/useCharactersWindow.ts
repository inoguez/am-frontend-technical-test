'use client';
import { useEffect, useState } from 'react';

import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { DESKTOP_QUERY } from '@/shared/utils/constants';

import { usePrefetch } from '@/features/characters/api/charactersApi';
import { useCharacterSearch } from '@/features/characters/hooks/useCharacterSearch';

const MOBILE_VISIBLE = 2;
const DESKTOP_VISIBLE = 4;
const PAGE_SIZE = 20; // tamaño de página fijo de la API
const PREFETCH_THRESHOLD = 2; // items restantes antes de prefetchear

/**
 * Compone useCharacterSearch con una "ventana" local sobre la página
 * actual de 20 resultados. Las flechas mueven el windowIndex dentro
 * de la página; al llegar al final/inicio, se delega a la paginación
 * real (setPage). Cuando faltan pocos items para terminar la
 * ventana, se prefetchea la siguiente página vía RTK Query, así la
 * transición no dispara loading visible.
 *
 */
export const useCharactersWindow = () => {
  const search = useCharacterSearch();
  const prefetchPage = usePrefetch('getCharacters');

  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const visibleCount = isDesktop ? DESKTOP_VISIBLE : MOBILE_VISIBLE;

  const results = search.data?.results ?? [];
  const info = search.data?.info;
  const total = results.length;

  const [windowIndex, setWindowIndex] = useState(0);
  const [resetKey, setResetKey] = useState('');

  /** Reset de ventana en render cuando cambia query o página real */
  const currentKey = `${search.page}|${search.deferredName}`;
  if (currentKey !== resetKey) {
    setResetKey(currentKey);
    setWindowIndex(0);
  }

  /** Clamp derivado: si el viewport cambió y  windowIndex quedó fuera */
  const maxIndex = Math.max(0, total - visibleCount);
  const safeIndex = Math.min(windowIndex, maxIndex);

  const visible = results.slice(safeIndex, safeIndex + visibleCount);
  const atStart = safeIndex === 0 && search.page === 1;
  const atEnd = safeIndex + visibleCount >= total && !info?.next;

  const next = () => {
    if (safeIndex + visibleCount < total) {
      setWindowIndex(safeIndex + visibleCount);
      return;
    }
    if (info?.next) {
      search.setPage(search.page + 1);
    }
  };

  const prev = () => {
    if (safeIndex > 0) {
      setWindowIndex(Math.max(0, safeIndex - visibleCount));
      return;
    }
    if (info?.prev) {
      search.setPage(search.page - 1);
      /**
       * Asumimos PAGE_SIZE completo en la página anterior (la API
       * solo devuelve menos en la última página). El clamp derivado
       * arriba ajusta si la realidad es menor.
       */
      setWindowIndex(Math.max(0, PAGE_SIZE - visibleCount));
    }
  };

  /**
   * Prefetch de la página siguiente cuando estamos cerca del final.
   * Esto sí va en effect: es una sincronización con sistema externo
   * (cache de RTK Query), no un setState dependiente de props.
   */
  useEffect(() => {
    if (!info?.next) return;
    const remaining = total - (safeIndex + visibleCount);
    if (remaining > PREFETCH_THRESHOLD) return;

    const trimmed = search.deferredName.trim();
    prefetchPage({
      page: search.page + 1,
      ...(trimmed && { name: trimmed }),
    });
  }, [
    safeIndex,
    visibleCount,
    total,
    info?.next,
    search.page,
    search.deferredName,
    prefetchPage,
  ]);
  /** Total real reportado por la API (matching del filtro actual). */
  const totalCount = info?.count ?? 0;

  return {
    ...search,
    visible,
    visibleCount,
    isDesktop,
    next,
    prev,
    atStart,
    atEnd,
    totalCount,
  };
};
