import { LitElement, html, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import {
  Insight,
  InsightDatum,
  InsightAnnotatationData,
  InsightAnnotationType,
  InsightAnnotationAnswer,
} from "../../types/robotoff"
import { localized, msg } from "@lit/localize"
import { getTaxonomyNameByIdAndLang } from "../../signals/taxonomies"
import { getLocale } from "../../localization"
import {
  getPossibleUnits,
  NUTRIENT_SERVING_SIZE_KEY,
  NUTRIENT_SUFFIX,
  NUTRIENT_UNIT_NAME_PREFIX,
} from "../../utils/nutrients"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { EventType } from "../../constants"

export type FormatedNutrients = {
  "100g": Record<string, InsightDatum>
  serving: Record<string, InsightDatum>
  keys: string[]
  servingSize?: InsightDatum
}

@customElement("robotoff-nutrients-table")
@localized()
export class RobotoffNutrientsTable extends LitElement {
  static override styles = [...getButtonClasses([ButtonType.Chocolate])]
  @property({ type: Object })
  insight?: Insight

  getFormatedNutrients(): FormatedNutrients {
    const nutrients: FormatedNutrients = {
      servingSize: undefined,
      keys: [],
      "100g": {},
      serving: {},
    }
    const keysSet = new Set<string>()

    Object.entries(this.insight!.data.nutrients).forEach(([key, value]) => {
      let nutrientKey
      if (key.endsWith(NUTRIENT_SUFFIX[InsightAnnotationType.CENTGRAMS])) {
        nutrientKey = key.replace(NUTRIENT_SUFFIX[InsightAnnotationType.CENTGRAMS], "")
        nutrients[InsightAnnotationType.CENTGRAMS][nutrientKey] = value
        keysSet.add(nutrientKey)
      } else if (key.endsWith(NUTRIENT_SUFFIX[InsightAnnotationType.SERVING])) {
        nutrientKey = key.replace(NUTRIENT_SUFFIX[InsightAnnotationType.SERVING], "")
        nutrients[InsightAnnotationType.SERVING][nutrientKey] = value
      } else if (key === NUTRIENT_SERVING_SIZE_KEY) {
        nutrients.servingSize = value
        return
      } else {
        console.log("Unknown nutrient key", key, value)
        return
      }
      keysSet.add(nutrientKey)
    })

    nutrients.keys = Array.from(keysSet)
    return nutrients
  }

  /**
   * Render the inputs for the given nutrient key and column
   * @param nutrients - The nutrients to render
   * @returns
   */
  renderRows(nutrients: FormatedNutrients) {
    return nutrients.keys.map((key) => {
      const label = getTaxonomyNameByIdAndLang(key, getLocale())
      return html`
        <tr>
          <th scope="row">${label}</th>
          <td>
            ${this.renderInputs(
              key,
              InsightAnnotationType.CENTGRAMS,
              nutrients[InsightAnnotationType.CENTGRAMS][key]
            )}
          </td>
          <td>
            ${this.renderInputs(
              key,
              InsightAnnotationType.SERVING,
              nutrients[InsightAnnotationType.SERVING][key]
            )}
          </td>
        </tr>
      `
    })
  }

  getInputValueName = (key: string, column: InsightAnnotationType) => `${key}_${column}`
  getInputUnitName = (key: string, column: InsightAnnotationType) =>
    `${NUTRIENT_UNIT_NAME_PREFIX}${this.getInputValueName(key, column)}`

  /**
   * Render the inputs for the given key and column.
   * We use a method instead a component to have input in form data when submitting.
   * @param key The key of the nutrient.
   * @param column The column of the nutrient.
   * @param nutrient The nutrient to render.
   * @returns The rendered inputs.
   */
  renderUnit(key: string, column: InsightAnnotationType, nutrient: Pick<InsightDatum, "unit">) {
    const possibleUnits = getPossibleUnits(key, nutrient.unit)
    const inputName = this.getInputUnitName(key, column)
    if (possibleUnits.length > 1) {
      return html`
        <select name=${inputName}>
          ${possibleUnits.map(
            (unit) =>
              html`<option value="${unit}" ?selected=${unit === nutrient.unit}>${unit}</option>`
          )}
        </select>
      `
    } else {
      return (
        html`<input type="hidden" name="${inputName}" value="${possibleUnits[0]}" />
          ${possibleUnits[0]}` ?? nothing
      )
    }
  }

  /**
   * Render the inputs for the given key and column.
   * We use a method instead a component to have input in form data when submitting.
   * @param key The key of the nutrient.
   * @param column The column of the nutrient.
   * @param nutrient The nutrient to render.
   * @returns The inputs for the given key and column.
   */
  renderInputs(
    key: string,
    column: InsightAnnotationType,
    nutrient: Pick<InsightDatum, "value" | "unit">
  ) {
    const inputName = this.getInputValueName(key, column)
    return html`
      <span>
        <input
          type="number"
          name="${inputName}"
          value="${nutrient.value}"
          title="${msg("value")}"
        />
      </span>
      <span title=${msg("unit")}> ${this.renderUnit(key, column, nutrient)} </span>
    `
  }

  emitSubmitEvent(insightAnnotationAnswer: InsightAnnotationAnswer) {
    this.dispatchEvent(
      new CustomEvent(EventType.SUBMIT, {
        bubbles: true,
        composed: true,
        detail: insightAnnotationAnswer,
      })
    )
  }

  onSubmit(event: SubmitEvent) {
    event.preventDefault()
    event.stopPropagation()
    const column = event.submitter?.getAttribute("data-key") as InsightAnnotationType
    if (!column) {
      console.error("No column found in submitter")
      return
    }

    const formData = new FormData(event.target as HTMLFormElement)

    const nutrientAnotationForm: InsightAnnotatationData = {}

    for (const [key, value] of formData.entries()) {
      if (!key.endsWith(column)) {
        continue
      }
      let name = key
      let isUnit = false
      if (name.startsWith(NUTRIENT_UNIT_NAME_PREFIX)) {
        isUnit = true
        name = name.replace(NUTRIENT_UNIT_NAME_PREFIX, "")
      }

      if (name.startsWith("serving_size") {
        name = name.replace(NUTRIENT_SUFFIX[column], "")
      }

      if (!nutrientAnotationForm[name]) {
        nutrientAnotationForm[name] = {
          value: "",
          unit: null,
        }
      }

      nutrientAnotationForm[name][isUnit ? "unit" : "value"] = value as string
    }

    this.emitSubmitEvent({
      type: column,
      data: nutrientAnotationForm,
      insightId: this.insight!.id,
    })
  }

  override render() {
    const nutrients = this.getFormatedNutrients()
    const inputServingSizeName = this.getInputValueName(
      "serving_size",
      InsightAnnotationType.SERVING
    )
    return html`
      <form @submit=${this.onSubmit}>
        <table>
          <thead>
            <tr>
              <th scope="col">${msg("Nutrients")}</th>
              <th scope="col">100g</th>
              <th scope="col">
                <span>${msg("Serving size")}</span>
                <input
                  name=${inputServingSizeName}
                  type="text"
                  value=${nutrients.servingSize?.value}
                  required="true"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            ${this.renderRows(nutrients)}
            <tr>
              <td></td>
              <td>
                <button
                  type="submit"
                  class="button chocolate-button"
                  data-key=${InsightAnnotationType.CENTGRAMS}
                >
                  Valider
                </button>
              </td>
              <td>
                <button
                  type="submit"
                  class="button chocolate-button"
                  data-key=${InsightAnnotationType.SERVING}
                >
                  Valider
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-nutrients-table": RobotoffNutrientsTable
  }
}
