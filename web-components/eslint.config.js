import tseslint from "@typescript-eslint/eslint-plugin"
import tsparser from "@typescript-eslint/parser"
import prettierPlugin from "eslint-plugin-prettier"
import storybook from "eslint-plugin-storybook"
import lit from "eslint-plugin-lit"

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
      prettier: prettierPlugin,
    },
    rules: {
      semi: ["error", "never"],
      quotes: ["error", "double"],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error"],
      "prettier/prettier": ["error"],
    },
  },
  lit.configs["flat/recommended"],
  ...storybook.configs["flat/recommended"],
]
