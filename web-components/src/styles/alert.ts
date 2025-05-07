import { css } from "lit"
import { SAFE_GREEN, SAFE_LIGHT_GREEN } from "../utils/colors"

export const ALERT = css`
  button.alert {
    display: flex;
    appearance: none;
    cursor: pointer;
    width: 100%;
  }
  .error {
    padding: 1rem;
    text-align: center;
    color: #d9534f;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
    margin: 0.5rem 0;
  }

  .info {
    padding: 1rem;
    text-align: center;
    color: #31708f;
    background-color: #d9edf7;
    border: 1px solid #bce8f1;
    border-radius: 4px;
    margin: 0.5rem 0;
  }
  .warning {
    padding: 0.75rem;
    color: #8a6d3b;
    background-color: #fcf8e3;
    border: 1px solid #faebcc;
    border-radius: 4px;
    font-size: 0.9rem;
    margin: 0.5rem 0;
  }
  .success {
    padding: 1rem;
    text-align: center;
    color: ${SAFE_GREEN};
    background-color: ${SAFE_LIGHT_GREEN};
    border: 1px solid #d6e9c6;
    border-radius: 4px;
    margin: 0.5rem 0;
    font-weight: bold;
  }

  .alert.with-icons {
    display: grid;
    grid-template-columns: 2rem 1fr 2rem;
    align-items: center;
    gap: 0.5rem;
  }
`
