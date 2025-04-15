import { css } from "lit"
import { SAFE_DARKER_WHITE, SAFE_GREY } from "../utils/colors"

export const POPOVER = css`
  .popover-wrapper {
    position: relative;
    cursor: pointer;
    display: inline-block;
  }

  .popover {
    position: absolute;
    z-index: 10;
    background-color: ${SAFE_DARKER_WHITE};
    border: 1px solid ${SAFE_GREY};
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    padding: 0.75rem;
    max-width: 300px;
    width: 100%;
    height: auto;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 0.5rem;
    white-space: normal;
    text-decoration: none;
    color: inherit;
  }

  .popover::before,
  .popover::after {
    content: "";
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: solid transparent;
  }

  .popover::before {
    border-bottom-color: ${SAFE_GREY};
    border-width: 8px;
    margin-left: 0px;
  }

  .popover::after {
    border-bottom-color: ${SAFE_DARKER_WHITE};
    border-width: 7px;
    margin-left: 0px;
  }

  .popover-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .popover-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }

  /* Position variants */
  .popover.popover-top {
    top: auto;
    bottom: 100%;
    margin-top: 0;
    margin-bottom: 0.5rem;
  }

  .popover.popover-top::before,
  .popover.popover-top::after {
    top: 100%;
    bottom: auto;
  }

  .popover.popover-top::before {
    border-top-color: ${SAFE_GREY};
    border-bottom-color: transparent;
  }

  .popover.popover-top::after {
    border-top-color: ${SAFE_DARKER_WHITE};
    border-bottom-color: transparent;
  }

  .popover.popover-left {
    left: 0;
    transform: none;
  }

  .popover.popover-left::before,
  .popover.popover-left::after {
    left: 20px;
    transform: none;
  }

  .popover.popover-right {
    left: auto;
    right: 0;
    transform: none;
  }

  .popover.popover-right::before,
  .popover.popover-right::after {
    left: auto;
    right: 20px;
    transform: none;
  }

  .popover .button {
    display: flex;
  }
`
