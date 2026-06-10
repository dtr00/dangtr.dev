//  @ts-check

import convexPlugin from '@convex-dev/eslint-plugin'
import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  ...convexPlugin.configs.recommended,
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'pnpm/json-enforce-catalog': 'off',
    },
  },
  {
    ignores: ['eslint.config.js', 'prettier.config.js'],
  },
]
