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

// The variant stories read a local fixture instead of the live feed: shaped
// like `prod/tagline/web/main.json` once the sibling feed ticket adds `count`
// and the `en` copy slots, so the figures, the meter and the tier note render.
const FEED_URL = "feed.json"
const FEED = {
  news: {
    donation_banner_2026: {
      translations: { en: { tier_note: "{amount} covers a month of hosting" } },
      raised: 47431,
      goal: 170000,
      currency: "EUR",
      count: 760,
      end_date: "2027-01-31 23:59:59",
    },
  },
  tagline_feed: { default: { news: [{ id: "donation_banner_2026" }] } },
}

const realFetch = window.fetch.bind(window)
const feedLoader = async () => {
  window.fetch = (input, init) =>
    input === FEED_URL
      ? Promise.resolve(
          new Response(JSON.stringify(FEED), { headers: { "Content-Type": "application/json" } })
        )
      : realFetch(input, init)
}

const variantArgs = (variant: string) =>
  html`<donation-banner
    variant=${variant}
    news-url=${FEED_URL}
    news-id="donation_banner_2026"
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
  loaders: [feedLoader],
  render: () => variantArgs("campaign"),
}

export const CampaignDark: Story = {
  loaders: [feedLoader],
  render: () => variantArgs("campaign"),
  play: darkPlay,
}

export const Strip: Story = {
  loaders: [feedLoader],
  render: () => variantArgs("strip"),
}

export const StripDark: Story = {
  loaders: [feedLoader],
  render: () => variantArgs("strip"),
  play: darkPlay,
}

export const Sheet: Story = {
  loaders: [feedLoader],
  render: () => variantArgs("sheet"),
}

export const SheetDark: Story = {
  loaders: [feedLoader],
  render: () => variantArgs("sheet"),
  play: darkPlay,
}

export const Bar: Story = {
  loaders: [feedLoader],
  render: () => variantArgs("bar"),
}

export const BarDark: Story = {
  loaders: [feedLoader],
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
