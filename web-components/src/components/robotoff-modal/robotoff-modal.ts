import { LitElement, html, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import { EventState, EventType, RobotoffContributionType } from "../../constants"
import { BasicStateEventDetail } from "../../types"
import "../shared/modal"
import "../robotoff-ingredients/robotoff-ingredients"
import "../robotoff-nutrients/robotoff-nutrients"
import "../robotoff-question/robotoff-question"

@customElement("robotoff-modal")
export class RobotoffModal extends LitElement {
  @property({ type: Object, attribute: "robotoff-contribution-type" })
  robotoffContributionType?: RobotoffContributionType

  @property({ type: String, attribute: "product-code" })
  productCode?: string

  get isOpen() {
    return Boolean(this.robotoffContributionType)
  }

  onStateChange(event: BasicStateEventDetail) {
    if (event.state === EventState.ANNOTATED) {
      this.dispatchEvent(
        new CustomEvent(EventType.SUCCESS, {
          bubbles: true,
          composed: true,
          detail: {
            type: this.robotoffContributionType,
          },
        })
      )
      this.robotoffContributionType = undefined
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

  override render() {
    return html`
      <modal-component ?is-open="${this.isOpen}">
        ${this.robotoffContributionType} ${this.renderModalContent()}
      </modal-component>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-modal": RobotoffModal
  }
}
