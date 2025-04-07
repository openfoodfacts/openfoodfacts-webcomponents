import { LitElement, html, css, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
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
      ButtonType.White,
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
        align-items: center;
        flex-direction: column;
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
   * Is the image expanded
   * @type {boolean}
   * @default false
   */
  @property({ type: Boolean, attribute: "is-image-expanded" })
  isImageExpanded = false

  get imageSize() {
    return this.isImageExpanded
      ? { height: "350px", width: "100%", "max-width": "350px" }
      : {
          height: "100px",
          width: "100px",
        }
  }

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

  toggleIsImageExpanded() {
    this.isImageExpanded = !this.isImageExpanded
  }

  private _renderImage() {
    if (!this.question?.source_image_url) {
      return nothing
    }

    return html`
      <div>
        <div>
          <zoomable-image
            src=${this.question?.source_image_url}
            .size="${this.imageSize}"
          ></zoomable-image>
        </div>
        <div>
          <button class="button white-button small" @click="${this.toggleIsImageExpanded}">
            ${this.isImageExpanded ? msg("Reduce image") : msg("Expand image")}
          </button>
        </div>
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
        <div>${this._renderImage()}</div>
        <div>
          <p></p>
          <button
            class="button success-button"
            @click="${(event: Event) => this._annotateProduct(event, "1")}"
          >
            Yes
          </button>
          <button
            class="button danger-button"
            @click="${(event: Event) => this._annotateProduct(event, "0")}"
          >
            No
          </button>
          <button
            class="button cappucino-button"
            @click="${(event: Event) => this._annotateProduct(event, "-1")}"
          >
            Skip
          </button>
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
