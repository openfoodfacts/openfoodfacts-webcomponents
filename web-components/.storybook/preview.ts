import type { Preview } from "@storybook/web-components-vite"

import { setCustomElementsManifest } from "@storybook/web-components-vite"

import customElements from "../custom-elements.json"
setCustomElementsManifest(customElements)

import { assetsPath } from "../src/signals/app"

assetsPath.set(import.meta.env.BASE_URL + "assets")

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
