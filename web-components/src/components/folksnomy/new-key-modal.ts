import { LitElement, html, css } from "lit"
import { customElement } from "lit/decorators.js"
import { localized, msg } from "@lit/localize"

/**
 * New Key Modal Component
 * @element new-key-modal
 * @description A modal that provides instructions for creating a new key in the folksonomy editor
 */
@customElement("new-key-modal")
@localized()
export class NewKeyModal extends LitElement {
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

    .modal-body {
      color: #333;
      line-height: 1.6;
    }

    .instruction-list {
      margin: 1rem 0;
      padding-left: 1rem;
    }

    .instruction-item {
      margin-bottom: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 6px;
      border-left: 4px solid #007bff;
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

    .search-button {
      margin-top: 0.5rem;
      padding: 0.5rem 1rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }

    .search-button:hover {
      background: #0056b3;
    }

    .warning-box {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 6px;
      padding: 1rem;
      margin: 1rem 0;
    }

    .warning-title {
      font-weight: 600;
      color: #856404;
      margin-bottom: 0.5rem;
    }

    .warning-text {
      color: #856404;
    }

    @media (max-width: 768px) {
      .modal-content {
        padding: 1rem;
        width: 95%;
        max-height: 90vh;
      }

      .modal-title {
        font-size: 1.25rem;
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

  private handleSlackLink() {
    // You can replace this with the actual Slack link
    window.open("https://openfoodfacts.slack.com/", "_blank")
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
                <a
                  href="https://wiki.openfoodfacts.org/Folksonomy/Property"
                  target="_blank"
                  class="instruction-link"
                >
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
                <button class="search-button" @click=${this.handleSlackLink}>
                  ${msg("Join Slack Discussion")}
                </button>
              </div>

              <div class="instruction-item">
                <div class="instruction-title">3. ${msg("Create the property")}</div>
                <div class="instruction-description">
                  ${msg(
                    "Once you've verified that your property doesn't exist and the community agrees it's useful, you can create it by closing this modal and continuing with your entry."
                  )}
                </div>
              </div>

              <div class="instruction-item">
                <div class="instruction-title">4. ${msg("Documentation and Guidelines")}</div>
                <div class="instruction-description">
                  ${msg("Learn more about property creation and guidelines:")}
                </div>
                <a
                  href="https://wiki.openfoodfacts.org/Folksonomy_Engine"
                  target="_blank"
                  class="instruction-link"
                >
                  ${msg("Folksonomy Engine Documentation")}
                </a>
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
    "new-key-modal": NewKeyModal
  }
}
