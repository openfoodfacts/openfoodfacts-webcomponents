import { LitElement, html, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { EventState, EventType, RobotoffContributionType } from "../../constants"
import { BasicStateEventDetail } from "../../types"
import { localized, msg } from "@lit/localize"
import { IS_HIDDEN } from "../../styles/utils"
import { classMap } from "lit/directives/class-map.js"

import "../shared/modal"
import "../robotoff-ingredient-spellcheck/robotoff-ingredient-spellcheck"
import "../robotoff-nutrient-extraction/robotoff-nutrient-extraction"
import "../robotoff-question/robotoff-question"

enum MessageType {
  SUCCESS = "success",
  ANNOTATION_SUCCESS = "annotation-success",
}

/**
 * The `robotoff-modal` component is a web component that displays a modal for contributing to product information.
 * It handles different types of contributions (ingredients, nutrients, and questions) and manages the modal's state.
 *
 * @fires success - Dispatched when a contribution is successfully made.
 * @fires close - Dispatched when the modal is closed.
 *
 * @slot success-message - The slot for the success message.
 * @slot annotated-message - The slot for the annotated message.
 *
 * @example
 * ```html
 * <robotoff-modal product-code="123456789" robotoff-contribution-type="ingredients"></robotoff-modal>
 * ```
 */

@customElement("robotoff-modal")
@localized()
export class RobotoffModal extends LitElement {
  static override styles = [IS_HIDDEN]

  /**
   * The type of contribution being made.
   */
  @property({ type: String, attribute: "robotoff-contribution-type" })
  robotoffContributionType?: RobotoffContributionType

  /**
   * The product code for which the contribution is being made.
   */
  @property({ type: String, attribute: "product-code" })
  productCode: string = ""

  /**
   * Indicates whether the modal is in a loading state.
   */
  @state()
  isLoading = false

  /**
   * Indicates whether the success message should be shown.
   */
  @state()
  showMessage?: MessageType

  /**
   * Returns whether the modal is open based on the `robotoffContributionType`.
   */
  get isOpen() {
    return Boolean(this.robotoffContributionType)
  }

  /**
   * Dispatches a success event when a contribution is successfully made (or skipped).
   * @param {RobotoffContributionType} type - The type of contribution.
   */
  sendSuccessEvent(type: RobotoffContributionType) {
    this.dispatchEvent(
      new CustomEvent(EventType.SUCCESS, {
        bubbles: true,
        composed: true,
        detail: {
          type: type,
        },
      })
    )
  }

  /**
   * Handles the annotated event (meaning all insight have been processed)
   * by showing a success message and dispatching a success event.
   */
  onFinished() {
    const robotoffContributionType = this.robotoffContributionType!
    this.showMessage = MessageType.SUCCESS
    setTimeout(() => {
      if (this.showMessage === MessageType.SUCCESS) {
        this.showMessage = undefined
      }
      this.sendSuccessEvent(robotoffContributionType)
    }, 1000)
  }

  /**
   * Handles the annotated event (meaning one insight has been processed)
   * by showing a success message.
   */
  onAnnotated() {
    this.showMessage = MessageType.ANNOTATION_SUCCESS
    setTimeout(() => {
      if (this.showMessage === MessageType.ANNOTATION_SUCCESS) {
        this.showMessage = undefined
      }
    }, 1000)
  }

  /**
   * Handles state changes from child components.
   * @param {CustomEvent<BasicStateEventDetail>} event - The state change event.
   */
  onStateChange(event: CustomEvent<BasicStateEventDetail>) {
    switch (event.detail.state) {
      // When all insight is annotated, we show a success message
      case EventState.FINISHED:
        this.onFinished()
        break
      case EventState.ANNOTATED:
        this.onAnnotated()
        break
      case EventState.LOADING:
        this.isLoading = true
        break
      case EventState.HAS_DATA:
        this.isLoading = false
        break
      case EventState.NO_DATA:
        this.isLoading = false
        // Send success event if no data to display because we don't want to show the modal again
        this.sendSuccessEvent(this.robotoffContributionType!)
        break
    }
  }

  /**
   * Renders the modal content based on the `robotoffContributionType`.
   */
  renderModalContent() {
    switch (this.robotoffContributionType) {
      case RobotoffContributionType.INGREDIENT_SPELLCHECK:
        return html`<robotoff-ingredient-spellcheck
          product-code="${this.productCode}"
          @ingredients-state="${this.onStateChange}"
        ></robotoff-ingredient-spellcheck>`
      case RobotoffContributionType.NUTRIENT_EXTRACTION:
        return html`<robotoff-nutrient-extraction
          product-code="${this.productCode}"
          @nutrient-state="${this.onStateChange}"
        ></robotoff-nutrient-extraction>`
      case RobotoffContributionType.INGREDIENT_DETECTION:
        return html`<robotoff-ingredient-detection
          product-code="${this.productCode}"
          @ingredient-detection-state="${this.onStateChange}"
        ></robotoff-ingredient-detection>`
      case RobotoffContributionType.QUESTIONS:
        return html`<robotoff-question
          product-code="${this.productCode}"
          @question-state="${this.onStateChange}"
        ></robotoff-question>`
    }
    return nothing
  }

  /**
   * Closes the modal and dispatches a close event.
   */
  closeModal() {
    this.dispatchEvent(new CustomEvent(EventType.CLOSE))
  }

  /**
   * Renders the success message.
   */
  renderMessage() {
    if (!this.showMessage) return nothing
    switch (this.showMessage) {
      case MessageType.SUCCESS:
        return html`<slot name="success-message"
          ><div class="success-message">${msg("Thanks for your contribution!")}</div></slot
        >`
      case MessageType.ANNOTATION_SUCCESS:
        return html`<slot name="annotated-message"
          ><div class="annotated-message">
            ${msg("Saved! Can you help with another one?")}
          </div></slot
        >`
    }
    return nothing
  }

  override render() {
    return html`
      <modal-component
        ?is-open="${this.isOpen}"
        ?is-loading="${this.isLoading}"
        @close="${this.closeModal}"
      >
        ${this.renderMessage()}
        <div class=${classMap({ "is-hidden": Boolean(this.showMessage) })}>
          ${this.renderModalContent()}
        </div>
      </modal-component>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-modal": RobotoffModal
  }
}
