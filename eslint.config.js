// @ts-check

import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import perfectionist from 'eslint-plugin-perfectionist';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['dist']),
  {
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      perfectionist.configs['recommended-natural'],
    ],
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.js'],
        },
      },
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      // Function properties get strict parameter checks; method signatures don't
      '@typescript-eslint/method-signature-style': ['error', 'property'],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/prefer-destructuring': 'error',
      eqeqeq: 'error',
      'func-style': ['error', 'expression'],
      'no-console': 'error',
      'no-duplicate-imports': 'error',
      'object-shorthand': 'error',
    },
  },
  {
    // Application code uses named exports; tool config files outside src load default exports
    files: ['src/**/*.ts'],
    rules: {
      'no-restricted-exports': [
        'error',
        {
          restrictDefaultExports: {
            defaultFrom: true,
            direct: true,
            named: true,
            namedFrom: true,
            namespaceFrom: true,
          },
        },
      ],
    },
  },
  eslintConfigPrettier,
  {
    // After Prettier's config, which turns it off; the default "all" option doesn't conflict with Prettier
    rules: {
      curly: 'error',
    },
  },
);
