import "./folksonomy-properties"
import type { Meta, StoryObj } from "@storybook/web-components-vite"

const meta: Meta = {
  title: "Components/Folksonomy/Properties",
  component: "folksonomy-properties",
}
export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {
    propertyBasePath: "/property/",
  },
}
