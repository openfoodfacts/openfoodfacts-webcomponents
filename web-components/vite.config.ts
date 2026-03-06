import { defineConfig } from "vite"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { viteStaticCopy } from "vite-plugin-static-copy"
import dts from "vite-plugin-dts"

const __dirname = dirname(fileURLToPath(import.meta.url))

const languagesRegex = /src\/localization\/dist\/locales\/(.*)\.ts$/

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/off-webcomponents.ts"),
      fileName: "off-webcomponents.bundled",
      formats: ["es", "cjs"],
    },
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const match = id.match(languagesRegex)
          if (match) {
            return `lang/${match[1]}`
          }
        },
      },
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [{ src: "src/assets", dest: "" }],
    }),
    dts({
      tsconfigPath: "./tsconfig.json",
      outDir: "dist/types",
    }),
  ],
  define: {
    __OFF_WEBCOMPONENTS_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})
