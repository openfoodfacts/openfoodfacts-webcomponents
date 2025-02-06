import { LitElement, html, css } from "lit"
import { customElement, property } from "lit/decorators.js"
import {
  currentQuestionIndex,
  fetchQuestionsByProductCode,
  numberOfQuestions,
  questions,
} from "../signals/questions"
import { Task } from "@lit/task"

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("hunger-question")
export class HungerQuestion extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `

  @property({ attribute: "product-id" }) productId: string = ""

  private _questionsTask = new Task(this, {
    task: async ([productId], {}) => {
      if (!productId) {
        return []
      }
      await fetchQuestionsByProductCode(productId)
      return questions.get()
    },
    args: () => [this.productId],
  })

  override render() {
    return this._questionsTask.render({
      pending: () => html`<div>Loading...</div>`,
      complete: (questionsList) => {
        const index = currentQuestionIndex.get() ?? 0
        const question = questionsList[index]
        return html`
          <div>
            <h2>Question ${index + 1} / ${numberOfQuestions.get()}</h2>
            <hunger-question-form .question=${question}></hunger-question-form>
          </div>
        `
      },
      error: (error) => html`<div>Error: ${error}</div>`,
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hunger-question": HungerQuestion
  }
}
