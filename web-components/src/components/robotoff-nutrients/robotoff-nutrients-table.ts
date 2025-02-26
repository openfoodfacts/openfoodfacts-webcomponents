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
import { robotoffConfiguration } from "../../signals/robotoff"
import "../shared/zoomable-image"

export type FormatedNutrients = {
  "100g": Record<string, InsightDatum>
  serving: Record<string, InsightDatum>
  keys: string[]
  servingSize?: InsightDatum
}
const INPUT_VALUE_MAX_SIZE = 4
const INPUT_UNIT_MAX_SIZE = 4
const INPUTS_GAP = 0.5
const SERVING_MAX_SIZE = INPUT_VALUE_MAX_SIZE + INPUT_UNIT_MAX_SIZE + INPUTS_GAP

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

      .link-button {
        margin-bottom: 1rem;
      }

      .image-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 1rem;
      }
    `,
  ]

  @property({ type: Object })
  insight?: Insight

  @property({ type: Boolean, attribute: "show-image" })
  showImage = true

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

  hideImage() {
    this.showImage = false
  }
  displayImage() {
    this.showImage = true
  }

  renderImage() {
    if (!this.insight?.source_image) {
      return nothing
    }
    const imgUrl = `${robotoffConfiguration.getItem("imgUrl")}${this.insight.source_image}`
    return html`
      <div>
        <div class="flex justify-center">
          ${this.showImage
            ? html`<button class="link-button" @click=${this.hideImage}>
                ${msg("Hide image")}
              </button>`
            : html`<button class="link-button" @click=${this.displayImage}>
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
   * Render the inputs for the given key and column.
   * We use a method instead a component to have input in form data when submitting.
   * @param key The key of the nutrient.
   * @param column The column of the nutrient.
   * @param nutrient The nutrient to render.
   * @returns The rendered inputs.
   */
  renderUnit(
    key: string,
    column: InsightAnnotationType,
    nutrient: Pick<InsightDatum, "unit">,
    tabIndex: 1 | 2
  ) {
    const possibleUnits = getPossibleUnits(key, nutrient.unit)
    const inputName = this.getInputUnitName(key, column)
    if (possibleUnits.length > 1) {
      return html`
        <select name=${inputName} class="select" tabindex=${tabIndex}>
          ${possibleUnits.map(
            (unit) =>
              html`<option value="${unit}" ?selected=${unit === nutrient.unit}>${unit}</option>`
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
    nutrient: Pick<InsightDatum, "value" | "unit">,
    tabIndex: 1 | 2
  ) {
    const inputName = this.getInputValueName(key, column)
    return html`
      <span>
        <input
          type="number"
          name="${inputName}"
          value="${nutrient.value}"
          title="${msg("value")}"
          class="input-number"
          step="0.01"
          min="0.01"
          tabindex=${tabIndex}
        />
      </span>
      <span title=${msg("unit")}> ${this.renderUnit(key, column, nutrient, tabIndex)} </span>
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
        ${this.renderImage()}
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
