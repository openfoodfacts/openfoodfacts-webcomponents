import { css } from "lit"

/**
 * Shared CSS custom properties for theming the Knowledge Panels component.
 *
 * Light-mode defaults are NOT set on :host — they live as var() fallbacks
 * in each renderer's styles (e.g. `var(--off-kp-bg, #fffdfa)`).
 * This allows host pages to override any variable via CSS inheritance:
 *
 * @example
 * ```css
 * knowledge-panels {
 *   --off-kp-bg: #1a1a2e;
 *   --off-kp-text: #e0e0e0;
 * }
 * ```
 *
 * Dark-mode overrides are applied automatically via @media (prefers-color-scheme: dark).
 * The theme is only applied on the top-level `knowledge-panels` host: custom properties
 * inherit through the nested renderer shadow roots, so one declaration covers every
 * renderer and a host page override on `knowledge-panels` reaches all of them.
 */
export const KNOWLEDGE_PANELS_THEME = css`
  @media (prefers-color-scheme: dark) {
    :host {
      /* Switch UA defaults (links, scrollbars) to their dark variants */
      color-scheme: dark;

      --off-kp-bg: #1e1e2e;
      --off-kp-text: #e0e0e0;
      --off-kp-text-secondary: #ccc;
      --off-kp-border: #444;
      --off-kp-shadow: rgba(0, 0, 0, 0.3);

      --off-kp-panel-border: #4d4034;
      --off-kp-panel-header-bg: #332b22;
      --off-kp-panel-header-hover-bg: #3f3529;
      --off-kp-panel-header-text: #e8c89a;
      --off-kp-panel-subtitle-text: #c9b48a;
      --off-kp-sub-panel-bg: #252535;
      /* Only applied to black monochrome icons, never to coloured score logos */
      --off-kp-monochrome-icon-filter: invert(1);

      --off-kp-table-header-bg: #2a2a3a;
      --off-kp-table-row-even-bg: #252535;
      --off-kp-table-row-hover-bg: #2d3748;

      --off-kp-action-bg: #2a2a3a;

      --off-kp-info-text: #9fd3dd;
      --off-kp-info-bg: #1a3a40;
      --off-kp-info-border: #2a5a63;

      --off-kp-warning-text: #e6c15c;
      --off-kp-warning-bg: #3d3520;
      --off-kp-warning-border: #5a4d2a;
    }
  }
`
