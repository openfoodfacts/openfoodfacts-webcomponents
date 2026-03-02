import type { Meta, StoryObj } from "@storybook/web-components-vite"
import type { FlagCreate } from "@openfoodfacts/openfoodfacts-nodejs"
import "./nutripatrol-card"

const meta: Meta = {
  title: "Components/NutriPatrol Card",
  component: "nutripatrol-card",
  parameters: { layout: "centered" },
}

export default meta

type Story = StoryObj<{
  flags: FlagCreate[]
  showActions: boolean
}>

export const Basic: Story = {
  args: {
    flags: [
      {
        barcode: null,
        type: "image",
        url: "",
        user_id: "ramneet_test",
        source: "web",
        confidence: 0.4,
        image_id: null,
        flavor: "off",
        reason: "low-quality-image",
        comment: "The image is blurry and unreadable",
        created_at: "2026-01-08",
      },
      {
        barcode: null,
        type: "image",
        url: "",
        user_id: "ramneet_test",
        source: "web",
        confidence: 0.9,
        image_id: null,
        flavor: "off",
        reason: "Inappropriate",
        comment: "The image contains inappropriate content",
        created_at: "2026-02-01",
      },
    ],
    showActions: true,
  },
}
