import { css } from "lit"

export const FOLKSONOMY_INPUT = css`
  input[type="text"] {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
    font-size: 0.9rem;
    height: 2.2rem;
    background-color: rgb(252, 251, 251);
  }

  input[type="text"]:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 3px rgba(0, 123, 255, 0.5);
  }
`
