import "./image-crop"

import { html } from "lit"
import type { Meta, StoryObj } from "@storybook/web-components-vite"
import type { ImageCrop } from "./image-crop"
import type { ImageCropResult } from "../../types/crops"

const SAMPLE_IMAGE = "https://images.openfoodfacts.org/images/products/301/762/042/2003/1.jpg"

const showResult = (story: HTMLElement, result: ImageCropResult | null) => {
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
  title: "Components/Image Crop",
  component: "image-crop",
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
      <image-crop
        src=${args.src}
        ?show-buttons=${args["show-buttons"]}
        @crop=${(event: CustomEvent<ImageCropResult>) =>
          showResult((event.target as HTMLElement).parentElement!, event.detail)}
      ></image-crop>
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
      <image-crop src=${args.src} ?show-buttons=${args["show-buttons"]} hide-actions></image-crop>
      <button
        @click=${async (event: Event) => {
          const story = (event.target as HTMLElement).parentElement!
          const cropper = story.querySelector("image-crop") as ImageCrop
          showResult(story, await cropper.getCrop())
        }}
      >
        Save
      </button>
      <div id="crop-output"></div>
    </div>
  `,
}
