import "./robotoff-ingredient-spellcheck"
import type { Meta, StoryObj } from "@storybook/web-components-vite"

const meta: Meta = {
  title: "Components/Robotoff/Ingredient Spellcheck",
  component: "robotoff-ingredient-spellcheck",
}
export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {
    productCode: "3017620422003",
  },
}
