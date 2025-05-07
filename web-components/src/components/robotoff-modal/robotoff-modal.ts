import { LitElement, html, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { EventState, EventType, RobotoffContributionType } from "../../constants"
import { BasicStateEventDetail } from "../../types"
import "../shared/modal"
import "../robotoff-ingredients/robotoff-ingredients"
import "../robotoff-nutrients/robotoff-nutrients"
import "../robotoff-question/robotoff-question"
import { localized, msg } from "@lit/localize"

@customElement("robotoff-modal")
@localized()
export class RobotoffModal extends LitElement {
  @property({ type: Object, attribute: "robotoff-contribution-type" })
  robotoffContributionType?: RobotoffContributionType

  @property({ type: String, attribute: "product-code" })
  productCode?: string

  @state()
  isLoading = false

  @state()
  showSuccessMessage = false

  get isOpen() {
    return Boolean(this.robotoffContributionType)
  }

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

  onSuccessEvent() {
    const robotoffContributionType = this.robotoffContributionType!
    this.showSuccessMessage = true
    setTimeout(() => {
      this.showSuccessMessage = false
      this.sendSuccessEvent(robotoffContributionType)
    }, 1000)
  }

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

  closeModal() {
    this.dispatchEvent(new CustomEvent(EventType.CLOSE))
  }
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
