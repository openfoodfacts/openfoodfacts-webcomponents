import "./autocomplete-input"
import type { Meta, StoryObj } from "@storybook/web-components-vite"

const meta: Meta = {
  title: "Shared/Autocomplete Input",
  component: "autocomplete-input",
}
export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {
    placeholder: "Search for a property...",
    suggestions: [
      { id: "1", label: "Vegan", value: "vegan" },
      { id: "2", label: "Vegetarian", value: "vegetarian" },
      { id: "3", label: "Palm oil free", value: "palm-oil-free" },
    ],
  },
}
