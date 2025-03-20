import tseslint from "@typescript-eslint/eslint-plugin"
import tsparser from "@typescript-eslint/parser"
import prettierPlugin from "eslint-plugin-prettier"

export default [
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
    ignores: ["node_modules/**", "dist/**", "src/**/dist/**"],
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
]
