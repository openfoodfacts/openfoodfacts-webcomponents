import { LitElement, css, html, nothing } from "lit"
import { customElement, property, query, state } from "lit/decorators.js"
import {
  NutrientsInsight,
  NutrientInsightDatum,
  InsightAnnotatationData,
  InsightAnnotationSize,
  InsightAnnotationAnswer,
} from "../../types/robotoff"
import { localized, msg, str } from "@lit/localize"
import {
  getTaxonomyNameByIdAndLang,
  getTaxonomyUnitById,
  getTaxonomyNameByLang,
  nutrientTaxonomies,
} from "../../signals/taxonomies"
import { getLocale } from "../../localization"
import {
  getPossibleUnits,
  INSIGHTS_ANNOTATION_SIZE,
  NUTRIENT_SERVING_SIZE_KEY,
  NUTRIENT_SUFFIX,
  NUTRIENT_UNIT_NAME_PREFIX,
  NUTRIENT_UNIT_SUFFIX,
} from "../../utils/nutrients"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { EventType, SELECT_ICON_FILE_NAME, WHITE_SELECT_ICON_FILE_NAME } from "../../constants"
import { INPUT, SELECT } from "../../styles/form"
import { FLEX } from "../../styles/utils"
import { backgroundImage } from "../../directives/background-image"
import { ALERT } from "../../styles/alert"
import { NutrimentsProductType } from "../../types/openfoodfacts"
import { GREEN } from "../../utils/colors"
import { initDebounce, setValueAndParentsObjectIfNotExists } from "../../utils"
import { nutrientsOrderByCountryCode, sortKeysByNutrientsOrder } from "../../signals/openfoodfacts"
import { countryCode } from "../../signals/app"

import "../shared/autocomplete-input"
import "../icons/suggestion"
import "../icons/add"
import "../icons/eye-visible"

import "../icons/eye-invisible"
import { AutocompleteInputChangeEvent, AutocompleteSuggestionSelectEvent } from "../../types"
export const ALLOWED_SPECIAL_VALUES = ["", "-", "traces"]

export type FormatedNutrimentData = {
  value: string
  unit: string
}

// A handy data structure for nutrients information
export type FormatedNutrients = {
  // nutrients per 100g
  "100g": Record<string, NutrientInsightDatum>
  // nutrients per serving
  serving: Record<string, FormatedNutrimentData>
  // all nutrients present per 100g or serving
  keys: string[]

  servingSize?: string

  robotoff: {
    servingSize?: NutrientInsightDatum

    // nutrients per 100g
    "100g": Record<string, NutrientInsightDatum>
    // nutrients per serving
    serving: Record<string, NutrientInsightDatum>
  }
}
/**
 * Variable store all size of the input to calculate the width of serving size input
 */

const SERVING_SIZE_SELECT_NAME = "serving_size_select"

/**
 * Display a table of nutrients for a given product
 * @element robotoff-nutrients-table
 * @fires submit - when the user submit the form
 */
@customElement("robotoff-nutrients-table")
@localized()
export class RobotoffNutrientsTable extends LitElement {
  static override styles = [
    ...getButtonClasses([ButtonType.Success, ButtonType.Danger, ButtonType.White]),
    SELECT,
    INPUT,
    FLEX,
    ALERT,
    css`
      :host {
        font-weight: normal;
        font-size: 1rem;
      }
      .inputs-wrapper {
        display: grid;
        grid-template-columns: 1fr auto auto;
        align-items: end;
        gap: 0.75rem;
      }
      .unit-wrapper {
        width: 5rem;
      }

      .unit-wrapper select {
        height: 2.5rem;
        border-radius: 2.5rem;
        padding-left: 1rem;
        padding-right: 1rem;
      }
      .serving-size-wrapper {
        gap: 0.3rem;
      }
      .serving-size-wrapper {
        font-weight: bold;
      }
      .serving-size-wrapper input {
        width: 12rem;
        text-align: center;
        box-sizing: border-box;
      }

      .submit-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
      }

      .submit-row .success-button {
        grid-column: 1 / 3;
      }
      .input-error-message {
        display: block;
        box-sizing: border-box;
        margin-top: 0.2rem;
        width: 100%;
        font-size: 0.7rem;
        color: var(--error-color, red);
      }

      .serving-size-selection label {
        display: flex;
        flex-direction: column;
        text-align: center;
      }
      .serving-size-selection select {
        margin-top: 0.25rem;
        padding: 0.5rem 1rem;
      }
      .add-nutrient-row {
        margin-top: 1rem;
        margin-bottom: 1rem;
      }
      .add-nutrient-row select {
        padding: 0.5rem 1rem;
        width: 100%;
      }

      .input-label {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        font-weight: bold;
        font-size: 0.9rem;
      }
      .info {
        display: block;
        padding: 0;
        width: 100%;
      }

      .nutrient-rows {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      form,
      .serving-size-selection {
        max-width: 20rem;
        width: 100%;
      }
      .nutrients-table {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
      .alert {
        padding: 0.4rem;
        margin-bottom: 0;
      }
      .toggle-nutrient-button-wrapper button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }
    `,
  ]

  /**
   * Nutriments data
   */
  @property({ type: Object, attribute: "nutriments-data", reflect: true })
  nutrimentsData?: NutrimentsProductType

  /**
   * The insight to edit
   */
  @property({ type: Object, reflect: true })
  insight?: NutrientsInsight

  /**
   * Insight type
   */
  @state()
  insightAnnotationSize: InsightAnnotationSize = InsightAnnotationSize.CENTGRAMS

  /**
   * Error message by key
   *
   */
  @state()
  private errors: Record<string, string> = {}

  /**
   * Serving size value to display
   */
  @state()
  private _servingSizeValue = ""

  /**
   * Formated Nutrients
   */
  @state()
  private nutrients?: FormatedNutrients

  /**
   * Input hidden by nutrient code
   */
  @state()
  private inputHiddenBySizeAndNutrientKey: Record<InsightAnnotationSize, Record<string, boolean>> =
    {
      "100g": {},
      serving: {},
    }

  @state()
  private debounceUpdatedInsight = initDebounce(() => {
    this.onUpdateInsight()
  })

  /**
   * Autocomplete value
   */
  @state()
  autocompleteValue: string = ""

  @query(`input[name='${NUTRIENT_SERVING_SIZE_KEY}']`)
  private servingSizeInput?: HTMLInputElement

  /**
   * Country code
   */
  get countryCode() {
    return countryCode.get()
  }

  /**
   * Nutrients order by country code
   */
  get nutrientsOrder() {
    return nutrientsOrderByCountryCode.getItem(this.countryCode)
  }

  /**
   * Update properties when the insight is updated
   *
   */
  onUpdateInsight = () => {
    // Update the serving size value to dislay
    this._servingSizeValue = this.insight!.data.nutrients.serving_size?.value || ""
    // Update the insight type by checking the nutrient keys
    this.insightAnnotationSize = Object.keys(this.insight!.data.nutrients).filter((key) =>
      key.endsWith(NUTRIENT_SUFFIX[InsightAnnotationSize.CENTGRAMS])
    ).length
      ? InsightAnnotationSize.CENTGRAMS
      : InsightAnnotationSize.SERVING

    // Update the nutrients
    this.updateFormatedNutrients()
    this.inputHiddenBySizeAndNutrientKey = {
      [InsightAnnotationSize.CENTGRAMS]: {},
      [InsightAnnotationSize.SERVING]: {},
    }
  }

  /**
   * Update the insight type on connected callback
   */
  override connectedCallback() {
    super.connectedCallback()
    this.onUpdateInsight()
  }

  /**
   * Update the insight type on attribute changed callback
   */
  override attributeChangedCallback(name: string, oldval: string, newval: string) {
    super.attributeChangedCallback(name, oldval, newval)
    if (["insight", "nutriments-data"].includes(name)) {
      this.debounceUpdatedInsight()
    }
  }

  /**
   * Process robotoff data from insight
   * @param nutrients - The nutrients object to update
   * @param insight - The insight data
   * @returns Set of nutrient keys found
   */
  private processRobotoffData(
    nutrients: FormatedNutrients,
    insight: NutrientsInsight
  ): Set<string> {
    const keysSet = new Set<string>()

    Object.entries(insight.data.nutrients)
      // Sort by start position to keep the same order as the image
      .sort((entryA, entryB) => entryA[1].start - entryB[1].start)
      .forEach(([key, value]) => {
        let nutrientKey
        if (key.endsWith(NUTRIENT_SUFFIX[InsightAnnotationSize.CENTGRAMS])) {
          nutrientKey = key.replace(NUTRIENT_SUFFIX[InsightAnnotationSize.CENTGRAMS], "")
          nutrients.robotoff[InsightAnnotationSize.CENTGRAMS][nutrientKey] = value
        } else if (key.endsWith(NUTRIENT_SUFFIX[InsightAnnotationSize.SERVING])) {
          nutrientKey = key.replace(NUTRIENT_SUFFIX[InsightAnnotationSize.SERVING], "")
          nutrients.robotoff[InsightAnnotationSize.SERVING][nutrientKey] = value
        } else if (key === NUTRIENT_SERVING_SIZE_KEY) {
          nutrients.robotoff.servingSize = value
          nutrients.servingSize = value?.value
          return
        } else {
          console.log("Unknown nutrient key", key, value)
          return
        }
        keysSet.add(nutrientKey)
      })

    return keysSet
  }

  /**
   * Process serving size data from nutrimentsData
   * @param nutrients - The nutrients object to update
   * @param nutrimentsData - The nutriments data
   */
  private processServingSize(
    nutrients: FormatedNutrients,
    nutrimentsData: NutrimentsProductType
  ): void {
    // Add serving size data
    if (nutrimentsData.serving_size) {
      nutrients.servingSize = nutrimentsData.serving_size
    }
  }

  /**
   * Process nutrient data from nutrimentsData
   * @param nutrients - The nutrients object to update
   * @param nutrimentsData - The nutriments data
   * @returns Set of nutrient keys found
   */
  private processNutrimentData(
    nutrients: FormatedNutrients,
    nutrimentsData: NutrimentsProductType
  ): Set<string> {
    const nutrientsOrder = this.nutrientsOrder
    console.log("nutrientsOrder", nutrientsOrder)
    const keySet = new Set<string>()

    // Process nutrients
    INSIGHTS_ANNOTATION_SIZE.forEach((size) => {
      const suffix = NUTRIENT_SUFFIX[size]
      const keys = Object.entries(nutrimentsData.nutriments).filter(([key]) => key.endsWith(suffix))
      keys.forEach(([key, value]) => {
        const nutrientKey = key.replace(suffix, "")
        // Check if we have to show the nutrient in the edit form
        if (!nutrientsOrder?.[nutrientKey]) {
          return
        }
        const nutrientUnitKey = `${nutrientKey}${NUTRIENT_UNIT_SUFFIX}`
        nutrients[size][nutrientKey] = {
          value: value.toString(),
          unit: nutrimentsData.nutriments[nutrientUnitKey] as string,
        }
        keySet.add(nutrientKey)
      })
    })
    return keySet
  }

  /**
   * Initialize empty nutrients structure
   * @returns Empty nutrients structure
   */
  private initializeNutrientsStructure(): FormatedNutrients {
    return {
      servingSize: undefined,
      keys: [],
      "100g": {},
      serving: {},
      robotoff: {
        servingSize: undefined,
        "100g": {},
        serving: {},
      },
    }
  }

  /**
   * Add a key to the nutrients keys set
   * @param keyToAdd - The key to add
   */
  addKeysSet(keyToAdd: string): void {
    const keysSet = new Set(this.nutrients!.keys)
    keysSet.add(keyToAdd)
    this.nutrients!.keys = Array.from(keysSet)
  }

  /**
   * Process the keys set to sort it and remove unwanted keys
   * @param nutrients - The nutrients to process
   * @param keysSet - The keys set to process
   */
  processKeysSet(nutrients: FormatedNutrients, keysSet: Set<string>): void {
    // Tranform set to array and sort the keys based on the order defined in nutrientsOrder
    const keys = sortKeysByNutrientsOrder(this.countryCode, Array.from(keysSet))

    // Remove keys nutrition-score until is not removed from API
    nutrients!.keys = keys.filter((key) => !/^nutrition-score/.test(key))
  }

  /**
   * Update the nutrients in a formated way to manipulate it easily in the template
   * @returns {FormatedNutrients}
   */
  updateFormatedNutrients(): FormatedNutrients {
    // Initialize nutrients structure
    const nutrients = this.initializeNutrientsStructure()
    let keysSet = new Set<string>()

    // Process robotoff data if available
    if (this.insight) {
      keysSet = this.processRobotoffData(nutrients, this.insight)
    }

    // Process nutriment data if available
    if (this.nutrimentsData) {
      // Process serving size
      this.processServingSize(nutrients, this.nutrimentsData)

      // Process nutrients data and merge keys
      const nutrimentKeysSet = this.processNutrimentData(nutrients, this.nutrimentsData)
      nutrimentKeysSet.forEach((key) => keysSet.add(key))
    }

    // Convert keys set to array and sort it based on the nutrients order
    this.processKeysSet(nutrients, keysSet)

    this.nutrients = nutrients
    return this.nutrients
  }

  getInputValueName = (key: string, column: InsightAnnotationSize) => `${key}_${column}`
  getInputUnitName = (key: string, column: InsightAnnotationSize) =>
    `${NUTRIENT_UNIT_NAME_PREFIX}${this.getInputValueName(key, column)}`

  addRobotoffSuggestionForServingSize() {
    const robotoffSuggestion = this.nutrients?.robotoff.servingSize
    if (!robotoffSuggestion?.value) {
      return
    }
    this.nutrients!.servingSize = robotoffSuggestion.value
    if (robotoffSuggestion.unit) {
      this.nutrients!.servingSize += ` ${robotoffSuggestion.unit}`
    }
    this.servingSizeInput!.value = this.nutrients!.servingSize
    this.requestUpdate()
  }

  setUnitInput(key: string, column: InsightAnnotationSize, unit?: string) {
    const possibleUnits = getPossibleUnits(key)
    // check if robotoffSuggestion.unit is valid to not override the unit with an unvalid one
    const isRobotoffSuggestionUnitValid = possibleUnits.includes(unit ?? "")
    if (isRobotoffSuggestionUnitValid) {
      const selectInputUnit = this.shadowRoot!.querySelector<HTMLInputElement>(
        `select[name="${this.getInputUnitName(key, column)}"]`
      )
      if (selectInputUnit) {
        selectInputUnit.value = unit ?? ""
      }
    }
  }
  addRobotoffSuggestion(key: string, column: InsightAnnotationSize) {
    const robotoffSuggestion = this.nutrients?.robotoff[column][key]
    if (!robotoffSuggestion?.value) {
      return
    }

    setValueAndParentsObjectIfNotExists(
      this.nutrients!,
      `${column}.${key}.value`,
      robotoffSuggestion.value
    )
    if (robotoffSuggestion.unit) {
      this.nutrients![column][key].unit = robotoffSuggestion.unit
    }
    this.setUnitInput(key, column, robotoffSuggestion.unit)
    this.requestUpdate()
  }
  renderRobotoffSuggestionForNutrient(key: string, column: InsightAnnotationSize) {
    const robotoffSuggestion = this.nutrients?.robotoff[column][key]
    const answer = this.nutrients![column][key]
    return this.renderRobotoffSuggestion(
      () => this.addRobotoffSuggestion(key, column),
      robotoffSuggestion,
      answer
    )
  }

  renderRobotoffSuggestionForServingSize() {
    const robotoffSuggestion: { value: string; unit?: string } = this.nutrients!.robotoff
      .servingSize ?? { value: "" }
    const robotoffServingSize = robotoffSuggestion.unit
      ? `${robotoffSuggestion.value} ${robotoffSuggestion.unit!}`
      : robotoffSuggestion.value
    const answer = { value: this.nutrients!.servingSize! }
    return this.renderRobotoffSuggestion(
      () => this.addRobotoffSuggestionForServingSize(),
      {
        value: robotoffServingSize,
      },
      answer
    )
  }

  /**
   * Render the robotoff suggestion button.
   * If the suggestion is already in the answers, return nothing.
   * If the suggestion is not in the answers, return a button to add the suggestion.
   * @param onClick - the function to call when the button is clicked
   * @param robotoffSuggestion - the robotoff suggestion
   * @param answer - the answer
   * @returns the robotoff suggestion button
   * @
   */
  renderRobotoffSuggestion(
    onClick: () => void,
    robotoffSuggestion?: { value: string; unit?: string },
    answer?: { value: string; unit?: string }
  ) {
    if (
      // Check if suggestion is already in the answers
      // Check if the unit is the same or if the suggestion has no unit
      // Return nothing if the suggestion is already in the answers
      !robotoffSuggestion?.value ||
      (answer?.value === robotoffSuggestion.value &&
        (!robotoffSuggestion.unit || answer?.unit === robotoffSuggestion.unit))
    ) {
      return nothing
    }

    const text = `${robotoffSuggestion.value} ${robotoffSuggestion.unit ?? ""}`
    return html`<button
      type="button"
      class="alert success with-icons"
      @click=${() => onClick()}
      title=${msg(str`Replace current value by ${text}`)}
    >
      <suggestion-icon size="16px" color=${GREEN}></suggestion-icon>
      <span>${text}</span>
      <add-icon size="16px" color=${GREEN}></add-icon>
    </button>`
  }

  /**
   * Render the inputs for the given nutrient key and column
   * @param nutrients - The nutrients to render
   * @returns
   */
  renderRows() {
    const nutrients = this.nutrients!
    return nutrients.keys.map((key) => {
      return html`
        <div>
          <div>
            ${this.renderInputs(
              key,
              this.insightAnnotationSize,
              nutrients[this.insightAnnotationSize][key]
            )}
          </div>

          <div>${this.renderRobotoffSuggestionForNutrient(key, this.insightAnnotationSize)}</div>
        </div>
      `
    })
  }

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
    column: InsightAnnotationSize,
    nutrient: Pick<NutrientInsightDatum, "unit"> | undefined,
    disabled = false
  ) {
    const possibleUnits = getPossibleUnits(key, nutrient?.unit)
    const inputName = this.getInputUnitName(key, column)
    const currentUnit = nutrient?.unit ?? getTaxonomyUnitById(key)
    const selectsClasses = "select chocolate unit-select"
    if (possibleUnits.length > 1) {
      return html`
        <select
          name=${inputName}
          class=${selectsClasses}
          style=${backgroundImage(WHITE_SELECT_ICON_FILE_NAME)}
          ?disabled=${disabled}
        >
          ${possibleUnits.map(
            (unit) =>
              html`<option value="${unit}" ?selected=${unit === currentUnit}>${unit}</option>`
          )}
        </select>
      `
    } else if (possibleUnits[0]) {
      return html`<input
          type="hidden"
          name="${inputName}"
          .value="${possibleUnits[0]}"
          ?disabled=${disabled}
        />
        <select
          class=${selectsClasses}
          disabled
          style=${backgroundImage(WHITE_SELECT_ICON_FILE_NAME)}
        >
          <option value="${possibleUnits[0]}" selected>${possibleUnits[0]}</option>
        </select>`
    } else {
      return nothing
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
    column: InsightAnnotationSize,
    nutrient: { value: number | string; unit: string } | undefined
  ) {
    const inputName = this.getInputValueName(key, column)
    const value = nutrient?.value.toString() ?? ""
    const label = getTaxonomyNameByIdAndLang(key, getLocale())
    const isHidden = this.inputHiddenBySizeAndNutrientKey[column][key]

    return html`
      <div class="inputs-wrapper">
        <div>
          <label class="input-label">
            <div>${label}</div>
            ${isHidden
              ? html`
                  <input type="hidden" name="${inputName}" value="-" />
                  <input
                    type="text"
                    value="-"
                    title="${msg("value")}"
                    class="input input-nutritional-value cappucino"
                    disabled
                  />
                `
              : html`<input
                  type="text"
                  name="${inputName}"
                  .value="${value}"
                  title="${msg("value")}"
                  class="input input-nutritional-value cappucino"
                />`}
          </label>
        </div>

        <div title=${msg("unit")} class="unit-wrapper">
          ${this.renderUnit(key, column, nutrient, isHidden)}
        </div>
        ${this.renderToggleNutrientButton(column, key)}
      </div>
      ${this.errors[inputName]
        ? html`<span class="input-error-message" role="alert">${this.errors[inputName]}</span>`
        : nothing}
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

  isUnitInput(key: string) {
    return key.startsWith(NUTRIENT_UNIT_NAME_PREFIX)
  }

  /**
   * Validate the input value.
   */
  validateInputValue(value: string | null): {
    error?: string
    value?: string
  } {
    const valueCleaned = value?.replace(" ", "").replace(",", ".") ?? ""

    // Check if the value is a special value
    if (ALLOWED_SPECIAL_VALUES.includes(valueCleaned)) {
      return {
        value: valueCleaned,
      }
    }
    // Check if the value is a number and a multiple of 0.01. Replace < by nothing to allow to enter a value like <1
    const numberValue = Number(valueCleaned.replace(/^</gm, ""))
    if (isNaN(numberValue)) {
      return {
        error: msg("Error: Invalid value."),
      }
    }

    return {
      value: valueCleaned,
    }
  }

  /**
   * Validate the form data.
   * It will return the form data well formatted.
   */
  validateFormData(data: InsightAnnotatationData): {
    isValid: boolean
    validatedData: InsightAnnotatationData
  } {
    this.errors = {}
    for (const [key, item] of Object.entries(data)) {
      // Skip serving size inputs
      if (key === NUTRIENT_SERVING_SIZE_KEY) {
        continue
      }

      const { error, value } = this.validateInputValue(item.value)

      if (error) {
        this.errors[key] = error
      } else {
        item.value = value!
      }
    }

    // raise error if there is any error
    if (Object.keys(this.errors).length > 0) {
      return { isValid: false, validatedData: data }
    }
    return { isValid: true, validatedData: data }
  }

  /**
   * Submit the form data.
   * It will send the data to the server.
   */
  submitFormData(formData: FormData, column: InsightAnnotationSize) {
    const nutrientAnotationForm: InsightAnnotatationData = {}
    const formValues = formData.entries()

    const servingSizeInputValue = this.servingSizeInput!.value!

    // Add servingSize
    nutrientAnotationForm[NUTRIENT_SERVING_SIZE_KEY] = {
      value: servingSizeInputValue,
      unit: null,
    }

    for (const [key, value] of formValues) {
      let name = key
      const isUnit = this.isUnitInput(name)
      if (isUnit) {
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

    const { isValid, validatedData } = this.validateFormData(nutrientAnotationForm)
    if (!isValid) {
      return
    }

    this.emitSubmitEvent({
      type: column,
      data: validatedData!,
      insightId: this.insight!.id,
    })
  }

  /**
   * Handle the change event of the annotation type selection.
   * It will update the annotation type.
   */
  onInsightAnnotationSizeChange(event: Event) {
    const input = event.target as HTMLInputElement
    const value = input.value as InsightAnnotationSize
    this.insightAnnotationSize = value
  }
  onSkip() {
    this.dispatchEvent(new CustomEvent(EventType.SKIP))
  }
  onRefuse() {
    this.dispatchEvent(new CustomEvent(EventType.REFUSE))
  }

  /**
   * Render the submit row.
   * It will render a submit button.
   */
  renderSubmitRow() {
    return html`
      <div class="submit-row">
        <button type="submit" class="button success-button">${msg("Submit")}</button>
        <button type="button" class="button danger-button" @click=${this.onRefuse}>
          ${msg("Invalidate image")}
        </button>
        <button type="button" class="button white-button" @click=${this.onSkip}>
          ${msg("Skip")}
        </button>
      </div>
    `
  }

  onChangeServingSize(event: Event) {
    const input = event.target as HTMLInputElement
    const value = input.value
    this._servingSizeValue = value
  }

  renderServingSizeInput() {
    const servingSize = this.nutrients!.servingSize ?? ""
    return html`<div class="">
      <label class="serving-size-wrapper flex align-center flex-col">
        <span>${msg("Serving size")}</span>
        <input
          class="input cappucino"
          name=${NUTRIENT_SERVING_SIZE_KEY}
          type="text"
          .value=${servingSize}
          @change=${this.onChangeServingSize}
        />
      </label>
      ${this.renderRobotoffSuggestionForServingSize()}
    </div> `
  }

  /**
   * Render the annotation type selection.
   * It will render a radio button for each annotation type.
   */
  renderInsightAnnotationSizeSelection() {
    return html`
      <div class="serving-size-selection">
        <label>
          <span>${msg("Nutrition facts are displayed on the packaging:")}</span>
          <select
            class="select"
            name="${SERVING_SIZE_SELECT_NAME}"
            @change=${this.onInsightAnnotationSizeChange}
            style=${backgroundImage(SELECT_ICON_FILE_NAME)}
          >
            <option
              value="${InsightAnnotationSize.CENTGRAMS}"
              ?selected=${this.insightAnnotationSize === InsightAnnotationSize.CENTGRAMS}
            >
              ${msg("per 100g")}
            </option>
            <option
              value="${InsightAnnotationSize.SERVING}"
              ?selected=${this.insightAnnotationSize === InsightAnnotationSize.SERVING}
            >
              <span>${msg(str`per specified serving "${this._servingSizeValue}"`)}</span>
            </option>
          </select>
        </label>
      </div>
    `
  }

  onAddNutrient(event: AutocompleteSuggestionSelectEvent) {
    const nutrientId = event.detail.value
    // Set it to the autocomplete value to force the component to update even if value is the same
    this.autocompleteValue = event.detail.label!

    this.addKeysSet(nutrientId)

    // Reset the autocomplete value after to force the component to update even if
    requestAnimationFrame(() => {
      this.autocompleteValue = ""
    })
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
    const formData = new FormData(event.target as HTMLFormElement)
    this.submitFormData(formData, this.insightAnnotationSize)
  }

  onAutocompleteInput(event: AutocompleteInputChangeEvent) {
    this.autocompleteValue = event.detail.value
  }

  /**
   * Render the row to add a new nutrient.
   * @param alreadyAddedNutrients
   */
  renderAddNutrientRow(alreadyAddedNutrients: string[]) {
    const lang = getLocale()
    const filteredNutrientTaxonomies = nutrientTaxonomies
      .get()
      // filter out the nutrients that are already added to the table
      .filter((nutrientTaxonomy) => !alreadyAddedNutrients.includes(nutrientTaxonomy.id))
      // map to the format expected by the autocomplete-input component
      .map((nutrientTaxonomy) => ({
        id: nutrientTaxonomy.id,
        label: getTaxonomyNameByLang(nutrientTaxonomy, lang),
        value: nutrientTaxonomy.id,
      }))
      // sort the nutrients by label
      .sort((a, b) => a.label.localeCompare(b.label))

    // if there are no nutrients to add, don't render the row
    if (filteredNutrientTaxonomies.length === 0) {
      return nothing
    }

    return html`
      <div class="add-nutrient-row">
        <autocomplete-input
          placeholder="${msg("Add a nutrient")}"
          .value=${this.autocompleteValue}
          @input-change=${(event: AutocompleteInputChangeEvent) => this.onAutocompleteInput(event)}
          .suggestions=${filteredNutrientTaxonomies}
          @suggestion-select=${this.onAddNutrient}
        ></autocomplete-input>
      </div>
    `
  }

  /**
   * Render the table with the nutrients data.
   */
  renderTable() {
    const nutrients = this.nutrients!
    return html`
      <div>
        <div class="nutrient-rows">${this.renderRows()}</div>
        <div>${this.renderAddNutrientRow(nutrients.keys)}</div>
        <div>${this.renderSubmitRow()}</div>
      </div>
    `
  }
  /**
   * Toggle the nutrient visibility.
   */
  toggleNutrient(column: InsightAnnotationSize, nutrientKey: string) {
    // Implement the logic to toggle the nutrient visibility
    this.inputHiddenBySizeAndNutrientKey[column][nutrientKey] =
      !this.inputHiddenBySizeAndNutrientKey[column][nutrientKey]

    this.requestUpdate()
  }

  /**
   * Render the toggle nutrient button.
   */
  renderToggleNutrientButton(column: InsightAnnotationSize, nutrientKey: string) {
    const isHidden = this.inputHiddenBySizeAndNutrientKey[column][nutrientKey]
    return html`
      <div class="toggle-nutrient-button-wrapper">
        <button
          type="button"
          class="button chocolate-button"
          @click=${() => this.toggleNutrient(column, nutrientKey)}
        >
          ${isHidden
            ? html`<eye-invisible-icon size="18px"></eye-invisible-icon>`
            : html` <eye-visible-icon size="18px"></eye-visible-icon>`}
        </button>
      </div>
    `
  }

  /**
   * Render the component.
   */
  override render() {
    return html`
      <div class="nutrients-table">
        <div>${this.renderServingSizeInput()}</div>
        <div>${this.renderInsightAnnotationSizeSelection()}</div>

        <form @submit=${this.onSubmit}>
          <div class="flex justify-center">${this.renderTable()}</div>
        </form>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-nutrients-table": RobotoffNutrientsTable
  }
}
