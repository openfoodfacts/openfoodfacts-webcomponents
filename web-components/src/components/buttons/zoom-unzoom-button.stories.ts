import "./zoom-unzoom-button"
import type { Meta, StoryObj } from "@storybook/web-components-vite"

const meta: Meta = {
  title: "Components/Buttons/Zoom-Unzoom Button",
  component: "zoom-unzoom-button",
}
export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {
    zoomed: false,
  },
}

export const Zoomed: Story = {
  args: {
    zoomed: true,
  },
}
