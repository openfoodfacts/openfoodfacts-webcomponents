import type { Meta, StoryObj } from "@storybook/web-components-vite"
import "./footer"

const meta: Meta = {
  title: "Components/Footer",
  component: "off-footer",
  parameters: {
    layout: "fullscreen",
  },
}

export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {},
}
