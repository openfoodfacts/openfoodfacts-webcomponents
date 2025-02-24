import { LitElement, html, css, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import {
  Insight,
  InsightDatum,
  NutrientAnotationForm,
  NutrientAnotationFormData,
} from "../../types/robotoff"
import { localized, msg } from "@lit/localize"
import { getTaxonomyNameByIdAndLang } from "../../signals/taxonomies"
import { getLocale } from "../../localization"
import {
  getPossibleUnits,
  NUTRIENT_SERVING_SIZE_KEY,
  NUTRIENT_SUFFIX,
  NUTRIENT_UNIT_NAME_PREFIX,
  NutrientColumn,
} from "../../utils/nutrients"
import { ButtonType, getButtonClasses } from "../../styles/buttons"

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
      if (key.endsWith(NUTRIENT_SUFFIX[NutrientColumn.CENTGRAMS])) {
        nutrientKey = key.replace(NUTRIENT_SUFFIX[NutrientColumn.CENTGRAMS], "")
        nutrients[NutrientColumn.CENTGRAMS][nutrientKey] = value
        keysSet.add(nutrientKey)
      } else if (key.endsWith(NUTRIENT_SUFFIX[NutrientColumn.SERVING])) {
        nutrientKey = key.replace(NUTRIENT_SUFFIX[NutrientColumn.SERVING], "")
        nutrients[NutrientColumn.SERVING][nutrientKey] = value
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

  renderColumns(nutrients: FormatedNutrients) {
    return nutrients.keys.map((key) => {
      const label = getTaxonomyNameByIdAndLang(key, getLocale())
      return html`
        <tr>
          <th scope="row">${label}</th>
          <td>
            ${this.renderInputs(
              key,
              NutrientColumn.CENTGRAMS,
              nutrients[NutrientColumn.CENTGRAMS][key]
            )}
          </td>
          <td>
            ${this.renderInputs(
              key,
              NutrientColumn.SERVING,
              nutrients[NutrientColumn.SERVING][key]
            )}
          </td>
        </tr>
      `
    })
  }

  getInputValueName = (key: string, column: NutrientColumn) => `${key}_${column}`
  getInputUnitName = (key: string, column: NutrientColumn) =>
    `${NUTRIENT_UNIT_NAME_PREFIX}${this.getInputValueName(key, column)}`

  /**
   * Render the inputs for the given key and column.
   * We use a method instead a component to have input in form data when submitting.
   * @param key The key of the nutrient.
   * @param column The column of the nutrient.
   * @param nutrient The nutrient to render.
   * @returns The rendered inputs.
   */
  renderUnit(key: string, column: NutrientColumn, nutrient: Pick<InsightDatum, "unit">) {
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
    column: NutrientColumn,
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

  onSubmit(event: SubmitEvent) {
    event.preventDefault()
    event.stopPropagation()
    const column = event.submitter?.getAttribute("data-key") as NutrientColumn
    if (!column) {
      console.error("No column found in submitter")
      return
    }

    const formData = new FormData(event.target as HTMLFormElement)

    const nutrientAnotationForm: NutrientAnotationForm = {}

    for (const [key, value] of formData.entries()) {
      if (!key.endsWith(column)) {
        continue
      }
      let name = key.replace(NUTRIENT_SUFFIX[column], "")
      let isUnit = false
      if (name.startsWith(NUTRIENT_UNIT_NAME_PREFIX)) {
        isUnit = true
        name = name.replace(NUTRIENT_UNIT_NAME_PREFIX, "")
      }
      if (!nutrientAnotationForm[name]) {
        nutrientAnotationForm[name] = {
          value: "",
          unit: null,
        }
      }
      nutrientAnotationForm[name][isUnit ? "unit" : "value"] = value as string
    }

    console.log(nutrientAnotationForm)
  }

  override render() {
    const nutrients = this.getFormatedNutrients()
    const inputServingSizeName = this.getInputValueName("serving_size", NutrientColumn.SERVING)
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
            ${this.renderColumns(nutrients)}
            <tr>
              <td></td>
              <td>
                <button
                  type="submit"
                  class="button chocolate-button"
                  data-key=${NutrientColumn.CENTGRAMS}
                >
                  Valider
                </button>
              </td>
              <td>
                <button
                  type="submit"
                  class="button chocolate-button"
                  data-key=${NutrientColumn.SERVING}
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
