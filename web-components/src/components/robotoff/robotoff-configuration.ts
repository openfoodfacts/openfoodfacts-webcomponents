import { robotoffApiUrl, robotoffDryRun } from "../../signals/robotoff"
import { DEFAULT_ROBOTOFF_CONFIGURATION } from "../../constants"
import { LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"

const CONFIGURATION_PROPERTIES: Record<
  string,
  {
    signal: any
    propertyName: string
  }
> = {
  "api-url": {
    signal: robotoffApiUrl,
    propertyName: "apiUrl",
  },
  "dry-run": {
    signal: robotoffDryRun,
    propertyName: "dryRun",
  },
}

/**
 * Robotoff configuration element.
 * It is used to configure the robotoff parameters.
 * @element robotoff-configuration
 */
@customElement("robotoff-configuration")
export class RobotoffConfiguration extends LitElement {
  @property({ type: String, attribute: "api-url" })
  apiUrl: string = DEFAULT_ROBOTOFF_CONFIGURATION.apiUrl

  @property({ type: Boolean, attribute: "dry-run" })
  dryRun: boolean = DEFAULT_ROBOTOFF_CONFIGURATION.dryRun

  override attributeChangedCallback(name: string, oldval: string, newval: string) {
    super.attributeChangedCallback(name, oldval, newval)
    if (name in CONFIGURATION_PROPERTIES) {
      const value = this[CONFIGURATION_PROPERTIES[name].propertyName as keyof this]
      CONFIGURATION_PROPERTIES[name].signal.set(value as any)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-configuration": RobotoffConfiguration
  }
}
