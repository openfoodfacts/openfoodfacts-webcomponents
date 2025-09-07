import "./barcode-scanner"

import type { Meta, StoryObj } from "@storybook/web-components-vite"

const meta: Meta = {
  title: "Components/Barcode Scanner",
  component: "barcode-scanner",
  parameters: {
    layout: "centered",
  },
}
export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {},
}
