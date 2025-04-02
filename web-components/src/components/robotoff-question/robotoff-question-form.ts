import { LitElement, html, css, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { Question, QuestionAnnotationAnswer } from "../../types/robotoff"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { EventType } from "../../constants"
import { answerQuestion } from "../../signals/questions"
import "../buttons/zoom-unzoom-button"
import { SignalWatcher } from "@lit-labs/signals"
import { msg } from "@lit/localize"
/**
 * RobotoffQuestionForm component
 * It displays a form to answer a question about a product.
 * @element robotoff-question-form
 * @fires {EventType.SUBMIT} - When the form is submitted
 */
@customElement("robotoff-question-form")
export class RobotoffQuestionForm extends SignalWatcher(LitElement) {
  static override styles = [
    ...getButtonClasses([
      ButtonType.Cappucino,
      ButtonType.Success,
      ButtonType.Danger,
      ButtonType.LINK,
    ]),
    css`
      :host {
        display: block;
      }

      .question-form {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }

      .question-form-content {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1rem;
      }

      .question-form-buttons {
        position: sticky;
        bottom: 1rem;
        z-index: 1;
      }
      .img-button-wrapper {
        position: absolute;
        bottom: 0.5rem;
        right: 0.5rem;
        display: flex;
        justify-content: center;
      }
    `,
  ]

  /**
   * The question to display.
   */
  @property({ type: Object, reflect: true })
  question?: Question

  /**
   * Show the image or not.
   */
  @property({ type: Boolean })
  showImage?: boolean = true

  /**
   * State to manage the display of the image.
   */
  @state()
  displayImage = true

  /**
   * Emit an event submit when the user clicks on a button.
   * It stops the propagation of the event to avoid the click event on the parent.
   */
  private emitEventClick = (event: Event, value: string) => {
    event.stopPropagation()
    const click = new CustomEvent(EventType.SUBMIT, {
      detail: { value },
      bubbles: true,
      composed: true,
    })

    this.dispatchEvent(click)
  }
  private _annotateProduct = async (event: Event, value: QuestionAnnotationAnswer) => {
    answerQuestion(this.question?.insight_id!, value)
    this.emitEventClick(event, value)
  }

  private _toggleImage = () => {
    this.displayImage = !this.displayImage
  }

  private _renderImage() {
    if (!this.showImage || !this.question?.source_image_url) {
      return nothing
    }

    return html`
      <div>
        ${this.displayImage
          ? html`
              <div>
                <zoomable-image
                  src=${this.question?.source_image_url}
                  .size="${{ height: "350px", width: "100%", "max-width": "300px" }}"
                ></zoomable-image>
              </div>
            `
          : nothing}
        <!-- <div>
          <button class="link-button small" @click="${this._toggleImage}">
            ${this.displayImage ? msg("Hide") : msg("Show")} image
          </button>
        </div> -->
      </div>
    `
  }

  renderButtons() {
    return html`
      <div class="question-form-buttons">
        <button
          class="button success-button"
          @click="${(event: Event) => this._annotateProduct(event, "1")}"
        >
          ${msg("Yes")}
        </button>
        <button
          class="button danger-button"
          @click="${(event: Event) => this._annotateProduct(event, "0")}"
        >
          ${msg("No")}
        </button>
        <button
          class="button cappucino-button"
          @click="${(event: Event) => this._annotateProduct(event, "-1")}"
        >
          ${msg("Skip")}
        </button>
      </div>
    `
  }

  override render() {
    if (!this.question) {
      return html`<div>No question</div>`
    }

    return html`
      <div class="question-form">
        <p>${this.question.question} <strong> ${this.question.value} </strong></p>
        <div class="question-form-content">
          <div>${this._renderImage()}</div>
          ${this.renderButtons()}
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-question-form": RobotoffQuestionForm
  }
}
