import type { Meta, StoryObj } from "@storybook/web-components-vite"
import "./folksonomy-editor"

const meta: Meta = {
  title: "Components/Folksonomy Editor",
  component: "folksonomy-editor",
}
export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {},
}

export const EditMode: Story = {
  args: {
    "page-type": "edit",
    "product-code": "3274080005003",
  },
  render: (args) => {
    const element = document.createElement("folksonomy-editor")
    element.setAttribute("page-type", args["page-type"] as string)
    element.setAttribute("product-code", args["product-code"] as string)

    // Set mock properties synchronously right away (no setTimeout)
    const component = element as any
    component.properties = [
      { key: "Origin", value: "France", version: 1 },
      { key: "Producer", value: "Example Corp", version: 1 },
      { key: "Certification", value: "Organic", version: 2 },
    ]

    return element
  },
}

export const ViewOnlyMode: Story = {
  args: {
    "page-type": "edit",
    "view-only": true,
    "product-code": "3274080005003",
  },
  render: (args) => {
    const element = document.createElement("folksonomy-editor")
    element.setAttribute("page-type", args["page-type"] as string)
    element.setAttribute("product-code", args["product-code"] as string)
    element.setAttribute("view-only", "")

    // Set mock properties synchronously right away (no setTimeout)
    const component = element as any
    component.properties = [
      { key: "Origin", value: "France", version: 1 },
      { key: "Producer", value: "Example Corp", version: 1 },
      { key: "Certification", value: "Organic", version: 2 },
    ]

    return element
  },
}
