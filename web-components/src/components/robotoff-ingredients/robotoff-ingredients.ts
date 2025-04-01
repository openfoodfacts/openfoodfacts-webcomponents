import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { BASE } from "../../styles/base"
import { msg, str } from "@lit/localize"
import { getValidHeadingLevel } from "../../utils/knowledge-panels/heading-utils"
import { getTranslationsByQuantity } from "../../utils/internalization"
import { getLocale } from "../../localization"

@customElement("robotoff-ingredients")
export class RobotoffIngredients extends LitElement {
  static override styles = [
    BASE,
    css`
      :host {
      }
    `,
  ]
  @property({ type: String })
  titleLevel = "h2"

  @property({ type: String })
  productCode = ""

  renderHeader() {
    const titleLevel = getValidHeadingLevel(this.titleLevel, "h2")
    return html`
    <div>
      <${titleLevel}>
        <div>${msg("Extract ingredients")}</div>
      </${titleLevel}>
      <p>
        <!-- TODO Change later -->
        Poulet tika
      </p>
    </div>
    `
  }

  @state()
  currentIndex = 0

  @state()
  suggestions: { old: string; new: string }[] = [
    { old: "Poulat", new: "Poulet" },
    { old: "Tikal", new: "Tika" },
  ]

  @state()
  values: Record<number, string> = {}

  get currentSuggestion() {
    return this.suggestions[this.currentIndex]
  }

  suggest(value: string) {
    this.suggestions[this.currentIndex] = { old: this.values[this.currentIndex], new: value }
    if (this.currentIndex === this.suggestions.length - 1) {
      this.submitIngredients()
      return
    }
    this.currentIndex++
  }

  submitIngredients() {
    // TODO add robotoff call
    alert("Ingredients submitted: " + this.suggestions.map((s) => s.new).join(", "))
  }

  override render() {
    const quantity = 2
    return html`
      <div>
        ${this.renderHeader()} c
        <div>
          <zoomable-image
            src="https://static.openfoodfacts.org/images/products/322/989/000/0007/front_fr.10.400.jpg"
            .size="${{ width: "100%" }}"
          ></zoomable-image>
        </div>
        <div>
          <label>
            <div>${msg("Language")}</div>
            <input type="text" disabled value="fr" />
          </label>
          <label>
            <div>${msg("Ingredients")}</div>
            <textarea disabled>Poulet, sauce tomate, oignons, poivrons, ma√Øs, fromage</textarea>
          </label>

          <div>
            <p>
              ${getTranslationsByQuantity(quantity, {
                singular: msg(`${quantity} suggestion`),
                plural: msg(`${quantity} suggestions`),
              })}
            </p>
            <div>
              <div>
                <span>${this.currentSuggestion.old}</span>
                <span>=></span>
                <span>${this.currentSuggestion.new}</span>
              </div>
              <div>
                <button @click=${() => this.suggest(this.currentSuggestion.new)}>
                  ${msg("Accept")}
                </button>
                <button @click=${() => this.suggest(this.currentSuggestion.old)}>
                  ${msg("Reject")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-ingredients": RobotoffIngredients
  }
}
