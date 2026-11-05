import { render } from "lit"
import { describe, expect, it } from "vitest"
import { ZoomableImage } from "./zoomable-image"

const renderButtons = (template: ReturnType<ZoomableImage["renderCenterButton"]>) => {
  const container = document.createElement("div")
  render(template, container)
  return container.querySelectorAll<HTMLButtonElement>("button")
}

describe("zoomable-image", () => {
  it("keeps image editing controls from submitting a host form", () => {
    const image = new ZoomableImage()
    const cropState = image as unknown as { cropResult: string }
    cropState.cropResult = "data:image/png;base64,crop"

    const buttons = [
      ...renderButtons(image.renderCenterButton()),
      ...renderButtons(image.renderRotateButtons()),
      ...renderButtons(image.renderCropMode()),
    ]

    expect(buttons).toHaveLength(7)
    buttons.forEach((button) => {
      expect(button.type).toBe("button")
    })
  })
})
