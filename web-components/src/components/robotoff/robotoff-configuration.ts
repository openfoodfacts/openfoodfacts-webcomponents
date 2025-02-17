import { LitElement } from "lit"
import { customElement, property } from "lit/decorators"
import { robotoffApiUrl } from "../../signals/robotoff"
import { ENV } from "../../constants"

/**
 * Robotoff configuration
 * @element robotoff-configuration
 */
@customElement("Robotoff-configuration")
export class RobotoffConfiguration extends LitElement {
  @property({ type: String, attribute: "robotoff-api-url" })
  robotoffApiUrl: string = "https://robotoff.openfoodfacts.org/api/v1"

  @property({ type: Boolean, attribute: "dry-run" })
  dryRun: boolean = ENV.dryRun

  override attributeChangedCallback(name: string, oldval: string, newval: string) {
    super.attributeChangedCallback(name, oldval, newval)
    if (name === "robotoff-api-url") {
      robotoffApiUrl.set(newval)
    }
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "robotoff-configuration": RobotoffConfiguration
  }
}
