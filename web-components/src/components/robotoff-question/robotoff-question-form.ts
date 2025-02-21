import { LitElement, html, css, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { Question, QuestionAnnotationAnswer } from "../../types/robotoff"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { EventType } from "../../constants"
import { classMap } from "lit/directives/class-map.js"
import { answerQuestion } from "../../signals/questions"
import "../buttons/zoom-unzoom-button"
import { SignalWatcher } from "@lit-labs/signals"
/**
 * RobotoffQuestionForm component
 * It displays a form to answer a question about a product.
 * @element robotoff-question-form
 * @fires {EventType.SUBMIT} - When the form is submitted
 */
@customElement("robotoff-question-form")
export class RobotoffQuestionForm extends SignalWatcher(LitElement) {
  static override styles = [
    ...getButtonClasses([ButtonType.Cappucino, ButtonType.White, ButtonType.LINK]),
    css`
      :host {
        display: block;
        max-width: 800px;
      }

      .question-form {
        display: flex;
        align-items: center;
        flex-direction: column;
        gap: 1rem;
      }

      .question-img-wrapper {
        position: relative;
        justify-content: center;
        width: 100px;
      }

      .question-img-wrapper.enlarged {
        width: 100%;
        max-width: 400px;
      }

      .question-img-wrapper img {
        width: 100%;
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
   * The image size is zoomed or not.
   */
  @state()
  private _zoomed: boolean = false

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

  private _toggleImageSize() {
    this._zoomed = !this._zoomed
  }

  private _renderImage() {
    if (!this.question?.source_image_url) {
      return nothing
    }

    return html`<div>
      <div
        class=${classMap({
          "question-img-wrapper": true,
          enlarged: this._zoomed,
        })}
      >
        <div>
          <img .src=${this.question?.source_image_url} alt="Product image" />
        </div>

        <div class="img-button-wrapper">
          <zoom-unzoom-button
            .zoomed=${this._zoomed}
            @click=${this._toggleImageSize}
          ></zoom-unzoom-button>
        </div>
      </div>
    </div> `
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
            class="button cappucino-button"
            @click="${(event: Event) => this._annotateProduct(event, "1")}"
          >
            Yes
          </button>
          <button
            class="button cappucino-button"
            @click="${(event: Event) => this._annotateProduct(event, "0")}"
          >
            No
          </button>
          <button
            class="button white-button"
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
