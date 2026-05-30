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
      { label: "Vegan", value: "vegan" },
      { label: "Vegetarian", value: "vegetarian" },
      { label: "Palm oil free", value: "palm-oil-free" },
    ],
  },
}

export const Hierarchical: Story = {
  args: {
    placeholder: "Search for a category...",
    suggestions: [
      {
        label: "Apple",
        value: "apple",
        children: [
          { label: "Gala Apple", value: "gala-apple" },
          { label: "Macintosh Apple", value: "macintosh-apple" },
        ],
      },
      {
        label: "Banana",
        value: "banana",
        children: [
          { label: "Plantain", value: "plantain" },
          { label: "Red Banana", value: "red-banana" },
        ],
      },
    ],
  },
}
