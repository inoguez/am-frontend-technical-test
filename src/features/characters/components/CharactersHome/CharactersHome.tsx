'use client';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { DESKTOP_QUERY } from '@/shared/utils/constants';

import { CharactersHomeProvider } from './CharactersHomeContext';
import { HomeDesktop } from './HomeDesktop';
import { HomeMobile } from './HomeMobile';

/**
 * Punto de entrada de la home. Provee el estado compartido
 * (CharactersHomeProvider) y elige el shell visual según viewport.
 * Toda la lógica vive en hooks consumidos por el provider; los shells
 * solo componen.
 */
export const CharactersHome = () => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  return (
    <CharactersHomeProvider>
      {isDesktop ? <HomeDesktop /> : <HomeMobile />}
    </CharactersHomeProvider>
  );
};
