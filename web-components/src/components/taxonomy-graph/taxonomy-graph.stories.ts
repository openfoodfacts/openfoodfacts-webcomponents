import type { Meta, StoryObj } from "@storybook/web-components-vite"
import "./taxonomy-graph"

const meta: Meta = {
  title: "Taxonomy/graph",
  component: "taxonomy-graph",
}
export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {
    categoriesNames: ["gnocchi", "terrine"],
  },
}
