import { defineConfig } from "vite"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { viteStaticCopy } from "vite-plugin-static-copy"

const __dirname = dirname(fileURLToPath(import.meta.url))
const localeChunkRegex = /src\/localization\/generated\/locales\/(.*)\.ts$/

export default defineConfig({
  build: {
    target: "es2021",
    outDir: "dist",
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/off-webcomponents.ts"),
      fileName: "off-webcomponents.bundled",
    },
    rolldownOptions: {
      output: [
        {
          format: "es",
          chunkFileNames: "lang/esm/[name]-[hash].js",
          manualChunks(id) {
            const match = id.match(localeChunkRegex)
            if (match) {
              return match[1]
            }
          },
        },
        {
          format: "cjs",
          chunkFileNames: "lang/cjs/[name]-[hash].cjs",
          manualChunks(id) {
            const match = id.match(localeChunkRegex)
            if (match) {
              return match[1]
            }
          },
        },
      ],
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [{ src: "src/assets", dest: "", rename: { stripBase: 1 } }],
    }),
  ],
  define: {
    __OFF_WEBCOMPONENTS_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})
