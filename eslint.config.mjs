import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      'react/no-danger': 'error',
    },
  },
  {
    // Architecture boundary: components get typed props, never raw config, secrets or the database.
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/lib/config',
              message: 'Components receive config through props. Type-only imports from @/lib/config/schema are fine.',
            },
          ],
          patterns: [
            {
              group: ['@config/*', '@content/*', '**/../config/*', '**/../content/*'],
              message: 'Components receive data through props from src/lib/content.',
            },
            {
              group: ['@/lib/db/*', '@/lib/env', '@/lib/email', '@/lib/email/*'],
              message: 'Server-only modules cannot be used in components.',
            },
          ],
        },
      ],
    },
  },
  {
    // The single allowed use of dangerouslySetInnerHTML: escaped JSON-LD.
    files: ['src/components/seo/json-ld.tsx'],
    rules: { 'react/no-danger': 'off' },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.data/**',
    'playwright-report/**',
    'test-results/**',
  ]),
]);

export default eslintConfig;
