import { css } from "lit"

/**
 * Shared CSS custom properties for theming all Folksonomy Engine components.
 *
 * Light-mode defaults are NOT set on :host — they live as var() fallbacks
 * in each component's styles (e.g. `var(--off-folksonomy-bg, #fff)`).
 * This allows host pages to override any variable via CSS inheritance:
 *
 * @example
 * ```css
 * folksonomy-editor {
 *   --off-folksonomy-bg: #1a1a2e;
 *   --off-folksonomy-text: #e0e0e0;
 * }
 * ```
 *
 * Dark-mode overrides are applied automatically via @media (prefers-color-scheme: dark).
 * Because they ARE set on :host, they take priority over inherited values.
 * A host page can still force light mode by setting variables directly on the element.
 */
export const FOLKSONOMY_THEME = css`
  @media (prefers-color-scheme: dark) {
    :host {
      --off-folksonomy-bg: #1e1e2e;
      --off-folksonomy-text: #e0e0e0;
      --off-folksonomy-text-secondary: #ccc;
      --off-folksonomy-border: #444;
      --off-folksonomy-shadow: rgba(0, 0, 0, 0.3);

      --off-folksonomy-table-header-bg: #2a2a3a;
      --off-folksonomy-table-header-bg-alt: #2a2a3a;
      --off-folksonomy-row-even-bg: #252535;
      --off-folksonomy-row-even-bg-alt: #252535;
      --off-folksonomy-row-hover-bg: #2d3748;

      --off-folksonomy-accent: #e8a87c;
      --off-folksonomy-accent-hover: #d4956a;

      --off-folksonomy-input-bg: #2a2a3a;
      --off-folksonomy-input-border: #555;
      --off-folksonomy-input-focus-border: #5b9bd5;
      --off-folksonomy-input-focus-shadow: rgba(91, 155, 213, 0.5);

      --off-folksonomy-modal-bg: #2a2a3a;
      --off-folksonomy-modal-text: #e0e0e0;
      --off-folksonomy-modal-text-secondary: #bbb;
      --off-folksonomy-modal-header-border: #444;

      --off-folksonomy-danger: #ff6b6b;
      --off-folksonomy-danger-hover: #ff4757;
      --off-folksonomy-error-bg: #4a1a1a;
      --off-folksonomy-error-border: #6b2a2a;

      --off-folksonomy-loading-text: #aaa;

      --off-folksonomy-btn-secondary-bg: #3a3a4a;
      --off-folksonomy-btn-secondary-hover: #4a4a5a;

      --off-folksonomy-filter-bg: #2a2a3a;

      --off-folksonomy-link: #5b9bd5;
      --off-folksonomy-link-hover: #4a8bc2;

      --off-folksonomy-instruction-bg: #2a2a3a;
      --off-folksonomy-instruction-border: #5b9bd5;

      --off-folksonomy-clash-bg: #3d3520;
      --off-folksonomy-clash-border: #5a4d2a;
      --off-folksonomy-clash-value: #d4b44a;

      --off-folksonomy-modal-title: #e0e0e0;
      --off-folksonomy-modal-message: #bbb;
    }
  }
`
