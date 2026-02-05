import type { Meta, StoryObj } from "@storybook/web-components-vite"
import "./nutripatrol-card"

const meta: Meta = {
  title: "Components/NutriPatrol Card",
  component: "nutripatrol-card",
  parameters: { layout: "centered" },
}

export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {
    flags: [
      {
        id: 1,
        type: "low-quality-image",
        confidence: 0.8,
        reason: "Picture is not clear enough to read the nutrition facts",
        created_at: "2025-01-01",
      },
    ],
    showActions: true,
  },
}
