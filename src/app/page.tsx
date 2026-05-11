import Image from 'next/image';
import { Suspense } from 'react';

import { CharactersHome } from '@/features/characters';

import styles from './page.module.css';

const Home = () => {
  return (
    <div className={styles.page}>
      <Image
        height={95}
        width={332}
        src={'/rick-morty-logo.png'}
        alt='rick and morty logo'
      />
      <main className={styles.main}>
        {/* Requerido por `useSearchParams` durante el prerender. */}
        <Suspense fallback={null}>
          <CharactersHome />
        </Suspense>
      </main>
    </div>
  );
};

export default Home;
