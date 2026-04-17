import type { Meta, StoryObj } from "@storybook/web-components-vite"
import { html } from "lit"
import { ref, createRef } from "lit/directives/ref.js"
import "./nutripatrol-flag-form"
import type { NutriPatrolFlagForm } from "./nutripatrol-flag-form"

const meta: Meta<NutriPatrolFlagForm> = {
  title: "Components/Nutri Patrol",
  component: "nutripatrol-flag-form",
  argTypes: {
    barcode: { control: "text" },
    type: {
      control: { type: "select" },
      options: ["product", "image", "search"],
    },
    flavor: {
      control: { type: "select" },
      options: ["off", "obf", "opff", "opf", "off-pro"],
    },
    open: { control: "boolean" },
    userId: { control: "text" },
    url: { control: "text" },
    imageId: { control: "text" },
  },
}
export default meta

type Story = StoryObj<NutriPatrolFlagForm>

export const FlagProduct: Story = {
  args: {
    barcode: "6410405143648",
    type: "product",
    flavor: "off",
    open: true,
    userId: "test_user_story",
    url: "https://world.openfoodfacts.org/product/6410405143648",
  },
  render: (args) => {
    const formRef = createRef<NutriPatrolFlagForm>()

    return html`
      <button @click=${() => formRef.value?.setAttribute("open", "")}>Open Flag Form</button>
      <nutripatrol-flag-form
        ${ref(formRef)}
        .barcode=${args.barcode}
        .type=${args.type}
        .flavor=${args.flavor}
        ?open=${args.open}
        user-id=${String(args.userId ?? "")}
        .url=${args.url}
        .imageId=${args.imageId ?? ""}
      ></nutripatrol-flag-form>
    `
  },
}

export const FlagImage: Story = {
  args: {
    ...FlagProduct.args,
    barcode: "3017620422003",
    type: "image",
    imageId: "front_fr",
    url: "https://image.openfoodfacts.org/images/products/301/762/042/2003/149.400.jpg",
  },
  render: FlagProduct.render,
}

export const FlagSearch: Story = {
  args: {
    ...FlagProduct.args,
    type: "search",
    url: "https://world.openfoodfacts.org/cgi/search.pl?search_terms=nutella",
  },
  render: FlagProduct.render,
}
