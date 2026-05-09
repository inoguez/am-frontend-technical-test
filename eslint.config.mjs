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
            {
              group: ['@/features/*/!(index)', '@/features/*/!(index)/**'],
              message: 'Import from feature public API (index.ts) only',
            },
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
