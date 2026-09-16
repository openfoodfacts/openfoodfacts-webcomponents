import "./donation-banner"

import type { Meta, StoryObj } from "@storybook/web-components-vite"

const meta: Meta = {
  title: "Components/Donation Banner",
  component: "donation-banner",
}
export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {},
}

export const WithCampaignFigures: Story = {
  args: {
    newsUrl:
      "https://raw.githubusercontent.com/openfoodfacts/smooth-app_assets/refs/heads/main/prod/tagline/web/main.json",
  },
}
