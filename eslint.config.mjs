import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
    features: {
        // Rules for module authors
        tooling: true,
        // Rules for formatting
        stylistic: true,
    },
    dirs: {
        src: [
            './playground',
        ],
    },
    plugins: {
        prettier: prettierPlugin,
      },
      rules: {
        'prettier/prettier': 'error',
        semi: ['error', 'never'],
        'operator-linebreak': ['error', 'before'],
        'multiline-ternary': ['error', 'always-multiline'],
      },
}).append(prettierConfig)
