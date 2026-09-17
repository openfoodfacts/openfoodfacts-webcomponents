import "./donation-banner"

import { html } from "lit"
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

// ---------------------------------------------------------------------------
// C2 variants. The feed here is the live one; its `donation_campaign_2026`
// item carries no `en` translation yet, so these render the built-in copy
// until the sibling feed ticket adds one.
// ---------------------------------------------------------------------------

const FEED =
  "https://raw.githubusercontent.com/openfoodfacts/smooth-app_assets/refs/heads/main/prod/tagline/web/main.json"

const variantArgs = (variant: string) =>
  html`<donation-banner
    variant=${variant}
    news-url=${FEED}
    news-id="donation_campaign_2026"
    amounts="3,5,10"
    donate-url="https://world.openfoodfacts.org/donate-to-open-food-facts"
    current-year="2026"
  ></donation-banner>`

// `subscribe()` overwrites `isDarkMode` as soon as the element connects, so a
// dark story sets it back after mount rather than as a plain arg.
const darkPlay = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const el = canvasElement.querySelector("donation-banner") as any
  el.isDarkMode = true
  el.requestUpdate()
}

export const Campaign: Story = {
  render: () => variantArgs("campaign"),
}

export const CampaignDark: Story = {
  render: () => variantArgs("campaign"),
  play: darkPlay,
}

export const Strip: Story = {
  render: () => variantArgs("strip"),
}

export const StripDark: Story = {
  render: () => variantArgs("strip"),
  play: darkPlay,
}

export const Sheet: Story = {
  render: () => variantArgs("sheet"),
}

export const SheetDark: Story = {
  render: () => variantArgs("sheet"),
  play: darkPlay,
}

export const Bar: Story = {
  render: () => variantArgs("bar"),
}

export const BarDark: Story = {
  render: () => variantArgs("bar"),
  play: darkPlay,
}

/** French headline + fine print, no feed - exercises the built-in copy path. */
export const CampaignFrance: Story = {
  render: () =>
    html`<donation-banner
      variant="campaign"
      amounts="3,5,10"
      country="fr"
      donate-url="https://world.openfoodfacts.org/donate-to-open-food-facts"
      current-year="2026"
    ></donation-banner>`,
}

/** No `news-id`: built-in copy, no figures, no meter. */
export const CampaignNoFeed: Story = {
  render: () =>
    html`<donation-banner
      variant="campaign"
      amounts="3,5,10"
      donate-url="https://world.openfoodfacts.org/donate-to-open-food-facts"
      current-year="2026"
    ></donation-banner>`,
}
