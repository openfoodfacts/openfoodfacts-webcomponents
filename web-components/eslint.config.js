import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import storybook from "eslint-plugin-storybook"
import lit from "eslint-plugin-lit"
import prettierConfig from "eslint-config-prettier"

export default [
  // global ignores
  {
    ignores: [
      "node_modules/**",
      "docs/**/dist/**",
      "dist/**",
      "src/**/dist/**",
      "storybook-static/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        // Équivalent à env.browser: true
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        // Plus de variables globales du navigateur peuvent être ajoutées si nécessaire
      },
    },
    files: ["**/*.ts", "**/*.tsx"],
  },
  {
    // Node.js scripts
    files: ["scripts/**/*.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // `any` is tolerated in tests & stories (mocks, fixtures)
    files: ["**/*.test.ts", "**/*.stories.ts", "src/test/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  lit.configs["flat/recommended"],
  ...storybook.configs["flat/recommended"],
  // must be last: turns off rules that conflict with Prettier (formatting is handled by Prettier)
  prettierConfig,
]
