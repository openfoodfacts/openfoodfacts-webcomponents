import { LitElement, html, css, type TemplateResult } from "lit"
import { customElement, property } from "lit/decorators.js"
import { localized } from "@lit/localize"
import type {
  KnowledgePanelActionEventDetail,
  KnowledgePanelElement,
} from "../../../types/knowledge-panel"
import { EventType } from "../../../constants"
import { sanitizeHtml } from "../../../utils/html"
import {
  getKnowledgePanelActionLabel,
  getKnowledgePanelActionUrl,
} from "../../../utils/knowledge-panels/actions"

/**
 * Action element renderer component
 *
 * Renders a button for each action of the element.
 * When the product code is known, actions supported by Open Food Facts link to the matching page.
 *
 * @element action-element-renderer
 * @fires knowledge-panel-action - When an action is clicked, with the action in the event detail.
 * Calling `preventDefault()` on the event prevents following the action link.
 */
@localized()
@customElement("action-element-renderer")
export class ActionElementRenderer extends LitElement {
  static override styles = css`
    .action {
      width: 100%;
      margin: 1rem 0;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 22px;
      border: 1px solid #e8e8e8;
      text-align: left;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .action small {
      width: 100%;
      display: block;
      margin-top: 0.5rem;
      font-style: italic;
      font-size: 0.85rem;
      word-wrap: break-word;
      line-height: 1.5;
    }

    .button {
      display: inline-block;
      font-weight: 500;
      text-align: center;
      vertical-align: middle;
      cursor: pointer;
      padding: 0.375rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5;
      border-radius: 0.25rem;
      border-width: 1px;
      border-style: solid;
      text-decoration: none;
      transition:
        color 0.15s ease-in-out,
        background-color 0.15s ease-in-out,
        border-color 0.15s ease-in-out,
        box-shadow 0.15s ease-in-out;
    }

    .chocolate-button {
      color: #fff;
      background-color: #7d5437;
      border-color: #6a4730;
    }

    .chocolate-button:hover {
      color: #fff;
      background-color: #60412b;
      border-color: #4d3422;
    }
  `

  @property({ type: Object })
  element?: KnowledgePanelElement

  /**
   * The barcode of the product the knowledge panels belong to, used to build the action links
   */
  @property({ type: String })
  productCode = ""

  /**
   * Dispatch the action event and only follow the action link if the event was not cancelled
   * @param event - The click event
   * @param action - The clicked action
   * @param url - The URL of the action, if any
   */
  private onActionClick(event: Event, action: string, url?: string) {
    const actionEvent = new CustomEvent<KnowledgePanelActionEventDetail>(
      EventType.KNOWLEDGE_PANEL_ACTION,
      {
        detail: { action, productCode: this.productCode || undefined, url },
        bubbles: true,
        composed: true,
        cancelable: true,
      }
    )
    if (!this.dispatchEvent(actionEvent)) {
      event.preventDefault()
    }
  }

  /**
   * Renders an action as a link when its URL is known, otherwise as a button
   * @param action - The action identifier (e.g. "add_categories")
   * @param fallbackLabel - The label to use if the action is unknown
   * @returns Template result for the action
   */
  renderAction(action: string, fallbackLabel?: string): TemplateResult {
    const label = getKnowledgePanelActionLabel(action) ?? fallbackLabel ?? action
    const url = getKnowledgePanelActionUrl(action, this.productCode)

    if (url) {
      return html`<a
        class="button chocolate-button"
        href=${url}
        @click=${(event: Event) => this.onActionClick(event, action, url)}
        >${label}</a
      >`
    }
    return html`<button
      type="button"
      class="button chocolate-button"
      @click=${(event: Event) => this.onActionClick(event, action)}
    >
      ${label}
    </button>`
  }

  override render(): TemplateResult {
    if (!this.element) {
      return html``
    }

    const actionElement = this.element.action_element
    if (!actionElement) {
      return html``
    }

    const actions = actionElement.actions || []
    const actionDescription = actionElement.description || ""
    const sanitizedHTML = sanitizeHtml(actionElement.html || "")

    return html`
      <div class="action">
        <div>${sanitizedHTML}</div>
        <div class="actions">
          ${actions.map((action) => this.renderAction(action, actionElement.action_text))}
        </div>
        ${actionDescription ? html`<small>${actionDescription}</small>` : ""}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "action-element-renderer": ActionElementRenderer
  }
}
