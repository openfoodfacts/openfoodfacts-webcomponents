import { css } from "lit"

export const MODAL = css`
  :host {
    display: block;
    font-family: Arial, sans-serif;
  }

  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    z-index: 1000;
    max-height: 90%;
    width: 95%;
    max-width: 500px;
    overflow-y: auto;
    box-sizing: border-box;
    animation: fadeIn 0.3s ease-in-out;
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    z-index: 999;
    animation: fadeIn 0.3s ease-in-out;
    cursor: pointer;
  }

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
    text-align: center;
  }

  .modal-buttons {
    display: flex;
    justify-content: space-between;
  }

  .modal-header {
    position: sticky;
    top: 0.5rem;
    display: flex;
    justify-content: flex-end;
  }

  .modal-body {
    padding: 0rem 2rem 1rem 2rem;
  }

  .close-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: 1px solid;
    border-color: transparent;
    border-radius: 50%;
    cursor: pointer;
    background: transparent;
  }

  .close-icon:hover {
    border-color: black;
  }

  @media (prefers-color-scheme: dark) {
    .modal {
      background: #2d2724;
      color: #f9f7f5;
    }

    .overlay {
      background: rgba(0, 0, 0, 0.8);
    }

    h2 {
      color: #f9f7f5;
    }

    .close-icon:hover {
      border-color: white;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`
