import { LitElement, html, css, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import { Question, AnnotationAnswer } from "../../types/robotoff"
import { EventType } from "../../constants"
import { answerQuestion } from "../../signals/questions"
import { SignalWatcher } from "@lit-labs/signals"
import { localized, msg } from "@lit/localize"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { LoadingWithTimeoutMixin } from "../../mixins/loading-with-timeout-mixin"
import { FULL_WIDTH } from "../../styles/utils"
import "../shared/loading-button"
import "../buttons/zoom-unzoom-button"
/**
 * RobotoffQuestionForm component
 * It displays a form to answer a question about a product.
 * @element robotoff-question-form
 * @fires {EventType.SUBMIT} - When the form is submitted
 */
@customElement("robotoff-question-form")
@localized()
export class RobotoffQuestionForm extends SignalWatcher(LoadingWithTimeoutMixin(LitElement)) {
  static override styles = [
    ...getButtonClasses([ButtonType.White]),
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
      .buttons-row {
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
    this.showLoading(value)
    await answerQuestion(this.question?.insight_id!, value)
    await this.hideLoading()
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

  private renderButtons() {
    const isLoading = Boolean(this.loading)
    return html`
      <div class="buttons-row">
        <loading-button
          css-classes="button success-button"
          .loading=${this.loading === AnnotationAnswer.ACCEPT}
          .disabled=${isLoading}
          @click="${(event: Event) => this._annotateProduct(event, AnnotationAnswer.ACCEPT)}"
          label="${msg("Yes")}"
        ></loading-button>
        <loading-button
          css-classes="button danger-button"
          .loading=${this.loading === AnnotationAnswer.REFUSE}
          .disabled=${isLoading}
          @click="${(event: Event) => this._annotateProduct(event, AnnotationAnswer.REFUSE)}"
          label="${msg("No")}"
        ></loading-button>
        <loading-button
          css-classes="button cappucino-button"
          .loading=${this.loading === AnnotationAnswer.SKIP}
          .disabled=${isLoading}
          @click="${(event: Event) => this._annotateProduct(event, AnnotationAnswer.SKIP)}"
          label="${msg("Skip")}"
        ></loading-button>
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
        ${this.renderButtons()}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-question-form": RobotoffQuestionForm
  }
}
