import type { Preview } from "@storybook/web-components-vite"

import { setCustomElementsManifest } from "@storybook/web-components-vite"

import customElements from "../custom-elements.json"
setCustomElementsManifest(customElements)

import { assetsImagesPath } from "../src/signals/app"

assetsImagesPath.set(import.meta.env.BASE_URL + "assets/images")

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
