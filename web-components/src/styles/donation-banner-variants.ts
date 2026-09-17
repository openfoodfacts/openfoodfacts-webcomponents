import { css } from "lit"

/**
 * Styles for the four `<donation-banner>` variants (`campaign`, `strip`,
 * `sheet`, `bar`). Palette lifted from the approved mocks
 * (`donation-proposal/visuals/mock_banner_desktop.html`, `mock_mobile.html`);
 * dark tokens reuse today's default-variant dark palette.
 */
export const DONATION_BANNER_VARIANTS = css`
  .campaign,
  .strip,
  .sheet,
  .bar-root {
    font-family: inherit;
  }

  /* Set on the element, not :host, so the meter's shadow tree inherits it.
     Scoped to the variants: the default render adopts this sheet too and
     must keep its own meter colour. */
  .campaign donation-meter,
  .sheet donation-meter {
    display: block;
    font-size: 0.8125rem;
    --off-donation-meter-fill: #ff8714;
  }

  .link,
  .close {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font: inherit;
    color: inherit;
  }

  .close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: #85746c;
    flex-shrink: 0;
  }

  /* ---- campaign ---- */
  .campaign {
    position: relative;
    display: grid;
    grid-template-columns: 1.25fr 1fr;
    gap: 40px;
    padding: 22px 28px;
    border-radius: 12px;
    border: 1px solid #ede0db;
    border-inline-start: 6px solid #ff8714;
    background: #fff;
    color: #201a17;
    box-sizing: border-box;
  }

  .campaign h2 {
    font-size: 22px;
    line-height: 1.2;
    margin: 0 0 8px;
  }

  .campaign p {
    font-size: 15px;
    line-height: 1.5;
    color: #52443d;
    margin: 0 0 14px;
  }

  .ask {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 12px;
    padding-top: 24px;
  }

  .tiers {
    display: flex;
    gap: 8px;
  }

  .tier {
    position: relative;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 10px 6px;
    border-radius: 10px;
    border: 1.5px solid #d9cfc8;
    background: #fff;
    color: #201a17;
    text-align: center;
    text-decoration: none;
    font-weight: 700;
    font-size: 15px;
  }

  .tier small {
    font-weight: 500;
    font-size: 11px;
    color: #85746c;
  }

  .tier.selected {
    border-color: #201a17;
    background: #201a17;
    color: #fff;
  }

  .tier.selected small {
    color: #ede0db;
  }

  .badge {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    background: #ff8714;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
    white-space: nowrap;
  }

  .cta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
  }

  .give {
    display: inline-block;
    background: #201a17;
    color: #fff;
    font-weight: 700;
    font-size: 15px;
    padding: 12px 26px;
    border-radius: 999px;
    text-decoration: none;
    text-align: center;
    white-space: nowrap;
  }

  .give:hover {
    background: #3a322e;
  }

  .fine {
    font-size: 12px;
    line-height: 1.45;
    color: #85746c;
    margin: 0;
  }

  .cta .fine {
    flex: 1 1 120px;
  }

  .links {
    position: absolute;
    top: 12px;
    inset-inline-end: 16px;
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 12px;
    color: #85746c;
  }

  .links .link {
    font-weight: 600;
    text-decoration: underline;
  }

  @media (max-width: 640px) {
    .campaign {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .ask {
      padding-top: 0;
    }

    .cta {
      flex-direction: column;
      align-items: stretch;
    }
  }

  /* ---- strip ---- */
  .strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 10px 16px;
    background: #fff;
    border-top: 1px solid #ede0db;
    border-bottom: 1px solid #ede0db;
    color: #201a17;
    font-size: 14px;
  }

  .strip > span:first-child {
    min-width: 0;
  }

  .strip .more {
    color: #52443d;
  }

  @media (max-width: 639px) {
    .strip {
      font-size: 13px;
      padding-inline: 16px 12px;
    }

    .strip .more {
      display: none;
    }
  }

  .strip .go {
    color: inherit;
    font-weight: 700;
    text-decoration: underline;
    white-space: nowrap;
  }

  .strip > span:last-child {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  /* ---- sheet ---- */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(32, 26, 23, 0.45);
    z-index: 999;
  }

  .sheet {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    background: #fff;
    color: #201a17;
    border-radius: 18px 18px 0 0;
    padding: 12px 18px 22px;
    box-sizing: border-box;
    box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.2);
    max-height: 85vh;
    overflow-y: auto;
  }

  .sheet .grab {
    width: 40px;
    height: 4px;
    border-radius: 999px;
    background: #d9cfc8;
    margin: 0 auto 12px;
  }

  .sheet h2 {
    font-size: 18px;
    line-height: 1.25;
    margin: 8px 0 6px;
  }

  .sheet p {
    font-size: 13px;
    line-height: 1.45;
    color: #52443d;
    margin: 0 0 12px;
  }

  .sheet .close {
    position: absolute;
    top: 12px;
    inset-inline-end: 14px;
  }

  .sheet donation-meter {
    margin-bottom: 14px;
  }

  .sheet .tiers {
    gap: 6px;
    margin-bottom: 10px;
  }

  .sheet .tier {
    padding: 8px 4px;
  }

  .sheet .tier small {
    font-size: 10px;
  }

  .sheet .give {
    display: block;
    font-size: 14px;
    padding: 12px;
    margin-bottom: 8px;
  }

  .sheet .fine {
    font-size: 11px;
    line-height: 1.5;
    text-align: center;
  }

  .sheet .fine .link {
    font-weight: 600;
    text-decoration: underline;
  }

  /* ---- bar ---- */
  .bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 10px;
    padding-block: 10px 12px;
    padding-inline: 14px 12px;
    background: #fff;
    border-top: 1px solid #ede0db;
    box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.12);
    color: #52443d;
    box-sizing: border-box;
  }

  .bar .tx {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    line-height: 1.35;
  }

  .bar .tx b {
    display: block;
    color: #201a17;
    font-size: 13px;
  }

  .bar .tx .link {
    text-decoration: underline;
  }

  .bar .give {
    padding: 10px 14px;
    font-size: 13px;
    white-space: nowrap;
  }

  /* ---- dark mode (matches the default variant's tokens) ---- */
  .dark-mode.campaign,
  .dark-mode.strip,
  .dark-mode .sheet,
  .dark-mode .bar {
    background: #2d2724;
    color: #f9f7f5;
    border-color: rgba(255, 255, 255, 0.15);
  }

  .dark-mode.campaign {
    border-inline-start-color: #ff8714;
  }

  .dark-mode.campaign p,
  .dark-mode .sheet p,
  .dark-mode.strip .more,
  .dark-mode .bar .tx,
  .dark-mode .fine,
  .dark-mode .links,
  .dark-mode .close {
    color: #d4cbc5;
  }

  .dark-mode .bar .tx b {
    color: #f9f7f5;
  }

  .dark-mode .tier {
    background: transparent;
    border-color: rgba(255, 255, 255, 0.3);
    color: #f9f7f5;
  }

  .dark-mode .tier.selected,
  .dark-mode .give {
    background: #f9f7f5;
    border-color: #f9f7f5;
    color: #201a17;
  }

  .dark-mode .tier.selected small {
    color: #52443d;
  }

  .dark-mode .give:hover {
    background: #fff;
  }

  .dark-mode .sheet .grab {
    background: rgba(255, 255, 255, 0.3);
  }
`
