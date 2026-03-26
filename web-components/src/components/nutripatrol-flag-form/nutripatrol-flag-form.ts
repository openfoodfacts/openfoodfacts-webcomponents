import { LitElement, html, css, nothing } from "lit"
import { customElement, property, state, query } from "lit/decorators.js"
import { localized, msg } from "@lit/localize"
import { NutriPatrol } from "@openfoodfacts/openfoodfacts-nodejs"
import { BASE } from "../../styles/base"

/**
 * Interface mimicking the NutriPatrol API's FlagCreate schema.
 * We define it locally because the current SDK alpha version installed
 * does not export the type directly.
 */
interface FlagCreatePayload {
  type: "product" | "image" | "search"
  url: string
  user_id: string
  source: "web" | "mobile" | "robotoff"
  flavor: "off" | "obf" | "opff" | "opf" | "off-pro"
  barcode?: string
  image_id?: string
  reason?: string
  comment?: string
}

/**
 * Nutri-Patrol Flag Form component
 * Allows reporting a product or image issue directly from the page.
 * @element nutripatrol-flag-form
 */
@customElement("nutripatrol-flag-form")
@localized()
export class NutriPatrolFlagForm extends LitElement {
  static override styles = [
    BASE,
    css`
      :host {
        display: block;
        font-family: "Plus Jakarta Sans Variable", system-ui, sans-serif;
      }

      dialog {
        padding: 0;
        border: none;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        background: #fdfaf5; /* Matches the NutriPatrol off-white background */
        color: #333;
        max-width: 500px;
        width: 100%;
      }

      dialog::backdrop {
        background: rgba(0, 0, 0, 0.4);
      }

      .modal-header {
        padding: 1rem;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .modal-title {
        font-size: 1.5rem;
        margin: 0;
        text-align: center;
        width: 100%;
        font-weight: 500;
        color: #000;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
        padding: 0 0.5rem;
        position: absolute;
        right: 1rem;
      }

      .modal-body {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      label {
        font-size: 0.85rem;
        color: #555;
      }

      input,
      select,
      textarea {
        font-family: inherit;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
        width: 100%;
        box-sizing: border-box;
        background: #fafafa;
      }

      input:disabled {
        background: #f0f0f0;
        color: #888;
      }

      textarea {
        resize: vertical;
        min-height: 80px;
      }

      .submit-btn {
        background-color: #32863b; /* Green button from provided UI */
        color: white;
        border: none;
        padding: 0.75rem 1rem;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        margin-top: 1rem;
        width: 100%;
        transition: background-color 0.2s;
      }

      .submit-btn:hover {
        background-color: #2b7433;
      }

      .submit-btn:disabled {
        background-color: #92bfa4;
        cursor: not-allowed;
      }

      .message {
        padding: 1rem;
        text-align: center;
        border-radius: 4px;
        margin-top: 1rem;
      }

      .message.error {
        background-color: #ffebee;
        color: #c62828;
        border: 1px solid #ef9a9a;
      }

      .message.success {
        background-color: #e8f5e9;
        color: #2e7d32;
        border: 1px solid #a5d6a7;
      }
    `,
  ]

  @property({ type: String })
  barcode = ""

  @property({ type: String })
  type: "product" | "image" | "search" = "product"

  @property({ type: String, attribute: "image-id" })
  imageId = ""

  @property({ type: String })
  flavor: "off" | "obf" | "opff" | "opf" | "off-pro" = "off"

  @property({ type: String, attribute: "user-id" })
  userId = ""

  @property({ type: String })
  url = ""

  @property({ type: Boolean, reflect: true })
  open = false

  @state()
  private loading = false

  @state()
  private error: string | null = null

  @state()
  private success = false

  @state()
  private reason = "Wrong Data"

  @state()
  private comment = ""

  @query("dialog")
  private dialog!: HTMLDialogElement

  private client = new NutriPatrol(globalThis.fetch)

  override updated(changedProperties: Map<string, any>) {
    if (changedProperties.has("open")) {
      if (this.open) {
        this.dialog?.showModal()
        this.resetForm()
      } else {
        this.dialog?.close()
      }
    }
  }

  private resetForm() {
    this.success = false
    this.error = null
    this.loading = false
    this.reason = "Wrong Data"
    this.comment = ""
  }

  private handleClose() {
    this.open = false
    this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }))
  }

  private async handleSubmit(e: Event) {
    e.preventDefault()

    if (!this.userId) {
      this.error = msg("User ID is required to submit a flag. Please log in.")
      return
    }

    this.loading = true
    this.error = null

    // As per the SDK types, url, user_id, source, flavor, and type are required
    const payload: FlagCreatePayload = {
      type: this.type,
      url: this.url || window.location.href,
      user_id: this.userId,
      source: "web",
      flavor: this.flavor as FlagCreatePayload["flavor"],
      reason: this.reason,
      comment: this.comment || undefined,
    }

    if (this.barcode) {
      payload.barcode = this.barcode
    }

    if (this.type === "image" && this.imageId) {
      payload.image_id = this.imageId
    }

    try {
      // Temporary bypass until the SDK version is bumped and types align
      const { error } = await this.client.createFlag(payload)
      if (error) {
        console.error("Failed to create flag:", error)
        this.error = msg("Failed to submit flag. Please try again later.")
      } else {
        this.success = true
        // Close modal automatically after delay
        setTimeout(() => this.handleClose(), 3000)
      }
    } catch (err: any) {
      console.error("Flag API submission error:", err)
      this.error = err.message || msg("An unexpected error occurred.")
    } finally {
      this.loading = false
    }
  }

  override render() {
    return html`
      <dialog @close=${this.handleClose}>
        <div class="modal-header">
          <h2 class="modal-title">${msg("Flag a product")}</h2>
          <!-- Close button -->
          <button class="close-btn" @click=${this.handleClose} aria-label="${msg("Close")}">
            &times;
          </button>
        </div>

        <div class="modal-body">
          ${this.success
            ? html`
                <div class="message success">
                  ${msg("Thank you for reporting. Your flag has been submitted successfully.")}
                </div>
              `
            : html`
                <form @submit=${this.handleSubmit}>
                  ${this.barcode
                    ? html`
                        <div class="form-group">
                          <label for="barcode">${msg("Barcode")} *</label>
                          <input type="text" id="barcode" .value=${this.barcode} disabled />
                        </div>
                      `
                    : nothing}

                  <div class="form-group">
                    <label for="reason">${msg("Reason")} *</label>
                    <select
                      id="reason"
                      .value=${this.reason}
                      @change=${(e: any) => (this.reason = e.target.value)}
                      required
                    >
                      <option value="Wrong Barcode">${msg("Wrong Barcode")}</option>
                      <option value="Missing Data">${msg("Missing Data")}</option>
                      <option value="Wrong Data">${msg("Wrong Data")}</option>
                      <option value="Other">${msg("Other")}</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="comment">${msg("Comment")}</label>
                    <textarea
                      id="comment"
                      .value=${this.comment}
                      @input=${(e: any) => (this.comment = e.target.value)}
                      placeholder=${msg("Optional details")}
                    ></textarea>
                  </div>

                  ${this.error ? html`<div class="message error">${this.error}</div>` : nothing}

                  <button type="submit" class="submit-btn" ?disabled=${this.loading}>
                    ${this.loading ? msg("Submitting...") : msg("FLAG PRODUCT")}
                  </button>
                </form>
              `}
        </div>
      </dialog>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "nutripatrol-flag-form": NutriPatrolFlagForm
  }
}
