import tseslint from "@typescript-eslint/eslint-plugin"
import tsparser from "@typescript-eslint/parser"
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
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parser: tsparser,
      globals: {
        // Équivalent à env.browser: true
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        // Plus de variables globales du navigateur peuvent être ajoutées si nécessaire
      },
    },
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error"],
    },
  },
  lit.configs["flat/recommended"],
  ...storybook.configs["flat/recommended"],
  // must be last: turns off rules that conflict with Prettier (formatting is handled by Prettier)
  prettierConfig,
]
