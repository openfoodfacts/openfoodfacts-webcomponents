import { defineConfig } from "vite"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { viteStaticCopy } from "vite-plugin-static-copy"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/off-webcomponents.ts"),
      fileName: "off-webcomponents",
      formats: ["es", "cjs"],
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [{ src: "src/assets", dest: "" }],
    }),
  ],
})
