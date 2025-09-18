import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "src/**/*.stories.ts",
        "src/localization/**",
        "**/*.d.ts",
      ],
    },
    setupFiles: ["./src/test/setup.ts"],
  },
  define: {
    global: 'globalThis',
  },
})