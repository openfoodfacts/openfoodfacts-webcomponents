import type { Meta, StoryObj } from "@storybook/web-components-vite"
import { html } from "lit"
import "./donation-meter"

const meta: Meta = {
  title: "Components/Donation Meter",
  component: "donation-meter",
}
export default meta

type Story = StoryObj

export const FromTheNewsFeed: Story = {
  args: {
    url: "https://raw.githubusercontent.com/openfoodfacts/smooth-app_assets/refs/heads/main/prod/tagline/web/main.json",
  },
}

export const Figures: Story = {
  render: () =>
    html`<donation-meter
      .funding=${{ raised: 44156, goal: 170000, currency: "EUR" }}
    ></donation-meter>`,
}

export const Funded: Story = {
  render: () =>
    html`<donation-meter
      .funding=${{ raised: 180000, goal: 170000, currency: "EUR" }}
    ></donation-meter>`,
}
