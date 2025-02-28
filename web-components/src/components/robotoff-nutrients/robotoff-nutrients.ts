import { Task } from "@lit/task"
import { css, html, LitElement, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { annotateNutrients, fetchInsightsByProductCode, insight } from "../../signals/nutrients"
import "./robotoff-nutrients-table"
import { fetchNutrientsTaxonomies } from "../../signals/taxonomies"
import { Insight, InsightAnnotationAnswer } from "../../types/robotoff"
import { BASE } from "../../styles/base"
import { msg } from "@lit/localize"
import { robotoffConfiguration } from "../../signals/robotoff"

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

      .image-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 1rem;
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
   * Do we show the image of the product by default
   */
  @property({ type: Boolean, attribute: "show-image" })
  showImage = true

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

  hideImage() {
    this.showImage = false
  }
  displayImage() {
    this.showImage = true
  }

  renderImage(insight: Insight) {
    if (!insight?.source_image) {
      return nothing
    }
    const imgUrl = `${robotoffConfiguration.getItem("imgUrl")}${insight.source_image}`
    return html`
      <div>
        <div class="flex justify-center">
          ${this.showImage
            ? html`<button class="link-button" @click=${this.hideImage}>
                ${msg("Hide image")}
              </button>`
            : html`<button class="link-button is-closed" @click=${this.displayImage}>
                ${msg("Voir image")}
              </button>`}
        </div>

        ${this.showImage
          ? html`<div class="image-wrapper">
              <zoomable-image src=${imgUrl} .size="${{ height: "400px" }}" />
            </div>`
          : nothing}
      </div>
    `
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
          ${this.renderImage(insight as Insight)}
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
