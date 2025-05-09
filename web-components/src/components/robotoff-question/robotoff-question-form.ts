import { LitElement, html, css, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import { Question, AnnotationAnswer } from "../../types/robotoff"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { EventType } from "../../constants"
import { answerQuestion } from "../../signals/questions"
import "../buttons/zoom-unzoom-button"
import { SignalWatcher } from "@lit-labs/signals"
import { localized, msg } from "@lit/localize"
import { FULL_WIDTH } from "../../styles/utils"
/**
 * RobotoffQuestionForm component
 * It displays a form to answer a question about a product.
 * @element robotoff-question-form
 * @fires {EventType.SUBMIT} - When the form is submitted
 */
@customElement("robotoff-question-form")
@localized()
export class RobotoffQuestionForm extends SignalWatcher(LitElement) {
  static override styles = [
    ...getButtonClasses([
      ButtonType.White,
      ButtonType.Cappucino,
      ButtonType.Success,
      ButtonType.Danger,
      ButtonType.LINK,
    ]),
    FULL_WIDTH,
    css`
      :host {
        display: block;
      }

      .question-form {
        display: flex;
        align-items: center;
        flex-direction: column;
      }

      .image-wrapper {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
      }

      .img-button-wrapper {
        position: absolute;
        bottom: 0.5rem;
        right: 0.5rem;
        display: flex;
        justify-content: center;
      }
      .expand-button {
        margin-top: 1rem;
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
          height: "200px",
          width: "200px",
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
  private _annotateProduct = async (event: Event, value: AnnotationAnswer) => {
    answerQuestion(this.question?.insight_id!, value)
    this.emitEventClick(event, value)
  }

  expandImage() {
    this.isImageExpanded = true
  }

  private _renderImage() {
    if (!this.question?.source_image_url) {
      return nothing
    }

    return html`
      <div class="image-wrapper">
        <zoomable-image
          src=${this.question?.source_image_url}
          .size=${this.imageSize}
          @click="${this.expandImage}"
          ?show-buttons="${this.isImageExpanded}"
        ></zoomable-image>
        ${this.isImageExpanded
          ? nothing
          : html`<div>
              <button class="expand-button button white-button small" @click="${this.expandImage}">
                ${msg("Expand image")}
              </button>
            </div>`}
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
        ${this._renderImage()}
        <div>
          <p></p>
          <button
            class="button success-button"
            @click="${(event: Event) => this._annotateProduct(event, AnnotationAnswer.ACCEPT)}"
          >
            ${msg("Yes")}
          </button>
          <button
            class="button danger-button"
            @click="${(event: Event) => this._annotateProduct(event, AnnotationAnswer.REFUSE)}"
          >
            ${msg("No")}
          </button>
          <button
            class="button cappucino-button"
            @click="${(event: Event) => this._annotateProduct(event, AnnotationAnswer.SKIP)}"
          >
            ${msg("Skip")}
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
