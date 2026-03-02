import type { Meta, StoryObj } from "@storybook/web-components-vite"
import "./robotoff-ingredient-spellcheck"

const meta: Meta = {
  title: "Components/Robotoff/Ingredient Spellcheck",
  component: "robotoff-ingredient-spellcheck",
  parameters: {
    layout: "centered",
  },
}
export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {},
}
