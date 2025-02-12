import { css, type CSSResult } from "lit-element"
import { SAFE_CAPPUCINO, SAFE_CHOCOLATE } from "../utils/colors"

export enum ButtonType {
  Chocolate = "chocolate",
  Cappucino = "cappucino",
  ChocolateOutline = "chocolate-outline",
  White = "white",
  LINK = "link",
}

export const getDefaultButtonClasses = (): CSSResult => {
  return css`
    .button {
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      font-size: 1rem;
      border-width: 1px;
      border-style: solid;
      cursor: pointer;
    }
    .button.rounded {
      border-radius: 50%;
    }
  `
}

export const BUTTON_CLASS_BY_TYPE: Record<ButtonType, CSSResult> = {
  [ButtonType.Chocolate]: css`
    .chocolate-button {
      background-color: ${SAFE_CHOCOLATE};
      border-color: ${SAFE_CHOCOLATE};
      color: white;
    }

    .chocolate-button:hover {
      background-color: white;
      color: ${SAFE_CHOCOLATE};
    }
  `,
  [ButtonType.Cappucino]: css`
    .cappucino-button {
      background-color: ${SAFE_CAPPUCINO};
      border-color: ${SAFE_CAPPUCINO};
      color: black;
    }

    .cappucino-button:hover {
      background-color: white;
    }
  `,
  [ButtonType.ChocolateOutline]: css`
    .chocolate-button-outline {
      background-color: transparent;
      border-color: ${SAFE_CHOCOLATE};
      color: ${SAFE_CHOCOLATE};
    }

    .chocolate-button-outline:hover {
      background-color: ${SAFE_CHOCOLATE};
      color: white;
    }
  `,
  [ButtonType.White]: css`
    .white-button {
      background-color: white;
      border-color: white;
      color: black;
    }

    .white-button:hover {
      border-color: black;
      background-color: black;
      color: white;
    }
  `,
  [ButtonType.LINK]: css`
    .link-button {
      text-decoration: none;
      background-color: transparent;
      border-color: transparent;
      cursor: pointer;
      color: black;
    }

    .link-button:hover {
      text-decoration: underline;
    }
  `,
}

export const getButtonClasses = (types: ButtonType[]): CSSResult[] => {
  let buttonClasses = [getDefaultButtonClasses()]

  types.forEach((type) => {
    buttonClasses.push(BUTTON_CLASS_BY_TYPE[type])
  })
  return buttonClasses
}
