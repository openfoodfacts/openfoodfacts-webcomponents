import "./image-redact"

import { html } from "lit"
import type { Meta, StoryObj } from "@storybook/web-components-vite"
import type { ImageRedact } from "./image-redact"
import type { ImageRedactResult, NormalizedBoundingBox } from "../../types/crops"

const SAMPLE_IMAGE = "https://images.openfoodfacts.org/images/products/301/762/042/2003/1.jpg"

const SAMPLE_BOXES: NormalizedBoundingBox[] = [
  { x_min: 0.1, y_min: 0.1, x_max: 0.4, y_max: 0.2 },
  { x_min: 0.5, y_min: 0.6, x_max: 0.9, y_max: 0.7 },
]

const showResult = (story: HTMLElement, result: ImageRedactResult) => {
  const output = story.querySelector("#redact-output")!
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
  title: "Components/Image Redact",
  component: "image-redact",
  args: {
    src: SAMPLE_IMAGE,
    "show-buttons": true,
  },
}
export default meta

type Story = StoryObj

/**
 * Draw boxes, click one to move / resize / remove it, then "Validate" fires the `redact` event.
 */
export const Basic: Story = {
  render: (args) => html`
    <div>
      <image-redact
        src=${args.src}
        ?show-buttons=${args["show-buttons"]}
        @redact=${(event: CustomEvent<ImageRedactResult>) =>
          showResult((event.target as HTMLElement).parentElement!, event.detail)}
      ></image-redact>
      <div id="redact-output"></div>
    </div>
  `,
}

/**
 * Initial boxes (e.g. from predictions), that the user can edit.
 */
export const WithInitialBoxes: Story = {
  render: (args) => html`
    <div>
      <image-redact
        src=${args.src}
        .boxes=${SAMPLE_BOXES}
        ?show-buttons=${args["show-buttons"]}
        @redact=${(event: CustomEvent<ImageRedactResult>) =>
          showResult((event.target as HTMLElement).parentElement!, event.detail)}
      ></image-redact>
      <div id="redact-output"></div>
    </div>
  `,
}

/**
 * Built-in validate button hidden: the parent calls `getRedaction()` from its own button.
 */
export const HiddenActions: Story = {
  render: (args) => html`
    <div>
      <image-redact
        src=${args.src}
        .boxes=${SAMPLE_BOXES}
        ?show-buttons=${args["show-buttons"]}
        hide-actions
      ></image-redact>
      <button
        @click=${async (event: Event) => {
          const story = (event.target as HTMLElement).parentElement!
          const redact = story.querySelector("image-redact") as ImageRedact
          showResult(story, await redact.getRedaction())
        }}
      >
        Save
      </button>
      <div id="redact-output"></div>
    </div>
  `,
}
