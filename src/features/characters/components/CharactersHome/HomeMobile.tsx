'use client';
import { SearchInput } from '@/shared/ui/SearchInput/SearchInput';

import { CharactersSlider } from '@/features/characters/components/CharactersSlider/CharactersSlider';
import { SelectedCharacterPanel } from '@/features/characters/components/SelectedCharacterPanel/SelectedCharacterPanel';
import { FavoritesMenu } from '@/features/favorites';

import { useCharactersHome } from './CharactersHomeContext';
import styles from './HomeMobile.module.css';

/**
 * Layout mobile: search → slider horizontal (2 cards) → panel del
 * personaje seleccionado → menú de favoritos, todo apilado verticalmente.
 */
export const HomeMobile = () => {
  const {
    window: { name, setName },
    selection: { setSelected },
    effectiveSelectedId,
  } = useCharactersHome();

  return (
    <div className={styles.shell}>
      <SearchInput
        value={name}
        onChange={setName}
        placeholder='Find your character...'
      />
      <CharactersSlider orientation='horizontal' />
      <SelectedCharacterPanel id={effectiveSelectedId} />
      <FavoritesMenu onSelect={setSelected} />
    </div>
  );
};
