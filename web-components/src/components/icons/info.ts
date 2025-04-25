import { css, LitElement } from "lit"
import { html } from "lit-html"
import { styleMap } from "lit-html/directives/style-map.js"
import { customElement, property } from "lit/decorators.js"

/**
 * @element info-icon
 */
@customElement("info-icon")
export class InfoIcon extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
      width: 20px;
      height: 20px;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `

  @property({ type: Object, attribute: "custom-styles" })
  customStyles = {}

  override render() {
    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        style="${styleMap(this.customStyles)}"
        fill="currentColor"
        width="1em"
        height="1em"
        display="inline-block"
        font-size="24px"
        transition="fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms"
        flex-shrink="0"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
        />
      </svg>
    `
  }
}
