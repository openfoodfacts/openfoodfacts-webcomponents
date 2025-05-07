import { css } from "lit"

/**
 * Base styles for all components
 * - Font family : It is necessary to import the font in the index.html file
 */
export const BASE = css`
  :host {
    font-family: var(--font-family, "Public Sans", Helvetica, Roboto, Arial, sans-serif);
  }
`

export const ICON_BASE = css`
  :host {
    display: inline-flex;
  }
`
