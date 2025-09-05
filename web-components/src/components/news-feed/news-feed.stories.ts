import type { Meta, StoryObj } from "@storybook/web-components-vite"
import "./news-feed"

const meta: Meta = {
  title: "Components/News Feed",
  component: "news-feed",
}
export default meta

type Story = StoryObj

export const Android: Story = {
  args: {
    url: "https://raw.githubusercontent.com/openfoodfacts/smooth-app_assets/refs/heads/main/prod/tagline/android/main.json",
  },
}

export const iOS: Story = {
  name: "iOS",
  args: {
    url: "https://raw.githubusercontent.com/openfoodfacts/smooth-app_assets/refs/heads/main/prod/tagline/ios/main.json",
  },
}
