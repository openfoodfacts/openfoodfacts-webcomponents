import "./image-cropper"

import { html } from "lit"
import type { Meta, StoryObj } from "@storybook/web-components-vite"
import type { ImageCropper } from "./image-cropper"
import type { ImageCropperResult } from "../../types/crops"

const SAMPLE_IMAGE = "https://images.openfoodfacts.org/images/products/301/762/042/2003/1.jpg"

const showResult = (story: HTMLElement, result: ImageCropperResult | null) => {
  const output = story.querySelector("#crop-output")!
  if (!result) {
    output.textContent = "No selection"
    return
  }
  output.innerHTML = ""
  const img = document.createElement("img")
  img.src = URL.createObjectURL(result.blob)
  img.style.maxWidth = "100%"
  const pre = document.createElement("pre")
  pre.textContent = JSON.stringify(
    { ...result, blob: { type: result.blob.type, size: result.blob.size } },
    null,
    2
  )
  output.append(img, pre)
}

const meta: Meta = {
  title: "Components/Image Cropper",
  component: "image-cropper",
  args: {
    src: SAMPLE_IMAGE,
    "show-buttons": true,
  },
}
export default meta

type Story = StoryObj

/**
 * Built-in buttons: "Show crop" then "Validate crop" fires the `crop` event.
 */
export const Basic: Story = {
  render: (args) => html`
    <div>
      <image-cropper
        src=${args.src}
        ?show-buttons=${args["show-buttons"]}
        @crop=${(event: CustomEvent<ImageCropperResult>) =>
          showResult((event.target as HTMLElement).parentElement!, event.detail)}
      ></image-cropper>
      <div id="crop-output"></div>
    </div>
  `,
}

/**
 * Built-in buttons hidden: the parent calls `getCrop()` from its own button.
 */
export const HiddenActions: Story = {
  render: (args) => html`
    <div>
      <image-cropper
        src=${args.src}
        ?show-buttons=${args["show-buttons"]}
        hide-actions
      ></image-cropper>
      <button
        @click=${async (event: Event) => {
          const story = (event.target as HTMLElement).parentElement!
          const cropper = story.querySelector("image-cropper") as ImageCropper
          showResult(story, await cropper.getCrop())
        }}
      >
        Save
      </button>
      <div id="crop-output"></div>
    </div>
  `,
}
