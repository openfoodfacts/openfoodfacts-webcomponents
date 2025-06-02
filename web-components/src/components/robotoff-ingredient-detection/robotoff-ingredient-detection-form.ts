/**
 * RobotoffIngredientDetectionForm Component
 *
 * This component handles the form part of ingredient detection, including
 * the crop interaction and answer buttons for the Robotoff application.
 *
 * @element robotoff-ingredient-detection-form
 */

import { LitElement, css, html, nothing } from "lit"
import { customElement, property, query, state } from "lit/decorators.js"
import "../shared/zoomable-image"
import {
  IngredientDetectionInsight,
  IngredientDetectionAnnotationData,
  AnnotationAnswer,
} from "../../types/robotoff"
import { getRobotoffImageUrl } from "../../signals/robotoff"
import { localized, msg } from "@lit/localize"
import { FLEX } from "../../styles/utils"
import { CropResult } from "../../types"
import * as ZoomableImage from "../shared/zoomable-image"
import {
  cropImageBoundingBoxToRobotoffBoundingBox,
  robotoffBoundingBoxToCropImageBoundingBox,
} from "../../utils/crop"
import { EventType } from "../../constants"
import "../shared/loading-button"
import { triggerSubmit } from "../../utils"
import "../shared/text-corrector-highlight"

@customElement("robotoff-ingredient-detection-form")
@localized()
export class RobotoffIngredientDetectionForm extends LitElement {
  static override styles = [
    css`
      .button-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
        width: 100%;
      }
      .button-container loading-button {
        flex-grow: 1;
        flex-shrink: 0;
      }

      .crop-button-container {
        display: flex;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
      }
    `,
    FLEX,
  ]

  /**
   * The form element
   * @type {HTMLFormElement}
   */
  @query("form")
  form?: HTMLFormElement

  /**
   * Whether the form is loading
   * @type {boolean}
   */
  @property({ type: String, reflect: true })
  loading?: AnnotationAnswer

  /**
   * The insight to display and interact with
   * @type {IngredientDetectionInsight}
   */
  @property({ type: Object, reflect: true })
  insight?: IngredientDetectionInsight

  /**
   * Current crop mode
   * @type {ZoomableImage.CropMode}
   */
  @state()
  cropMode: ZoomableImage.CropMode = ZoomableImage.CropMode.CROP_READ

  @state()
  image?: HTMLImageElement

  @state()
  data: Partial<IngredientDetectionAnnotationData> = {
    annotation: undefined,
    bounding_box: undefined,
  }

  @state()
  isEditingIngredients = false

  get isLoading() {
    return Boolean(this.loading) || this.cropMode === ZoomableImage.CropMode.CROP
  }

  get boundingBox() {
    if (this.image) {
      console.log("image", this.image.naturalWidth, this.image.naturalHeight)
    }
    const robotoffBoundingBox = this.data?.bounding_box
    const boundingBox =
      robotoffBoundingBox && this.image
        ? robotoffBoundingBoxToCropImageBoundingBox(
            robotoffBoundingBox,
            this.image.naturalWidth,
            this.image.naturalHeight
          )
        : { x: 0, y: 0, width: 0, height: 0 }

    return boundingBox
  }

  /**
   * Override the attributeChangedCallback to load the image and data when the insight changes
   * @param {string} name - The name of the attribute that changed
   * @param {string} oldval - The old value of the attribute
   * @param {string} newval - The new value of the attribute
   */
  override attributeChangedCallback(name: string, oldval: string, newval: string) {
    super.attributeChangedCallback(name, oldval, newval)
    if (name === "insight") {
      this.onInsightChange()
    }
  }

  onInsightChange() {
    // Load the image when the insight changes
    this.loadImage()

    this.isEditingIngredients = false
    // Set the data from the insight
    this.data = {
      bounding_box: this.insight?.data.bounding_box,
      annotation: this.insight?.data.text,
    }
  }

  override connectedCallback() {
    super.connectedCallback()
    // Ensure the image is loaded when the component is connected to the DOM
    this.loadImage()
  }

  async loadImage() {
    this.image = undefined
    if (!this.insight?.source_image) {
      return
    }
    this.image = new Image()
    this.image.onload = () => {
      this.requestUpdate()
    }
    this.image.src = getRobotoffImageUrl(this.insight.source_image!)
  }

  /**
   * Renders the crop answer buttons
   * @returns {TemplateResult}
   */
  renderCropAnswerButtons() {
    return html`
      <div class="flex flex-col align-center">
        <div class="button-container">
          <loading-button
            css-classes="button success-button"
            type="submit"
            .loading=${this.loading === AnnotationAnswer.ACCEPT}
            .disabled=${this.isLoading}
            @click="${() => triggerSubmit(this.form!)}"
            label="${msg("Validate")}"
          ></loading-button>
          <loading-button
            css-classes="button danger-button"
            .loading=${this.loading === AnnotationAnswer.REFUSE}
            .disabled=${this.isLoading}
            @click="${() => this.answer(AnnotationAnswer.REFUSE)}"
            label="${msg("Invalidate")}"
          ></loading-button>
          <loading-button
            css-classes="button white-button"
            .loading=${this.loading === AnnotationAnswer.SKIP}
            .disabled=${this.isLoading}
            @click="${() => this.answer(AnnotationAnswer.SKIP)}"
            label="${msg("Skip")}"
          ></loading-button>
        </div>
      </div>
    `
  }

  /**
   * Renders the component
   * @returns {TemplateResult}
   */
  override render() {
    if (!this.insight) {
      return html`<div>No insight provided</div>`
    }

    return this.renderInsight(this.insight)
  }

  onSubmit(event: Event) {
    event.preventDefault()

    const formData = new FormData(event.target as HTMLFormElement)
    const data = Object.fromEntries(formData.entries())
    console.log(data)
    this.answer(
      AnnotationAnswer.ACCEPT_AND_ADD_DATA,
      data as unknown as IngredientDetectionAnnotationData
    )
    console.log("submit")
  }

  renderCropButtons() {
    if (this.cropMode === ZoomableImage.CropMode.CROP) {
      const isLoading = Boolean(this.loading)
      return html`
            <loading-button
              css-classes="button cappucino-button"
              .disabled=${isLoading}
              @click="${this.toggleCropMode}"
              label="${msg("Cancel crop")}"
            ></loading-button>
          </div>
        `
    }
    return html`
      <loading-button
        css-classes="button chocolate-button"
        .disabled=${this.isLoading}
        @click="${this.toggleCropMode}"
        label="${msg("I'll propose a better crop")}"
      ></loading-button>
    `
  }

  toggleEditIngredients() {
    this.isEditingIngredients = !this.isEditingIngredients
  }

  renderEditIngredients(insight: IngredientDetectionInsight) {
    let content
    if (this.isEditingIngredients) {
      content = html`<text-corrector-highlight
        heading-level="h4"
        original=${insight.data.text}
        .value=${this.data.annotation}
      ></text-corrector-highlight>`
    } else {
      content = html`
        <p>${insight.data.text}</p>
        <loading-button
          css-classes="button chocolate-button"
          .disabled=${this.isLoading}
          @click="${this.toggleEditIngredients}"
          label="${msg("I'll edit the ingredients")}"
        ></loading-button>
      `
    }

    return html`
      <h3>${msg("Ingredients :")}</h3>
      ${content}
    `
  }

  /**
   * Renders an ingredient detection insight
   * @param {IngredientDetectionInsight} insight - The insight to render
   * @returns {TemplateResult}
   */
  private renderInsight(insight: IngredientDetectionInsight) {
    if (!insight.source_image) {
      return nothing
    }
    const imgUrl = getRobotoffImageUrl(insight.source_image)

    return html`
      <form @submit=${this.onSubmit}>
        <div>
          <h2>${msg("Help us for ingredients")}</h2>
          <p>${msg("Help us validate the ingredient list of the product.")}</p>
          <zoomable-image
            src=${imgUrl}
            .size="${{ height: "500px", width: "100%" }}"
            crop-mode=${this.cropMode}
            .boundingBox=${this.boundingBox}
            show-buttons
            @submit=${this.onCropSave}
          ></zoomable-image>
          <div class="crop-button-container">${this.renderCropButtons()}</div>
        </div>
        <div>${this.renderEditIngredients(insight)}</div>
        ${this.renderCropAnswerButtons()}
      </form>
    `
  }

  /**
   * Toggles the crop mode
   */
  toggleCropMode() {
    this.cropMode =
      this.cropMode === ZoomableImage.CropMode.CROP
        ? ZoomableImage.CropMode.CROP_READ
        : ZoomableImage.CropMode.CROP
  }

  updateData(data: Partial<IngredientDetectionAnnotationData>) {
    this.data = { ...this.data, ...data }
  }
  /**
   * Handles the crop save event
   * @param {CustomEvent<CropResult>} event - The crop save event
   */
  onCropSave(event: CustomEvent<CropResult>) {
    if (!this.image) {
      return
    }
    const robotoffBoundingBox = cropImageBoundingBoxToRobotoffBoundingBox(
      event.detail.newBoundingBox,
      this.image.width,
      this.image.height
    )

    this.updateData({ bounding_box: robotoffBoundingBox })
    this.toggleCropMode()
  }

  /**
   * Handles the answer event
   * @param {AnnotationAnswer} value - The answer value
   * @param {IngredientDetectionAnnotationData} [data] - The annotation data for the answer
   */
  async answer(value: AnnotationAnswer, data?: IngredientDetectionAnnotationData) {
    // Emit the submit event with the answer details
    this.dispatchEvent(
      new CustomEvent(EventType.SUBMIT, {
        bubbles: true,
        composed: true,
        detail: {
          insightId: this.insight!.id,
          value,
          data,
        },
      })
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-ingredient-detection-form": RobotoffIngredientDetectionForm
  }
}
