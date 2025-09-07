import "./donation-banner"

import type { Meta, StoryObj } from "@storybook/web-components-vite"

const meta: Meta = {
  title: "Components/Donation Banner",
  component: "donation-banner",
}
export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {},
}
