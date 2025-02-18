import { robotoffApiUrl, robotoffDryRun } from "../../signals/robotoff"
import { DEFAULT_ROBOTOFF_CONFIGURATION } from "../../constants"
import { LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"

@customElement("robotoff-configuration")
export class RobotoffConfiguration extends LitElement {
  @property({ type: String, attribute: "robotoff-api-url" })
  robotoffApiUrl: string = DEFAULT_ROBOTOFF_CONFIGURATION.apiUrl

  @property({ type: Boolean, attribute: "dry-run" })
  dryRun: boolean = DEFAULT_ROBOTOFF_CONFIGURATION.dryRun

  override attributeChangedCallback(name: string, oldval: string, newval: string) {
    super.attributeChangedCallback(name, oldval, newval)
    if (name === "robotoff-api-url") {
      robotoffApiUrl.set(newval)
    } else if (name === "dry-run") {
      robotoffDryRun.set(newval === "true")
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-configuration": RobotoffConfiguration
  }
}
