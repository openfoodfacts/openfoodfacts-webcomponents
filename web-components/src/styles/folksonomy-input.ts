import { css } from "lit"

export const FOLKSONOMY_INPUT = css`
  input[type="text"] {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--off-folksonomy-input-border, #ccc);
    border-radius: 5px;
    box-sizing: border-box;
    font-size: 0.9rem;
    height: 2.2rem;
    background-color: var(--off-folksonomy-input-bg, rgb(252, 251, 251));
    color: var(--off-folksonomy-text, #333);
  }

  input[type="text"]:focus {
    outline: none;
    border-color: var(--off-folksonomy-input-focus-border, #007bff);
    box-shadow: 0 0 3px var(--off-folksonomy-input-focus-shadow, rgba(0, 123, 255, 0.5));
  }
`
