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

  donation-meter {
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
    padding: 32px;
    border-radius: 12px;
    border: 1px solid #d9cfc8;
    border-left: 6px solid #ff8714;
    background: #fff;
    color: #201a17;
    box-sizing: border-box;
  }

  .campaign h2 {
    font-size: 22px;
    line-height: 1.25;
    margin: 0 0 12px;
  }

  .campaign p {
    font-size: 15px;
    line-height: 1.5;
    color: #52443d;
    margin: 0 0 16px;
  }

  .tiers {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 16px;
  }

  .tier {
    position: relative;
    flex: 1 1 100px;
    min-width: 90px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 10px 8px;
    border-radius: 10px;
    border: 1px solid #d9cfc8;
    background: #f6f3f0;
    color: #201a17;
    text-align: center;
    text-decoration: none;
    font-weight: 600;
    font-size: 15px;
  }

  .tier small {
    font-weight: 400;
    font-size: 12px;
    color: #85746c;
  }

  .tier.selected {
    border-color: #ff8714;
    background: #fff3e8;
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
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .give {
    display: inline-block;
    background: #ff8714;
    color: #fff;
    font-weight: 700;
    font-size: 16px;
    padding: 12px 24px;
    border-radius: 999px;
    text-decoration: none;
    text-align: center;
  }

  .fine {
    font-size: 12px;
    color: #85746c;
    margin: 0;
  }

  .links {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
  }

  @media (max-width: 640px) {
    .campaign {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }

  /* ---- strip ---- */
  .strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 10px 16px;
    background: #201a17;
    color: #fff;
    font-size: 14px;
  }

  .strip .more {
    color: #d9cfc8;
  }

  @media (max-width: 639px) {
    .strip .more {
      display: none;
    }
  }

  .strip .go {
    color: #ff8714;
    font-weight: 700;
    text-decoration: none;
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
    border-radius: 16px 16px 0 0;
    padding: 12px 24px 24px;
    box-sizing: border-box;
    max-height: 85vh;
    overflow-y: auto;
  }

  .sheet .grab {
    width: 36px;
    height: 4px;
    border-radius: 999px;
    background: #d9cfc8;
    margin: 0 auto 12px;
  }

  .sheet h2 {
    font-size: 19px;
    margin: 8px 0 8px;
  }

  .sheet p {
    font-size: 14px;
    color: #52443d;
    margin: 0 0 12px;
  }

  .sheet .close {
    position: absolute;
    top: 12px;
    right: 16px;
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
    justify-content: space-between;
    gap: 12px;
    padding: 10px 16px;
    background: #201a17;
    color: #fff;
    box-sizing: border-box;
  }

  .bar .tx {
    font-size: 13px;
    min-width: 0;
  }

  /* ---- dark mode (matches the default variant's tokens) ---- */
  .dark-mode.campaign,
  .dark-mode .sheet {
    background: #2d2724;
    color: #f9f7f5;
    border-color: rgba(255, 255, 255, 0.15);
  }

  .dark-mode.campaign p,
  .dark-mode .sheet p {
    color: #d4cbc5;
  }

  .dark-mode .tier {
    background: transparent;
    border-color: rgba(255, 255, 255, 0.3);
    color: #f9f7f5;
  }

  .dark-mode .tier.selected,
  .dark-mode .give {
    background: #f9f7f5;
    color: #201a17;
  }

  .dark-mode .fine {
    color: #d4cbc5;
  }

  .dark-mode.strip,
  .dark-mode .bar {
    background: #f9f7f5;
    color: #201a17;
  }

  .dark-mode .sheet .grab {
    background: rgba(255, 255, 255, 0.3);
  }
`
