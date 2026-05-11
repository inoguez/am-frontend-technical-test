import { defineConfig } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import testingLibrary from 'eslint-plugin-testing-library';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Settings del resolver para el plugin import (que ya viene cargado por next)
  {
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
        node: true,
      },
    },
  },

  // Reglas custom
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],

      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
          ],
          pathGroups: [
            { pattern: '@/shared/**', group: 'internal', position: 'before' },
            { pattern: '@/features/**', group: 'internal', position: 'before' },
            { pattern: '@/store/**', group: 'internal', position: 'before' },
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
      ],
      'import/no-cycle': 'error',
      'import/no-self-import': 'error',

      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: 'Use @/ aliases instead of relative parent imports',
            },
          ],
        },
      ],

      /**
       * Module boundaries entre features. Cada feature solo puede ser
       * consumido por otros desde su `index.ts` (barrel). Sus internals
       * siguen siendo libres de importar entre sí.
       */
      /**
       * Module boundaries: cada feature solo es consumido desde su
       * `index.ts` (barrel). Sus internals siguen siendo libres de
       * importarse entre sí. Las zonas cubren los 4 consumidores
       * posibles (otro feature, app, store, shared) por las 2 features.
       */
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            ...['./src/features/characters', './src/features/favorites']
              .flatMap((target) =>
                [
                  ['./src/features/characters', '@/features/characters'],
                  ['./src/features/favorites', '@/features/favorites'],
                ]
                  .filter(([from]) => from !== target)
                  .map(([from, alias]) => ({
                    target,
                    from,
                    except: ['./index.ts'],
                    message: `Importar desde ${alias} (public API), no de sus internals.`,
                  })),
              ),
            ...['./src/app', './src/store', './src/shared'].flatMap((target) =>
              [
                ['./src/features/characters', '@/features/characters'],
                ['./src/features/favorites', '@/features/favorites'],
              ].map(([from, alias]) => ({
                target,
                from,
                except: ['./index.ts'],
                message: `Importar desde ${alias} (public API), no de sus internals.`,
              })),
            ),
          ],
        },
      ],
    },
  },

  // testing-library SOLO en archivos de test
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    ...testingLibrary.configs['flat/react'],
  },
]);

export default eslintConfig;
