import type { Metadata } from 'next';

import './globals.css';
import { Providers } from '@/app/providers';

export const metadata: Metadata = {
  title: 'Rick and Morty',
  description: 'Prueba técnica Aeroméxico',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='es'>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
