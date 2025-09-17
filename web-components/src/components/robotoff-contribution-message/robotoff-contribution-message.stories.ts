import type { Meta, StoryObj } from "@storybook/web-components-vite"
import "./robotoff-contribution-message"

const meta: Meta = {
  title: "Components/Robotoff/Contribution Message",
  component: "robotoff-contribution-message",
  parameters: {
    layout: "centered",
  },
}
export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {
    "product-code": "5000354922848",
  },
}

export const LoggedIn: Story = {
  args: {
    "product-code": "5000354922848",
    "is-logged-in": true,
  },
}
