import { Task } from "@lit/task"
import { html, LitElement } from "lit"
import { customElement, property } from "lit/decorators"
import { fetchIncompleteNutrientsInsightsByProductCode, insights } from "../../signals/insights"

@customElement("robotoff-nutrients")
export class RobotoffNutrients extends LitElement {
  @property({ type: String, attribute: "product-code" })
  productCode: string = ""

  private _insightsTask = new Task(this, {
    task: async ([productCode], {}) => {
      if (!productCode) {
        return []
      }

      await fetchIncompleteNutrientsInsightsByProductCode(productCode)
      return insights(productCode).get()
    },
    args: () => [this.productCode],
  })

  override render() {
    return this._insightsTask.render({
      pending: () => html`<off-wb-loader></off-wb-loader>`,
      complete: (insights) => html`<p>${insights.length}</p>`,
      error: (error) => html`<p>Error: ${error}</p>`,
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-nutrients": RobotoffNutrients
  }
}
