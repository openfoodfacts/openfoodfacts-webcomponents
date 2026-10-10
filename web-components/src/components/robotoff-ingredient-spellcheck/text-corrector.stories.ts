import type { Meta, StoryObj } from "@storybook/web-components-vite"
import "./text-corrector"

const meta: Meta = {
  title: "Components/Robotoff/Text Corrector",
  component: "text-corrector",
  parameters: {
    layout: "centered",
  },
}
export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {
    original: "Farine de blé, sucre, huile de palme, cacao en poudre",
    correction: "Farine de ble, sucre, huile de tournesol, cacao en poudre",
  },
}
