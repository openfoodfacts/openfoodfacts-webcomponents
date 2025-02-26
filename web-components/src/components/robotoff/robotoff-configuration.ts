import { robotoffConfiguration } from "../../signals/robotoff"
import { DEFAULT_ROBOTOFF_CONFIGURATION } from "../../constants"
import { LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"

/**
 * The configuration properties of the robotoff configuration element.
 * It is used to map the configuration properties to the robotoff signals.
 */
const CONFIGURATION_PROPERTIES: Record<
  string,
  {
    propertyName: keyof RobotoffConfiguration
    converter?: (value: string) => any
  }
> = {
  "api-url": {
    propertyName: "apiUrl",
  },
  "dry-run": {
    propertyName: "dryRun",
    converter: (value: string) => value === "true",
  },
  "img-url": {
    propertyName: "imgUrl",
  },
}

/**
 * Robotoff configuration element.
 * It is used to configure the robotoff parameters.
 * @element robotoff-configuration
 */
@customElement("robotoff-configuration")
export class RobotoffConfiguration extends LitElement {
  /**
   * The robotoff API URL.
   * @attr api-url
   */
  @property({ type: String, attribute: "api-url" })
  apiUrl: string = DEFAULT_ROBOTOFF_CONFIGURATION.apiUrl

  /**
   * Whether to run robotoff in dry run mode. Il allows to run robotoff without actually sending the data to the API.
   * @attr dry-run
   */
  @property({ type: Boolean, attribute: "dry-run" })
  dryRun: boolean = DEFAULT_ROBOTOFF_CONFIGURATION.dryRun

  /**
   * The URL of the images server.
   * @attr img-url
   */
  @property({ type: String, attribute: "img-url" })
  imgUrl: string = DEFAULT_ROBOTOFF_CONFIGURATION.imgUrl

  override attributeChangedCallback(name: string, oldval: string, newval: string) {
    super.attributeChangedCallback(name, oldval, newval)
    if (name in CONFIGURATION_PROPERTIES) {
      let value
      const propertyName = CONFIGURATION_PROPERTIES[name].propertyName
      if (CONFIGURATION_PROPERTIES[name].converter) {
        value = CONFIGURATION_PROPERTIES[name].converter!(newval)
      } else {
        value = this[propertyName]
      }
      robotoffConfiguration.setItem(propertyName, value)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-configuration": RobotoffConfiguration
  }
}
