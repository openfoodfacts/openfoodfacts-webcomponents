import { css } from "lit"

export type ThemeMode = "auto" | "light" | "dark"

/**
 * Shared semantic color defaults for components that support the `theme`
 * attribute. Host pages override a token by setting `--off-color-*` on an
 * ancestor or on the component itself; those overrides take precedence over
 * these defaults.
 */
export const SHARED_THEME = css`
  :host {
    color-scheme: light dark;
    --off-theme-surface-default: #fff;
    --off-theme-border-default: #e5e7eb;
    --off-theme-text-default: #1f2937;
    --off-theme-text-muted-default: #6b7280;
    --off-theme-surface-subtle-default: #f9fafb;
    --off-theme-error-default: #ef4444;
    --off-theme-error-surface-default: #fee2e2;
    --off-theme-info-default: #3b82f6;
    --off-theme-warning-default: #f59e0b;
    --off-theme-shadow-default: rgba(0, 0, 0, 0.1);
  }

  :host([theme="dark"]) {
    --off-theme-surface-default: #18181b;
    --off-theme-border-default: #27272a;
    --off-theme-text-default: #fafafa;
    --off-theme-text-muted-default: #d4d4d8;
    --off-theme-surface-subtle-default: #27272a;
    --off-theme-error-default: #f87171;
    --off-theme-error-surface-default: #7f1d1d;
    --off-theme-info-default: #2563eb;
    --off-theme-warning-default: #fbbf24;
    --off-theme-shadow-default: rgba(0, 0, 0, 0.4);
  }

  @media (prefers-color-scheme: dark) {
    :host([theme="auto"]),
    :host(:not([theme])) {
      --off-theme-surface-default: #18181b;
      --off-theme-border-default: #27272a;
      --off-theme-text-default: #fafafa;
      --off-theme-text-muted-default: #d4d4d8;
      --off-theme-surface-subtle-default: #27272a;
      --off-theme-error-default: #f87171;
      --off-theme-error-surface-default: #7f1d1d;
      --off-theme-info-default: #2563eb;
      --off-theme-warning-default: #fbbf24;
      --off-theme-shadow-default: rgba(0, 0, 0, 0.4);
    }
  }
`
