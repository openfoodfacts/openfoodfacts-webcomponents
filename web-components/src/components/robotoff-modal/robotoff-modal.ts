import { LitElement, html, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { EventState, EventType, RobotoffContributionType } from "../../constants"
import { BasicStateEventDetail } from "../../types"
import "../shared/modal"
import "../robotoff-ingredients/robotoff-ingredients"
import "../robotoff-nutrients/robotoff-nutrients"
import "../robotoff-question/robotoff-question"
import { localized, msg } from "@lit/localize"

/**
 * The `robotoff-modal` component is a web component that displays a modal for contributing to product information.
 * It handles different types of contributions (ingredients, nutrients, and questions) and manages the modal's state.
 *
 * @fires success - Dispatched when a contribution is successfully made.
 * @fires close - Dispatched when the modal is closed.
 *
 * @example
 * ```html
 * <robotoff-modal product-code="123456789" robotoff-contribution-type="ingredients"></robotoff-modal>
 * ```
 */

@customElement("robotoff-modal")
@localized()
export class RobotoffModal extends LitElement {
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
  showSuccessMessage = false

  /**
   * Returns whether the modal is open based on the `robotoffContributionType`.
   */
  get isOpen() {
    return Boolean(this.robotoffContributionType)
  }

  /**
   * Dispatches a success event when a contribution is successfully made.
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
   * Handles the success event by showing a success message and dispatching a success event.
   */
  onSuccessEvent() {
    const robotoffContributionType = this.robotoffContributionType!
    this.showSuccessMessage = true
    setTimeout(() => {
      this.showSuccessMessage = false
      this.sendSuccessEvent(robotoffContributionType)
    }, 1000)
  }

  /**
   * Handles state changes from child components.
   * @param {CustomEvent<BasicStateEventDetail>} event - The state change event.
   */
  onStateChange(event: CustomEvent<BasicStateEventDetail>) {
    switch (event.detail.state) {
      case EventState.ANNOTATED:
        this.onSuccessEvent()
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
      case RobotoffContributionType.INGREDIENTS:
        return html`<robotoff-ingredients
          product-code="${this.productCode}"
          @ingredients-state="${this.onStateChange}"
        ></robotoff-ingredients>`
      case RobotoffContributionType.NUTRIENTS:
        return html`<robotoff-nutrients
          product-code="${this.productCode}"
          @nutrient-state="${this.onStateChange}"
        ></robotoff-nutrients>`
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
  renderSuccessMessage() {
    return html`<slot name="success-message"
      ><div class="success-message">${msg("Thanks for your contribution!")}</div></slot
    >`
  }

  override render() {
    const contentModal = this.showSuccessMessage
      ? this.renderSuccessMessage()
      : this.renderModalContent()

    return html`
      <modal-component
        ?is-open="${this.isOpen}"
        ?is-loading="${this.isLoading}"
        @close="${this.closeModal}"
      >
        ${contentModal}
      </modal-component>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-modal": RobotoffModal
  }
}
