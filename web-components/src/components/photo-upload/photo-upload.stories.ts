import type { Meta, StoryObj } from "@storybook/web-components-vite"
import { html } from "lit"
import "./photo-upload"
import type { PhotoUpload } from "./photo-upload"

const meta: Meta<PhotoUpload> = {
  title: "Components/Photo Upload",
  component: "photo-upload",
  argTypes: {
    uploadType: {
      control: { type: "select" },
      options: ["image", "front", "ingredients", "nutrition", "packaging"],
    },
    language: { control: "text" },
    uiLanguage: { control: "text" },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
    barcode: { control: "text" },
    maxFileSize: { control: "number" },
  },
}
export default meta

type Story = StoryObj<PhotoUpload>

export const BasicUpload: Story = {
  args: {
    uploadType: "image",
    language: "en",
    disabled: false,
    loading: false,
  },
  render: (args) => html`
    <photo-upload
      .uploadType=${args.uploadType}
      .language=${args.language}
      .uiLanguage=${args.uiLanguage}
      ?disabled=${args.disabled}
      ?loading=${args.loading}
      .barcode=${args.barcode}
      .maxFileSize=${args.maxFileSize ?? 15 * 1024 * 1024}
    ></photo-upload>
  `,
}

export const FrontPhoto: Story = {
  args: {
    ...BasicUpload.args,
    uploadType: "front",
  },
  render: BasicUpload.render,
}

export const IngredientsPhoto: Story = {
  args: {
    ...BasicUpload.args,
    uploadType: "ingredients",
    language: "fr",
  },
  render: BasicUpload.render,
}

export const NutritionPhoto: Story = {
  args: {
    ...BasicUpload.args,
    uploadType: "nutrition",
    language: "hi",
  },
  render: BasicUpload.render,
}

export const PackagingPhoto: Story = {
  args: {
    ...BasicUpload.args,
    uploadType: "packaging",
    language: "de",
  },
  render: BasicUpload.render,
}

export const LoadingState: Story = {
  args: {
    ...BasicUpload.args,
    loading: true,
  },
  render: BasicUpload.render,
}

export const DisabledState: Story = {
  args: {
    ...BasicUpload.args,
    disabled: true,
  },
  render: BasicUpload.render,
}

export const FrenchUI: Story = {
  args: {
    ...BasicUpload.args,
    uiLanguage: "fr",
    language: "fr",
  },
  render: BasicUpload.render,
}
