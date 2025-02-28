import { LitElement, css, html, nothing } from "lit"
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
import { INPUT, SELECT } from "../../styles/form"
import { FLEX } from "../../styles/utils"
import "../shared/zoomable-image"

// A handy data structure for nutrients information
export type FormatedNutrients = {
  // nutrients per 100g
  "100g": Record<string, InsightDatum>
  // nutrients per serving
  serving: Record<string, InsightDatum>
  // all nutrients present per 100g or serving
  keys: string[]
  servingSize?: InsightDatum
}
/**
 * Variable store all size of the input to calculate the width of serving size input
 */
const INPUT_VALUE_MAX_SIZE = 4
const INPUT_UNIT_MAX_SIZE = 4
const INPUTS_GAP = 0.5
const SERVING_MAX_SIZE = INPUT_VALUE_MAX_SIZE + INPUT_UNIT_MAX_SIZE + INPUTS_GAP

/**
 * Display a table of nutrients for a given product
 * @element robotoff-nutrients-table
 * @fires submit - when the user submit the form
 */
@customElement("robotoff-nutrients-table")
@localized()
export class RobotoffNutrientsTable extends LitElement {
  static override styles = [
    ...getButtonClasses([ButtonType.Chocolate, ButtonType.LINK]),
    SELECT,
    INPUT,
    FLEX,
    css`
      table th {
        font-weight: normal;
        font-size: 0.8rem;
      }
      table th[scope="col"] {
        vertical-align: top;
        font-weight: bold;
      }

      table th:first-child {
        max-width: 6rem;
      }
      table td,
      table th[scope="row"] {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
      }
      .inputs-wrapper {
        gap: ${INPUTS_GAP}rem;
      }
      .serving-size-wrapper {
        gap: 0.3rem;
      }
      .serving-size-wrapper input {
        width: ${SERVING_MAX_SIZE}rem;
        text-align: center;
        box-sizing: border-box;
      }

      table .input-number {
        width: ${INPUT_VALUE_MAX_SIZE}rem;
        box-sizing: border-box;
      }

      table .select {
        box-sizing: border-box;
        height: 100%;
        font-size: 0.7rem;
        width: ${INPUT_UNIT_MAX_SIZE}rem !important;
      }

      table .submit-row td {
        padding-top: 0.5rem;
      }
    `,
  ]

  /**
   * The insight to edit
   */
  @property({ type: Object })
  insight?: Insight

  /**
   * Get the nutrients in a formated way to manipulate it easily in the template
   * @returns {FormatedNutrients}
   */
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
            <div class="flex inputs-wrapper">
              ${this.renderInputs(
                key,
                InsightAnnotationType.CENTGRAMS,
                nutrients[InsightAnnotationType.CENTGRAMS][key],
                1
              )}
            </div>
          </td>
          <td>
            <div class="flex inputs-wrapper">
              ${this.renderInputs(
                key,
                InsightAnnotationType.SERVING,
                nutrients[InsightAnnotationType.SERVING][key],
                2
              )}
            </div>
          </td>
        </tr>
      `
    })
  }

  getInputValueName = (key: string, column: InsightAnnotationType) => `${key}_${column}`
  getInputUnitName = (key: string, column: InsightAnnotationType) =>
    `${NUTRIENT_UNIT_NAME_PREFIX}${this.getInputValueName(key, column)}`

  /**
   * Render the unit input for the given key and column.
   * We use a method instead a component to have input in form data when submitting.
   * @param key The key of the nutrient.
   * @param column The column of the nutrient.
   * @param nutrient The nutrient to render.
   * @returns The rendered inputs.
   */
  renderUnit(
    key: string,
    column: InsightAnnotationType,
    nutrient: Pick<InsightDatum, "unit"> | undefined,
    tabIndex: 1 | 2
  ) {
    const possibleUnits = getPossibleUnits(key, nutrient?.unit)
    const inputName = this.getInputUnitName(key, column)
    if (possibleUnits.length > 1) {
      return html`
        <select name=${inputName} class="select" tabindex=${tabIndex}>
          ${possibleUnits.map(
            (unit) =>
              html`<option value="${unit}" ?selected=${unit === nutrient?.unit}>${unit}</option>`
          )}
        </select>
      `
    } else {
      return possibleUnits[0]
        ? html`<input type="hidden" name="${inputName}" value="${possibleUnits[0]}" />
            <select name=${inputName} class="select" disabled>
              <option value="${possibleUnits[0]!}" selected>${possibleUnits[0]}</option>
            </select>`
        : nothing
    }
  }

  /**
   * Render the nutrient value inputs for the given key and column.
   * We use a method instead a component to have input in form data when submitting.
   * @param key The key of the nutrient.
   * @param column The column of the nutrient.
   * @param nutrient The nutrient to render.
   * @returns The inputs for the given key and column.
   */
  renderInputs(
    key: string,
    column: InsightAnnotationType,
    nutrient: Pick<InsightDatum, "value" | "unit"> | undefined,
    tabIndex: 1 | 2
  ) {
    const inputName = this.getInputValueName(key, column)
    return html`
      <span>
        <input
          type="number"
          name="${inputName}"
          value="${nutrient?.value}"
          title="${msg("value")}"
          class="input-number"
          step="0.01"
          min="0"
          tabindex=${tabIndex}
        />
      </span>
      <span title=${msg("unit")}> ${this.renderUnit(key, column, nutrient, tabIndex)} </span>
    `
  }

  /**
   * Emit a custom submit event to submit the form data well formatted.
   *
   * @param insightAnnotationAnswer
   */
  emitSubmitEvent(insightAnnotationAnswer: InsightAnnotationAnswer) {
    this.dispatchEvent(
      new CustomEvent(EventType.SUBMIT, {
        bubbles: true,
        composed: true,
        detail: insightAnnotationAnswer,
      })
    )
  }

  /**
   * Handle the form submission.
   * It will emit a custom submit event to submit the form data well formatted.
   * It only sent the data for the column that was submitted.
   * @param event
   */
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
      // We only want the data for the column that was submitted
      if (!key.endsWith(column)) {
        continue
      }
      let name = key
      let isUnit = false
      if (name.startsWith(NUTRIENT_UNIT_NAME_PREFIX)) {
        isUnit = true
        name = name.replace(NUTRIENT_UNIT_NAME_PREFIX, "")
      }
      // Remove the suffix for serving_size
      // We add suffix to match the column condition
      if (name.startsWith("serving_size")) {
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
              <th scope="col" class="flex flex-col align-center serving-size-wrapper">
                <span>${msg("Serving size:")}</span>
                <input
                  class="input"
                  name=${inputServingSizeName}
                  type="text"
                  value=${nutrients.servingSize?.value}
                  required="true"
                  tabindex="2"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            ${this.renderRows(nutrients)}
            <tr class="submit-row">
              <td></td>
              <td>
                <div class="flex justify-center">
                  <button
                    type="submit"
                    class="button chocolate-button"
                    data-key=${InsightAnnotationType.CENTGRAMS}
                    tabindex="1"
                  >
                    Valider
                  </button>
                </div>
              </td>
              <td>
              <div class="flex justify-center">

                <button
                  type="submit"
                  class="button chocolate-button"
                  data-key=${InsightAnnotationType.SERVING}
                  tabindex="2"
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
