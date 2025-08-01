import { LitElement, html, css } from "lit"
import { customElement, state } from "lit/decorators.js"
import { localized, msg } from "@lit/localize"
import {
  OpenFoodFactsSlackLink,
  FolksnomyEngineDocumentationLink,
  FolksnomyEnginePropertyLink,
} from "../../utils"

/**
 * New Key Modal Component
 * @element new-key-modal
 * @description A modal that provides instructions for creating a new key in the folksonomy editor
 */
@customElement("new-key-modal")
@localized()
export class NewKeyModal extends LitElement {
  @state()
  private propertyName = ""
  static override styles = css`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }

    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .close-button:hover {
      background-color: #f0f0f0;
    }

    .property-input-section {
      margin-bottom: 1.5rem;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .property-input-container {
      align-items: flex-end;
    }

    .input-group {
      flex: 1;
    }

    .input-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .property-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .property-input:focus {
      outline: none;
      border-color: #007bff;
    }

    .create-wiki-button {
      margin-top: 4px;
      background: #007bff;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .create-wiki-button:hover:not(:disabled) {
      background: #0056b3;
    }

    .create-wiki-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .instruction-list {
      margin: 1rem 0;
      padding-left: 0;
    }

    .instruction-item {
      margin-bottom: 1.5rem;
      padding: 1rem;
      border-left: 4px solid #007bff;
      background: #f8f9fa;
    }

    .instruction-title {
      font-weight: 600;
      color: #007bff;
      margin-bottom: 0.5rem;
    }

    .instruction-description {
      color: #555;
      margin-bottom: 0.5rem;
    }

    .instruction-link {
      color: #007bff;
      text-decoration: none;
      font-weight: 500;
    }

    .instruction-link:hover {
      text-decoration: underline;
    }

    .join-slack-discussion {
      padding-top: 6px;
    }

    .instruction-button {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
    }

    .instruction-button:hover {
      background: #0056b3;
    }

    @media (max-width: 768px) {
      .modal-content {
        width: 95%;
        padding: 1rem;
      }

      .property-input-container {
        flex-direction: column;
        align-items: stretch;
      }

      .create-wiki-button {
        margin-top: 0.5rem;
      }
    }
  `

  private handleClose() {
    this.dispatchEvent(
      new CustomEvent("close-modal", {
        bubbles: true,
        composed: true,
      })
    )
  }

  private handlePropertyNameInput(e: Event) {
    const input = e.target as HTMLInputElement
    this.propertyName = input.value.trim()
  }

  private handleCreateWikiPage() {
    if (!this.propertyName) return

    const encodedPropertyName = encodeURIComponent(this.propertyName)
    const wikiUrl = `https://wiki.openfoodfacts.org/Folksonomy/Property/${encodedPropertyName}?action=edit&section=new&nosummary=true&preload=Folksonomy/Property/property_template`
    window.open(wikiUrl, "_blank")
  }

  override render() {
    return html`
      <div class="modal-overlay" @click=${this.handleClose}>
        <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <h2 class="modal-title">${msg("Creating a New Property")}</h2>
            <button class="close-button" @click=${this.handleClose}>×</button>
          </div>

          <div class="instruction-list">
            <div class="instruction-item">
              <div class="instruction-title">1. ${msg("Check if a property already exists")}</div>
              <div class="instruction-description">
                ${msg("Search for your property concept in the existing properties database:")}
              </div>
              <a href=${FolksnomyEnginePropertyLink} target="_blank" class="instruction-link">
                ${msg("Browse and search existing properties")}
              </a>
            </div>

            <div class="instruction-item">
              <div class="instruction-title">2. ${msg("Ask the community first")}</div>
              <div class="instruction-description">
                ${msg("Before creating a new property, discuss it with the community:")}
              </div>
              <div class="instruction-description">
                ${msg("I would like to create a property to [describe your use case]...")}
              </div>
              <div class="join-slack-discussion">
                <a class="instruction-button" href=${OpenFoodFactsSlackLink} target="_blank">
                  ${msg("Join Slack Discussion")}
                </a>
              </div>
            </div>

            <div class="instruction-item">
              <div class="instruction-title">3. ${msg("Document the New Property")}</div>
              <div class="instruction-description">
                ${msg(
                  "Once you've verified that your property doesn't exist and the community agrees it's useful, you need to first document it in the wiki."
                )}
              </div>
              <div class="property-input-section">
                <div class="property-input-container">
                  <div class="input-group">
                    <label class="input-label">${msg("Property name:")}</label>
                    <input
                      type="text"
                      class="property-input"
                      placeholder="${msg("Enter property name...")}"
                      .value="${this.propertyName}"
                      @input="${this.handlePropertyNameInput}"
                    />
                  </div>
                  <button
                    class="create-wiki-button"
                    @click="${this.handleCreateWikiPage}"
                    ?disabled="${!this.propertyName}"
                  >
                    ${msg("Document the property")}
                  </button>
                </div>
              </div>
            </div>

            <div class="instruction-item">
              <div class="instruction-title">4. ${msg("Documentation and Guidelines")}</div>
              <div class="instruction-description">
                ${msg("Learn more about property creation and guidelines:")}
              </div>
              <a href=${FolksnomyEngineDocumentationLink} target="_blank" class="instruction-link">
                ${msg("Folksonomy Engine Documentation")}
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "new-key-modal": NewKeyModal
  }
}
