import { Task } from "@lit/task"
import { css, html, LitElement, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { annotateNutrients, fetchInsightsByProductCode, insight } from "../../signals/nutrients"
import "./robotoff-nutrients-table"
import { fetchNutrientsTaxonomies } from "../../signals/taxonomies"
import { InsightAnnotationAnswer } from "../../types/robotoff"
import { BASE } from "../../styles/base"
import { msg } from "@lit/localize"

/**
 * Robotoff Nutrients component
 * @element robotoff-nutrients
 */
@customElement("robotoff-nutrients")
export class RobotoffNutrients extends LitElement {
  static override styles = [
    BASE,
    css`
      :host {
        max-width: 500px;
      }
      .messages-wrapper {
        margin-left: auto;
        margin-right: auto;
        max-width: 400px;
        text-align: center;
      }
    `,
  ]

  /**
   * The product code to get the insights for
   * @type {string}
   */
  @property({ type: String, attribute: "product-code" })
  productCode: string = ""

  /**
   * Show messages
   * @type {boolean}
   */
  @property({ type: Boolean, attribute: "show-messages" })
  showMessages: boolean = false

  /**
   * Is the form submited
   * @type {boolean}
   */
  @state()
  isSubmited: boolean = false

  /**
   * Show success message
   * @type {boolean}
   */
  @state()
  showSuccessMessage: boolean = false

  /**
   * Task to get the insights for the given product code
   * it will fetch the incomplete nutrients insights and the nutrients taxonomies
   * @type {Task}
   */
  private _insightsTask = new Task(this, {
    task: async ([productCode], {}) => {
      if (!productCode) {
        return []
      }

      await Promise.all([fetchInsightsByProductCode(productCode), fetchNutrientsTaxonomies()])
      return insight(productCode).get()
    },
    args: () => [this.productCode],
  })

  /**
   * Annotate the nutrients insights
   * @param event
   */
  onSubmit = async (event: CustomEvent<InsightAnnotationAnswer>) => {
    await annotateNutrients(event.detail)
    this.isSubmited = true
    this.showSuccessMessage = true
    setTimeout(() => (this.showSuccessMessage = false), 3000)
  }
  /**
   * Render messages
   * @returns {TemplateResult | typeof nothing}
   */
  renderMessages() {
    if (!this.showMessages) {
      return nothing
    }

    if (!this.isSubmited) {
      return msg(
        html`Openfoodfacts lives thanks to its community.<br />
          Can you help us validate nutritional information?`
      )
    }
    if (this.showSuccessMessage) {
      return msg("Thank you for your contribution!")
    }
    return nothing
  }

  override render() {
    return this._insightsTask.render({
      pending: () => html`<off-wb-loader></off-wb-loader>`,
      complete: (insight) => {
        if (!insight) {
          return html`<p>No insights</p>`
        }
        return html`<div>
          <p class="messages-wrapper"><i>${this.renderMessages()}</i></p>
          <robotoff-nutrients-table
            .insight="${insight}"
            @submit="${this.onSubmit}"
          ></robotoff-nutrients-table>
        </div> `
      },
      error: (error) => html`<p>Error: ${error}</p>`,
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-nutrients": RobotoffNutrients
  }
}
