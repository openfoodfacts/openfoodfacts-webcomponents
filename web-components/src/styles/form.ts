import { css } from "lit"

export const SELECT = css`
  .select {
    width: 100%;
    appearance: none;
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
    background-color: #fafafa;
    background-image: url("dist/assets/carret-bottom.svg");
    background-position: 100% center;
    background-repeat: no-repeat;
    border-style: solid;
    border-width: 1px;
    border-color: #ccc;
    color: rgba(0, 0, 0, 0.75);
    line-height: normal;
    padding: 0.25rem 0.5rem;
    border-radius: 0;
  }
`

export const INPUT = css`
  .input,
  .input-number {
    width: 100%;
    background-color: #fafafa;
    border-style: solid;
    border-width: 1px;
    border-color: #ccc;
    color: rgba(0, 0, 0, 0.75);
    line-height: normal;
    padding: 0.25rem 0.5rem;
    border-radius: 0;
    appearance: none;
    -webkit-appearance: none !important;
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
`
