import type { Meta, StoryObj } from "@storybook/web-components"
import { html } from "lit"
import "./community-links"

const meta: Meta = {
  title: "Components/Community Links",
  component: "community-links",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => html`<community-links></community-links>`,
}

export const LightTheme: Story = {
  render: () => html`<community-links theme="light"></community-links>`,
}

export const DarkTheme: Story = {
  parameters: {
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#1f2937" }],
    },
  },
  render: () => html`<community-links theme="dark"></community-links>`,
}

export const MobileLayout: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  render: () => html`<community-links></community-links>`,
}
