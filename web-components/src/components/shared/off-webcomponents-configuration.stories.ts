import "./off-webcomponents-configuration"
import type { Meta, StoryObj } from "@storybook/web-components-vite"

const meta: Meta = {
  title: "Shared/Configuration",
  component: "off-webcomponents-configuration",
}
export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {
    languageCode: "en",
    countryCode: "fr",
    assetsImagesPath: "/assets/images",
  },
}
