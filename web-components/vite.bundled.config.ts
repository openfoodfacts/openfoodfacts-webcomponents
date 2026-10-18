import { defineConfig } from "vite"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { viteStaticCopy } from "vite-plugin-static-copy"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    target: "es2021",
    outDir: "dist",
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/off-webcomponents.ts"),
      fileName: "off-webcomponents.bundled",
      formats: ["es", "cjs"],
    },
    rolldownOptions: {
      output: {
        // Include runtime locale imports in the standalone CDN module.
        codeSplitting: false,
      },
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
