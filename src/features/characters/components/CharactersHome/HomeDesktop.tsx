'use client';
import { SearchInput } from '@/shared/ui/SearchInput/SearchInput';

import { CharactersSlider } from '@/features/characters/components/CharactersSlider/CharactersSlider';
import { SelectedCharacterPanel } from '@/features/characters/components/SelectedCharacterPanel/SelectedCharacterPanel';
import { FavoritesMenu } from '@/features/favorites';

import { useCharactersHome } from './CharactersHomeContext';
import styles from './HomeDesktop.module.css';

/**
 * Layout desktop: panel del personaje seleccionado a la izquierda,
 * search + slider vertical (2x2) a la derecha, menú de favoritos
 * abajo a la derecha (centrado al pie del panel de la lista).
 */
export const HomeDesktop = () => {
  const {
    window: { name, setName },
    selection: { setSelected },
    effectiveSelectedId,
  } = useCharactersHome();

  return (
    <div className={styles.shell}>
      <aside className={styles.panel}>
        <SelectedCharacterPanel id={effectiveSelectedId} />
      </aside>

      <section className={styles.list}>
        <SearchInput
          value={name}
          onChange={setName}
          placeholder='Find your character...'
        />
        <CharactersSlider orientation='vertical' />
        <FavoritesMenu onSelect={setSelected} />
      </section>
    </div>
  );
};
