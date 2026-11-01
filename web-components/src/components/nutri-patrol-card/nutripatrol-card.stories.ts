import type { Meta, StoryObj } from "@storybook/web-components-vite"
import type { Flag } from "@openfoodfacts/openfoodfacts-nodejs"
import "./nutripatrol-card"

const meta: Meta = {
  title: "Components/NutriPatrol Card",
  component: "nutripatrol-card",
  parameters: { layout: "centered" },
}

export default meta

type Story = StoryObj<{
  flags: Flag[]
}>

export const Basic: Story = {
  args: {
    flags: [
      {
        id: 1,
        barcode: "828738739292",
        type: "image",
        ticket_id: 2,
        device_id: "",
        url: "",
        user_id: "ramneet_test",
        source: "web",
        confidence: 0.4,
        image_id: "3",
        flavor: "off",
        reason: "low-quality-image",
        comment: "The image is blurry and unreadable",
        created_at: "2026-01-08",
      },
      {
        id: 2,
        barcode: "778929282",
        type: "image",
        ticket_id: 0,
        device_id: "",
        url: "",
        user_id: "ramneet_test",
        source: "web",
        confidence: 0.9,
        image_id: "8",
        flavor: "off",
        reason: "Inappropriate",
        comment: "The image contains inappropriate content",
        created_at: "2026-02-01",
      },
      {
        id: 3,
        barcode: "828738739292",
        type: "product",
        ticket_id: 2,
        device_id: "",
        url: "",
        user_id: "ramneet_test",
        source: "web",
        confidence: 0.7,
        image_id: null,
        flavor: "off",
        reason: "Misleading health claims",
        comment:
          "The image contains misleading health claims that are not supported by scientific evidence",
        created_at: "2026-01-08",
      },
      {
        id: 4,
        barcode: "778929282",
        type: "image",
        ticket_id: 0,
        device_id: "",
        url: "",
        user_id: "ramneet_test",
        source: "web",
        confidence: 0.2,
        image_id: "2",
        flavor: "off",
        reason: "Outdated packaging",
        comment: "The image shows outdated packaging that does not reflect the current product",
        created_at: "2026-02-01",
      },
    ],
  },
}
