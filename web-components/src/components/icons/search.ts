import { LitElement, html, css } from "lit"
import { customElement } from "lit/decorators.js"

@customElement("search-icon")
class SearchIcon extends LitElement {
  static override styles = css`
    svg,
    svg path {
      fill: #ffffff;
    }
  `
  override render() {
    return html`
      <svg
        width="16px"
        height="16px"
        viewBox="0 0 16 16"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
      >
        <title>Shape</title>
        <g id="Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g id="Search" fill="#000000" fill-rule="nonzero">
            <path
              d="M6.66263618,0 C2.99085545,0 0,2.99085545 0,6.66263618 C0,10.334417 2.99085545,13.3252724 6.66263618,13.3252724 C8.25934227,13.3252724 9.72570654,12.7582727 10.874932,11.8170701 L14.8529942,15.7951322 C15.0201041,15.9691875 15.2682543,16.0393016 15.5017411,15.9784339 C15.7352279,15.9175662 15.9175662,15.7352279 15.9784339,15.5017411 C16.0393016,15.2682543 15.9691875,15.0201041 15.7951322,14.8529942 L11.8170701,10.874932 C12.7582727,9.72570654 13.3252724,8.25934227 13.3252724,6.66263618 C13.3252724,2.99085545 10.334417,0 6.66263618,0 Z M6.66263618,1.33252724 C9.61426595,1.33252724 11.9927451,3.71100667 11.9927451,6.66263618 C11.9927451,9.61426595 9.61426595,11.9927451 6.66263618,11.9927451 C3.71100667,11.9927451 1.33252724,9.61426595 1.33252724,6.66263618 C1.33252724,3.71100667 3.71100667,1.33252724 6.66263618,1.33252724 Z"
              id="Shape"
            ></path>
          </g>
        </g>
      </svg>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "search-icon": SearchIcon
  }
}
