import { LitElement, html, css } from "lit"
import { customElement, property } from "lit/decorators.js"

@customElement("robotoff-nutrients-table")
export class RobotoffNutrientsTable extends LitElement {}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-nutrients-table": RobotoffNutrientsTable
  }
}
