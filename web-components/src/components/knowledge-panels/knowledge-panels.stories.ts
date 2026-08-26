import type { Meta, StoryObj } from "@storybook/web-components-vite"
import "./knowledge-panels"

const meta: Meta = {
  title: "Components/Knowledge Panels",
  component: "knowledge-panels",
}
export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {
    url: "https://world.openfoodfacts.org/api/v3/product/737628064502.json?fields=knowledge_panels",
    path: "product.knowledge_panels",
    panel: ["root"],
    topFrame: false,
  },
}
