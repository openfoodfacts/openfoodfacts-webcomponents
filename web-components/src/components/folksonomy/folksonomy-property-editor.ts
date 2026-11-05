import { LitElement, html, css, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { localized, msg } from "@lit/localize"
import folksonomyApi from "../../api/folksonomy"
import { FOLKSONOMY_THEME } from "../../styles/folksonomy-theme"
import { FOLKSONOMY_INPUT } from "../../styles/folksonomy-input"

/**
 * FolksonomyPropertyEditor
 * @element folksonomy-property-editor
 * A web component to view and set a value for an arbitrary Folksonomy Engine property.
 *
 * Parameters:
 * - `property`: The Folksonomy property key (compulsory, e.g. "unfixable", "consigne").
 * - `product-code` / `product`: The product barcode/id (e.g. "3017620422003").
 * - `title`: Optional custom title (e.g. "Data Quality Flag", "Deposit / Consigne").
 * - `call-to-action`: Optional button label (e.g. "Mark as unfixable", "Save deposit").
 * - `accepted-values`: Optional predefined values (comma-separated string or array).
 * - `image`: Optional thumbnail image URL.
 * - `widget-type`: Optional widget override ("auto" | "text" | "boolean" | "select" | "date").
 * - `view-only`: If true, disables editing.
 *
 * @fires property-saved - Dispatched when a property value is added or updated.
 */
@customElement("folksonomy-property-editor")
@localized()
export class FolksonomyPropertyEditor extends LitElement {
  /**
   * The compulsory property key (e.g., "unfixable", "consigne", "packaging").
   */
  @property({ type: String, attribute: "property", reflect: true })
  property = ""

  /**
   * The product code / barcode.
   */
  @property({ type: String, attribute: "product-code", reflect: true })
  productCode = ""

  /**
   * Alias attribute for product-code.
   */
  @property({ type: String, attribute: "product" })
  set product(val: string) {
    if (val && !this.productCode) {
      this.productCode = val
    }
  }

  get product(): string {
    return this.productCode
  }

  /**
   * Optional custom title displayed on the widget.
   */
  @property({ type: String, attribute: "title" })
  override title = ""

  /**
   * Optional call-to-action label for the submit button.
   */
  @property({ type: String, attribute: "call-to-action" })
  callToAction = ""

  /**
   * Optional accepted values. Can be passed as an array or comma-separated string.
   */
  @property({
    attribute: "accepted-values",
    converter: {
      fromAttribute: (value: string | null): string[] => {
        if (!value) return []
        try {
          const parsed = JSON.parse(value)
          if (Array.isArray(parsed)) return parsed.map(String)
        } catch {
          // not JSON, parse as comma-separated
        }
        return value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      },
      toAttribute: (value: string[]): string => {
        return Array.isArray(value) ? value.join(",") : ""
      },
    },
  })
  acceptedValues: string[] = []

  /**
   * Optional image URL to display as an illustrative icon or thumbnail.
   */
  @property({ type: String, attribute: "image" })
  image = ""

  /**
   * Optional widget display override.
   * "auto" (default) detects boolean / select / text.
   */
  @property({ type: String, attribute: "widget-type" })
  widgetType: "auto" | "text" | "boolean" | "select" | "date" = "auto"

  /**
   * Disables editing.
   */
  @property({ type: Boolean, attribute: "view-only" })
  viewOnly = false

  /**
   * Pre-filled or current value.
   */
  @property({ type: String, attribute: "value" })
  value = ""

  /**
   * Login URL for unauthorized error states.
   */
  @property({ type: String, attribute: "login-url" })
  loginUrl = "/cgi/login.pl"

  @state()
  private currentValue = ""

  @state()
  private existingValue = ""

  @state()
  private version = 1

  @state()
  private loading = false

  @state()
  private saving = false

  @state()
  private statusMessage: string | null = null

  @state()
  private statusType: "success" | "error" | null = null

  static override styles = [
    FOLKSONOMY_THEME,
    FOLKSONOMY_INPUT,
    css`
      :host {
        display: block;
        font-family:
          Arial,
          system-ui,
          -apple-system,
          sans-serif;
        color: var(--off-folksonomy-text, #333);
      }

      .card {
        background-color: var(--off-folksonomy-bg, #ffffff);
        border: 1px solid var(--off-folksonomy-border, #e0e0e0);
        border-radius: 8px;
        box-shadow: 0 2px 6px var(--off-folksonomy-shadow, rgba(0, 0, 0, 0.08));
        padding: 1rem;
        box-sizing: border-box;
      }

      .header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
      }

      .thumbnail {
        width: 44px;
        height: 44px;
        object-fit: cover;
        border-radius: 6px;
        border: 1px solid var(--off-folksonomy-border, #ddd);
      }

      .header-text {
        flex: 1;
        min-width: 0;
      }

      .title {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0;
        color: var(--off-folksonomy-text-secondary, #222);
      }

      .property-tag {
        display: inline-block;
        font-size: 0.75rem;
        font-family: monospace;
        background-color: var(--off-folksonomy-table-header-bg, #f1f1f1);
        color: var(--off-folksonomy-text, #555);
        padding: 0.15rem 0.4rem;
        border-radius: 4px;
        margin-top: 0.2rem;
      }

      .existing-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.8rem;
        background-color: var(--off-folksonomy-row-even-bg, #e8f5e9);
        color: #2e7d32;
        border: 1px solid #c8e6c9;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        margin-bottom: 0.75rem;
      }

      .input-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .pills-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .pill-btn {
        padding: 0.4rem 0.8rem;
        font-size: 0.9rem;
        border: 1px solid var(--off-folksonomy-border, #ccc);
        border-radius: 20px;
        background-color: var(--off-folksonomy-bg, #fff);
        color: var(--off-folksonomy-text, #333);
        cursor: pointer;
        transition: all 0.15s ease-in-out;
      }

      .pill-btn:hover {
        background-color: var(--off-folksonomy-row-hover-bg, #f0f0f0);
        border-color: var(--off-folksonomy-accent, #c58252);
      }

      .pill-btn.active {
        background-color: var(--off-folksonomy-accent, #c58252);
        color: #ffffff;
        border-color: var(--off-folksonomy-accent, #c58252);
        font-weight: 600;
      }

      select.custom-select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--off-folksonomy-input-border, #ccc);
        border-radius: 5px;
        background-color: var(--off-folksonomy-input-bg, #fcfbfb);
        color: var(--off-folksonomy-text, #333);
        font-size: 0.9rem;
        height: 2.2rem;
      }

      select.custom-select:focus {
        outline: none;
        border-color: var(--off-folksonomy-input-focus-border, #007bff);
      }

      .actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.75rem;
      }

      .cta-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        padding: 0.5rem 1rem;
        font-size: 0.95rem;
        font-weight: 600;
        border-radius: 5px;
        border: none;
        background-color: var(--off-folksonomy-accent, #c58252);
        color: #ffffff;
        cursor: pointer;
        transition: background-color 0.15s ease;
      }

      .cta-btn:hover:not(:disabled) {
        background-color: var(--off-folksonomy-accent-hover, #a86c41);
      }

      .cta-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .status-alert {
        margin-top: 0.6rem;
        padding: 0.5rem 0.75rem;
        border-radius: 4px;
        font-size: 0.85rem;
      }

      .status-alert.success {
        background-color: var(--off-folksonomy-row-even-bg, #e8f5e9);
        color: #2e7d32;
        border: 1px solid #a5d6a7;
      }

      .status-alert.error {
        background-color: var(--off-folksonomy-error-bg, #ffebee);
        color: var(--off-folksonomy-danger, #c62828);
        border: 1px solid var(--off-folksonomy-error-border, #ef9a9a);
      }

      .status-alert a {
        color: inherit;
        text-decoration: underline;
        font-weight: bold;
      }

      .spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-radius: 50%;
        border-top-color: #ffffff;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ]

  override willUpdate(changedProps: Map<string, unknown>) {
    if (changedProps.has("value") && this.value) {
      this.currentValue = this.value
    }

    if (
      (changedProps.has("property") || changedProps.has("productCode")) &&
      this.property &&
      this.productCode
    ) {
      this.loadExistingProperty()
    }
  }

  /**
   * Fetch current product properties and populate the field if it already exists
   */
  async loadExistingProperty() {
    if (!this.property || !this.productCode) return

    this.loading = true
    try {
      const properties = await folksonomyApi.fetchProductProperties(this.productCode)
      const match = properties.find((p) => p.k === this.property)
      if (match) {
        this.existingValue = match.v
        this.version = match.version
        if (!this.currentValue) {
          this.currentValue = match.v
        }
      } else {
        this.existingValue = ""
        this.version = 1
      }
    } catch {
      // Ignore initial fetch errors if product not found or offline
    } finally {
      this.loading = false
    }
  }

  private isBooleanType(): boolean {
    if (this.widgetType === "boolean") return true
    if (this.widgetType !== "auto") return false

    if (this.acceptedValues.length === 2) {
      const lower = this.acceptedValues.map((v) => v.toLowerCase())
      return (
        (lower.includes("yes") && lower.includes("no")) ||
        (lower.includes("true") && lower.includes("false")) ||
        (lower.includes("1") && lower.includes("0"))
      )
    }
    return false
  }

  private handlePillClick(val: string) {
    if (this.viewOnly) return
    this.currentValue = val
    this.statusMessage = null
  }

  private handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement | HTMLSelectElement
    this.currentValue = target.value
    this.statusMessage = null
  }

  /**
   * Save or update the property in Folksonomy Engine
   */
  async handleSave() {
    if (!this.property) {
      this.statusMessage = msg("Missing property key.")
      this.statusType = "error"
      return
    }

    if (!this.productCode) {
      this.statusMessage = msg("Missing product code.")
      this.statusType = "error"
      return
    }

    if (!this.currentValue) {
      this.statusMessage = msg("Please provide or select a value.")
      this.statusType = "error"
      return
    }

    this.saving = true
    this.statusMessage = null
    this.statusType = null

    try {
      let result: { key: string; value: string; version: number }

      if (this.existingValue) {
        result = await folksonomyApi.updateProductProperty(
          this.productCode,
          this.property,
          this.currentValue,
          this.version
        )
      } else {
        result = await folksonomyApi.addProductProperty(
          this.productCode,
          this.property,
          this.currentValue,
          this.version
        )
      }

      this.existingValue = result.value
      this.version = result.version
      this.statusMessage = msg("Value saved successfully!")
      this.statusType = "success"

      this.dispatchEvent(
        new CustomEvent("property-saved", {
          detail: {
            property: this.property,
            value: result.value,
            version: result.version,
            productCode: this.productCode,
          },
          bubbles: true,
          composed: true,
        })
      )
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      if (errorMsg.includes("401") || errorMsg.includes("403") || errorMsg.includes("auth")) {
        this.statusMessage = `${msg("Please sign in to save folksonomy properties.")}`
      } else {
        this.statusMessage = `${msg("Failed to save property:")} ${errorMsg}`
      }
      this.statusType = "error"
    } finally {
      this.saving = false
    }
  }

  private renderWidget() {
    if (this.viewOnly) {
      return html`
        <div>
          <strong>${this.currentValue || msg("No value set")}</strong>
        </div>
      `
    }

    if (
      this.isBooleanType() ||
      (this.acceptedValues.length > 0 && this.acceptedValues.length <= 4)
    ) {
      return html`
        <div class="pills-container">
          ${this.acceptedValues.map(
            (val) => html`
              <button
                type="button"
                class="pill-btn ${this.currentValue === val ? "active" : ""}"
                @click=${() => this.handlePillClick(val)}
              >
                ${val}
              </button>
            `
          )}
        </div>
      `
    }

    if (this.widgetType === "select" || this.acceptedValues.length > 4) {
      return html`
        <select class="custom-select" .value=${this.currentValue} @change=${this.handleInputChange}>
          <option value="" disabled ?selected=${!this.currentValue}>
            ${msg("Select an option...")}
          </option>
          ${this.acceptedValues.map(
            (val) => html`
              <option value=${val} ?selected=${this.currentValue === val}>${val}</option>
            `
          )}
        </select>
      `
    }

    if (this.widgetType === "date") {
      return html`
        <input type="date" .value=${this.currentValue} @input=${this.handleInputChange} />
      `
    }

    // Default: text input
    return html`
      <input
        type="text"
        placeholder=${msg("Enter value...")}
        .value=${this.currentValue}
        @input=${this.handleInputChange}
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === "Enter") this.handleSave()
        }}
      />
    `
  }

  override render() {
    const displayTitle = this.title || this.property
    const buttonLabel = this.callToAction || (this.existingValue ? msg("Update") : msg("Add"))

    return html`
      <div class="card">
        <div class="header">
          ${
            this.image
              ? html`<img class="thumbnail" src=${this.image} alt=${displayTitle} />`
              : nothing
          }
          <div class="header-text">
            <h3 class="title">${displayTitle}</h3>
            ${
              this.title && this.property
                ? html`<span class="property-tag">${this.property}</span>`
                : nothing
            }
          </div>
        </div>

        ${
          this.loading
            ? html`
                <div class="existing-badge">
                  <span
                    class="spinner"
                    style="border-top-color: #2e7d32; border-color: rgba(46,125,50,0.3);"
                  ></span>
                  <span>${msg("Checking existing property...")}</span>
                </div>
              `
            : this.existingValue
              ? html`
                  <div class="existing-badge">
                    <span>✓</span>
                    <span>${msg("Current:")} <strong>${this.existingValue}</strong></span>
                  </div>
                `
              : nothing
        }

        <div class="input-group">${this.renderWidget()}</div>

        ${
          !this.viewOnly
            ? html`
                <div class="actions">
                  <button
                    type="button"
                    class="cta-btn"
                    ?disabled=${this.saving || !this.currentValue}
                    @click=${this.handleSave}
                  >
                    ${this.saving ? html`<span class="spinner"></span>` : nothing} ${buttonLabel}
                  </button>
                </div>
              `
            : nothing
        }
        ${
          this.statusMessage
            ? html`
                <div class="status-alert ${this.statusType}">
                  ${this.statusMessage}
                  ${
                    this.statusType === "error" && this.statusMessage.includes("sign in")
                      ? html`<a href=${this.loginUrl} target="_blank">${msg("Login here")}</a>`
                      : nothing
                  }
                </div>
              `
            : nothing
        }
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "folksonomy-property-editor": FolksonomyPropertyEditor
  }
}
