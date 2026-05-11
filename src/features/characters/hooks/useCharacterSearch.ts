import { useDeferredValue, useState } from 'react';
import type { CharacterFilter } from 'rickmortyapi';

import { useGetCharactersQuery } from '@/features/characters/api/charactersApi';

export const useCharacterSearch = () => {
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');
  /**
   * useDeferredValue hace que React decida cuándo actualizar el valor
   * diferido en función de la carga del render, equivalente a un debounce
   */
  const deferredName = useDeferredValue(name);

  const filter: CharacterFilter = {
    page,
    ...(deferredName.trim() && { name: deferredName.trim() }),
  };

  const query = useGetCharactersQuery(filter);

  const updateName = (next: string) => {
    setName(next);
    /**
     * Cambiar el name resetea page a 1 para evitar quedarse en una
     * página inexistente del nuevo resultado.
     */
    setPage(1);
  };

  return {
    page,
    name,
    deferredName,
    isPending: name !== deferredName,
    setPage,
    setName: updateName,
    ...query,
  };
};
