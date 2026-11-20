import type { Meta, StoryObj } from "@storybook/web-components-vite"
import "./nutripatrol-reports"

const meta: Meta = {
  title: "Components/Nutri Patrol Reports",
  component: "nutripatrol-reports",
  parameters: {
    layout: "centered",
  },
}

export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {
    barcode: "3017620422003",
  },
}
