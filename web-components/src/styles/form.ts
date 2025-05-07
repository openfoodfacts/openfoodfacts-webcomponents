import { css } from "lit"
import {
  SAFE_BLUE,
  SAFE_CAPPUCINO,
  SAFE_CHOCOLATE,
  SAFE_DARKER_WHITE,
  SAFE_GREY,
  SAFE_LIGHT_BLACK,
} from "../utils/colors"

export const TEXTAREA = css`
  .textarea {
    width: 100%;
    min-height: 10px;
    background-color: ${SAFE_DARKER_WHITE};
    border-style: solid;
    border-width: 1px;
    border-color: ${SAFE_GREY};
    color: ${SAFE_LIGHT_BLACK};
    line-height: 1.5;
    padding: 0.5rem;
    border-radius: 4px;
    resize: vertical;
    font-family: inherit;
    font-size: 1rem;
    box-sizing: border-box;
  }

  .textarea:focus {
    outline: none;
    border-color: ${SAFE_BLUE};
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`

export const SELECT = css`
  .select {
    position: relative;
    width: 100%;
    appearance: none;
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
    background-color: ${SAFE_DARKER_WHITE};
    background-position: 100% center;
    background-repeat: no-repeat;
    border-style: solid;
    border-width: 1px;
    border-color: ${SAFE_GREY};
    color: ${SAFE_LIGHT_BLACK};
    line-height: normal;
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
    cursor: pointer;
  }

  .select.chocolate {
    background-color: ${SAFE_CHOCOLATE};
    color: white;
    font-weight: bold;
    padding-right: 2rem;
  }
`

export const INPUT = css`
  .input,
  .input-number {
    width: 100%;
    background-color: ${SAFE_DARKER_WHITE};
    border-style: solid;
    border-width: 1px;
    border-color: ${SAFE_GREY};
    color: ${SAFE_LIGHT_BLACK};
    line-height: normal;
    padding: 0.25rem 0.5rem;
    border-radius: 5px;
    appearance: none;
    -webkit-appearance: none !important;
    box-sizing: border-box;
  }
  .input.cappucino {
    background-color: ${SAFE_CAPPUCINO};
    color: black;
  }

  .input {
    -moz-appearance: none !important;
  }

  .input-number::-webkit-outer-spin-button,
  .input-number::-webkit-inner-spin-button {
    /* display: none; <- Crashes Chrome on hover */
    -webkit-appearance: none;
    margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
  }

  .input-number {
    padding: 0.25rem 0.5rem;
    -moz-appearance: textfield !important;
  }

  .input:disabled,
  .input-number:disabled {
    background-color: ${SAFE_GREY};
    color: ${SAFE_LIGHT_BLACK};
    cursor: not-allowed;
  }
`
