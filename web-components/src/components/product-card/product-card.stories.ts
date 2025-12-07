import type { Meta, StoryObj } from "@storybook/web-components-vite"
import "./product-card"

const meta: Meta = {
  title: "Components/Product Card",
  component: "product-card",
  parameters: {
    layout: "centered",
  },
}
export default meta

type Story = StoryObj

export const Basic: Story = {
  args: {
    product: {
      brands: "Deliciously Ella",
      code: "5060482841565",
      ecoscore_grade: "b",
      image_front_small_url:
        "https://images.openfoodfacts.org/images/products/506/048/284/1565/front_en.38.200.jpg",
      nova_group: 4,
      nutriscore_grade: "b",
      product_name: "Nutty Granola",
      product_type: "food",
      quantity: "380g",
    },
    personalScore: {
      score: 49,
      matchStatus: "poor_match",
      totalWeights: 4,
      totalWeightedScore: 194.6666666666666,
    },
    showMatchTag: true,
  },
}
