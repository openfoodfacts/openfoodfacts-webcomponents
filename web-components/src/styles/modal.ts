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
    padding: 2rem;
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

  .close-icon {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0.5rem;
    right: 0.5rem;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    cursor: pointer;
    background: transparent;
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
