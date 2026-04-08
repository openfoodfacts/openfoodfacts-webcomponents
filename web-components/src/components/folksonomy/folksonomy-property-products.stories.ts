import "./folksonomy-property-products"
import type { Meta, StoryObj } from "@storybook/web-components-vite"

const meta: Meta = {
  title: "Components/Folksonomy/Property Products",
  component: "folksonomy-property-products",
}
export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {
    propertyName: "ecoscore_grade",
    propertiesUrl: "/properties",
  },
}
