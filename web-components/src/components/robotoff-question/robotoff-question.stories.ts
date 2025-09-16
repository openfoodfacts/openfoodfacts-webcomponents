import type { Meta, StoryObj } from "@storybook/web-components-vite"
import "./robotoff-question"

const meta: Meta = {
  title: "Components/Robotoff/Question",
  component: "robotoff-question",
  parameters: {
    layout: "centered",
  },
}
export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {
    "product-code": "5000354922848",
    options: { showMessage: true, showLoading: true, showError: true, showImage: true },
  },
}
