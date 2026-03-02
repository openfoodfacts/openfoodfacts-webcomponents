import type { Meta, StoryObj } from "@storybook/web-components-vite"
import "./folksonomy-editor"
import "./folksonomy-properties"

const meta: Meta = {
  title: "Components/Folksonomy Editor",
  component: "folksonomy-editor",
}
export default meta
type Story = StoryObj

export const Basic: Story = {
  args: {},
}
export const Properties: StoryObj = {
  render: () => {
    const el = document.createElement("folksonomy-properties")
    return el
  },
}