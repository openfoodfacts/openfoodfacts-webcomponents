import { Task } from "@lit/task"
import { html, LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"
import { fetchIncompleteNutrientsInsightsByProductCode, insight } from "../../signals/nutrients"
import "./robotoff-nutrients-table"
import { fetchNutrientsTaxonomies } from "../../signals/taxonomies"

@customElement("robotoff-nutrients")
export class RobotoffNutrients extends LitElement {
  @property({ type: String, attribute: "product-code" })
  productCode: string = ""

  private _insightsTask = new Task(this, {
    task: async ([productCode], {}) => {
      if (!productCode) {
        return []
      }

      await Promise.all([
        fetchIncompleteNutrientsInsightsByProductCode(productCode),
        fetchNutrientsTaxonomies(),
      ])
      return insight(productCode).get()
    },
    args: () => [this.productCode],
  })

  override render() {
    return this._insightsTask.render({
      pending: () => html`<off-wb-loader></off-wb-loader>`,
      complete: (insight) => {
        if (!insight) {
          return html`<p>No insights</p>`
        }
        return html`<div>
          <robotoff-nutrients-table .insight="${insight}"></robotoff-nutrients-table>
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
