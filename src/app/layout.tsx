import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';
import { Providers } from '@/app/providers';

export const metadata: Metadata = {
  title: 'Rick and Morty',
  description: 'Prueba técnica Aeroméxico',
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang='es'>
      <body>
        <Providers>{children}</Providers>
        <footer></footer>
      </body>
    </html>
  );
};

export default RootLayout;
