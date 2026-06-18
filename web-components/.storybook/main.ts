import type { StorybookConfig } from "@storybook/web-components-vite"

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-vitest", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/web-components-vite",
    options: {},
  },
  docs: {},
}
export default config
