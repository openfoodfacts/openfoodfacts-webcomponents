import { LitElement, html, css, TemplateResult } from "lit"
import { customElement, property } from "lit/decorators.js"
import "../utils/heading-utils" // Import heading renderer component

/**
 * Panel header renderer component
 *
 * @element panel-header-renderer
 */
@customElement("panel-header-renderer")
export class PanelHeaderRenderer extends LitElement {
  static override styles = css`
    .panel-header {
      width: 100%;
      border-bottom: 1px solid #eeeeee;
      padding: 1rem 1.25rem;
      display: block;
    }

    .panel-subtitle {
      width: 100%;
      font-size: 0.95rem;
      margin-top: 0.35rem;
      text-align: left;
      word-wrap: break-word;
    }
  `

  @property({ type: String })
  override title = ""

  @property({ type: String })
  subtitle = ""

  @property({ type: String })
  headingLevel = "h3"

  override render(): TemplateResult {
    if (!this.title) {
      return html``
    }

    return html`
      <div class="panel-header">
        <heading-renderer
          text="${this.title}"
          class-name="panel-title"
          heading-level="${this.headingLevel}"
        >
        </heading-renderer>
        ${this.subtitle ? html`<div class="panel-subtitle">${this.subtitle}</div>` : ""}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-header-renderer": PanelHeaderRenderer
  }
}
