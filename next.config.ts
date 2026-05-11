import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      new URL('https://rickandmortyapi.com/api/character/avatar/**'),
    ],
  },
};

export default nextConfig;
