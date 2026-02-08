import { css } from "lit"
import { SAFE_GREEN, SAFE_LIGHT_GREEN } from "../utils/colors"

export const ALERT = css`
  .alert {
    padding: 8px;
  }
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

  @media (prefers-color-scheme: dark) {
    .info {
      color: #a8d4f0;
      background-color: #1a2d3d !important;
      border-color: #2c4f6e;
    }

    .error {
      color: #f5a8a8;
      background-color: #3d1a1a !important;
      border-color: #6e2c2c;
    }

    .warning {
      color: #f0d8a8;
      background-color: #3d2d1a !important;
      border-color: #6e4f2c;
    }

    .success {
      color: #a8f0b0;
      background-color: #1a3d24 !important;
      border-color: #2c6e3d;
    }
  }

  :host(.dark-mode) .info,
  .info.dark-mode {
    color: #a8d4f0;
    background-color: #1a2d3d !important;
    border-color: #2c4f6e;
  }

  :host(.dark-mode) .error,
  .error.dark-mode {
    color: #f5a8a8;
    background-color: #3d1a1a !important;
    border-color: #6e2c2c;
  }

  :host(.dark-mode) .warning,
  .warning.dark-mode {
    color: #f0d8a8;
    background-color: #3d2d1a !important;
    border-color: #6e4f2c;
  }

  :host(.dark-mode) .success,
  .success.dark-mode {
    color: #a8f0b0;
    background-color: #1a3d24 !important;
    border-color: #2c6e3d;
  }
`
