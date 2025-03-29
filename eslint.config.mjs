import { defineConfig } from 'eslint/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
// import js from "@eslint/js";
import { FlatCompat } from '@eslint/eslintrc'
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // must be first
    ignores: ['dist/'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    // extends: compat.extends('prettier'),
    // files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'tsdoc/syntax': 'off',
      'no-cond-assign': 'off',
      'yml/plain-scalar': 'off',
      'yml/quotes': 'off',
      'unicorn/prefer-number-properties': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-classes': 'off',
      'perfectionist/sort-objects': 'off',
      'perfectionist/sort-object-types': 'off',
      'padding-line-between-statements': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'object-shorthand': 'off',
      'n/no-unpublished-bin': 'off',
      'n/shebang': 'off',
      'n/hashbang': 'off',
      'prefer-destructuring': 'off',
      'unicorn/prefer-node-protocol': 'off',
      'unicorn/no-negated-condition': 'off',
      'no-return-await': 'off',
      'no-await-in-loop': 'off',
      'perfectionist/sort-named-imports': 'off',
      'unicorn/prefer-ternary': 'off',
      'dot-notation': 'off',
      'max-depth': ['warn', 10],
      complexity: ['warn', 80],
      'unicorn/escape-case': 'off',
      'import/no-named-as-default-member': 'off',
      'unicorn/catch-error-name': 'off',
      'prefer-arrow-callback': 'off',
      'n/no-process-exit': 'off',
      'arrow-body-style': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/no-process-exit': 'off',
      camelcase: 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/prefer-optional-catch-binding': 'off',
      'func-names': 'off',
      'no-eq-null': 'off',
      eqeqeq: 'off',
      'no-case-declarations': 'off',
      'no-fallthrough': 'off',
      'no-prototype-builtins': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/ban-types': 'off',
      'prefer-rest-params': 'off',
    },
  }
)
