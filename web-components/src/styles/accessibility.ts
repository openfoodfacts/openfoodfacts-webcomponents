import { css } from "lit"

/**
 * Class to hide elements visually but keep them accessible for screen readers
 * https://a11y-guidelines.orange.com/en/articles/accessible-hiding/
 */
export const VISUALLY_HIDDEN = css`
  .visually-hidden {
    position: absolute;
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }
`
