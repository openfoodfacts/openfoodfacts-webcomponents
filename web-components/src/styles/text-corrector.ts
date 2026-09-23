import { css } from "lit"
import { SAFE_LIGHT_GREEN, SAFE_LIGHT_GREY, SAFE_LIGHT_RED } from "../utils/colors"

export const TEXT_CORRECTOR = css`
  .text-section {
    padding-bottom: 0.5rem;
    border-bottom: 1px solid ${SAFE_LIGHT_GREY};
    box-shadow: 0 0.5rem 2px -2px rgba(0, 0, 0, 0.1);
  }

  h2 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }

  .text-content {
    border-radius: 4px;
    white-space: pre-wrap;
    line-height: 1.5;
  }

  .deletion {
    background-color: ${SAFE_LIGHT_RED};
  }

  .addition {
    background-color: ${SAFE_LIGHT_GREEN};
  }

  .line-through {
    text-decoration: line-through;
  }

  @media (prefers-color-scheme: dark) {
    .text-section {
      border-bottom-color: #444;
      box-shadow: 0 0.5rem 2px -2px rgba(255, 255, 255, 0.05);
    }
    .deletion {
      background-color: #5a2323;
      color: #ffb4b4;
    }
    .addition {
      background-color: #1e4526;
      color: #bbf7d0;
    }
  }
`
