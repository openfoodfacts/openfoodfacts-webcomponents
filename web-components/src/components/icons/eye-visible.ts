import { LitElement, html } from "lit"
import { customElement, property } from "lit/decorators.js"
import { ICON_BASE } from "../../styles/base"

@customElement("eye-visible-icon")
export class EyeVisibleIcon extends LitElement {
  static override styles = [ICON_BASE]
  @property({ type: String })
  color = "currentColor"

  @property({ type: String })
  size = "30px"

  override render() {
    return html`
      <svg
        width=${this.size}
        height=${this.size}
        viewBox="0 0 30 30"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        fill=${this.color}
      >
        <title>Visible (eye)</title>
        <g id="Visible-(eye)" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <path
            d="M15.0022584,4 C5.6518347,4 1.21209194,12.0831308 0.134979845,14.3903814 C-0.0449932884,14.7753814 -0.0449932748,15.2219332 0.134979845,15.6069333 C1.21209194,17.9155582 5.6518347,26 15.0022584,26 C24.3199598,26 28.7626845,17.9740384 29.8588847,15.6337898 C30.0470384,15.2309148 30.0470384,14.7690852 29.8588847,14.3662102 C28.7626845,12.0259609 24.3199598,4 15.0022584,4 Z M15,8 C18.8654,8 22,11.1346 22,15 C22,18.8654 18.8654,22 15,22 C11.1346,22 8,18.8654 8,15 C8,11.1346 11.1346,8 15,8 Z M15,11 C12.790861,11 11,12.790861 11,15 C11,17.209139 12.790861,19 15,19 C17.209139,19 19,17.209139 19,15 C19,12.790861 17.209139,11 15,11 Z"
            id="Shape"
            fill-rule="nonzero"
            fill=${this.color}
          ></path>
        </g>
      </svg>
    `
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "eye-visible-icon": EyeVisibleIcon
  }
}
