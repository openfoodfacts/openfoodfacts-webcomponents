import type { Meta, StoryObj } from "@storybook/web-components-vite"
import "./robotoff-nutrient-extraction"

const meta: Meta = {
  title: "Components/Robotoff/Nutrient Extraction",
  component: "robotoff-nutrient-extraction",
  parameters: {
    layout: "centered",
  },
}
export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {},
}
