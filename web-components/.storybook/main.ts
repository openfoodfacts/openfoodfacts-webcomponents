import type { StorybookConfig } from "@storybook/web-components-vite"

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [],
  framework: {
    name: "@storybook/web-components-vite",
    options: {},
  },
  docs: {},
  async viteFinal(config) {
    const { mergeConfig } = await import("vite")
    return mergeConfig(config, {
      server: {
        proxy: {
          "/api/openfoodfacts": {
            target: "https://world.openfoodfacts.org",
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/api\/openfoodfacts/, ""),
          },
        },
      },
    })
  },
}
export default config
