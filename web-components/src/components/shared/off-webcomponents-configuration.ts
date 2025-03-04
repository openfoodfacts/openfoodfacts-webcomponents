import { robotoffConfiguration } from "../../signals/robotoff"
import { DEFAULT_LANGUAGE_CODE, DEFAULT_ROBOTOFF_CONFIGURATION } from "../../constants"
import { LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"
import { OffWebcomponentConfigurationOptions } from "../../types"
import { RobotoffConfigurationOptions } from "../../types/robotoff"
import { setLocale } from "../../localization"

/**
 * The configuration properties of the webcomponent configuration element.
 * It is used to map the configuration properties to the robotoff signals.
 */
const CONFIGURATION_PROPERTIES: Record<
  string,
  {
    propertyName: keyof OffWebcomponentConfigurationOptions
    converter?: (value: string) => any
    fn: (value: any) => void
  }
> = {
  "robotoff-configuration": {
    propertyName: "robotoffConfiguration",
    converter: (value: string) => {
      const configuration = JSON.parse(value)
      return { ...DEFAULT_ROBOTOFF_CONFIGURATION, ...configuration }
    },
    fn: (value: RobotoffConfigurationOptions) => {
      robotoffConfiguration.set(value)
    },
  },
  "language-code": {
    propertyName: "languageCode",
    fn: (value: string) => {
      setLocale(value)
    },
  },
}

/**
 * Robotoff configuration element.
 * It is used to configure the robotoff parameters.
 * @element off-w-configuration
 */
@customElement("off-webcomponents-configuration")
export class OffWebcomponentsConfiguration extends LitElement {
  /**
   * The robotoff configuration object.
   * @attr robotoff-api-url
   * @attr robotoff-dry-run
   * @attr robotoff-img-url
   */
  @property({ type: Object, attribute: "robotoff-configuration" })
  robotoffConfiguration: RobotoffConfigurationOptions = {
    apiUrl: DEFAULT_ROBOTOFF_CONFIGURATION.apiUrl,
    dryRun: DEFAULT_ROBOTOFF_CONFIGURATION.dryRun,
    imgUrl: DEFAULT_ROBOTOFF_CONFIGURATION.imgUrl,
  }

  /**
   * The language code we need to use for the app.
   * @attr language-code
   */
  @property({ type: String, attribute: "language-code" })
  languageCode?: string = DEFAULT_LANGUAGE_CODE

  override attributeChangedCallback(name: string, oldval: string, newval: string) {
    super.attributeChangedCallback(name, oldval, newval)
    if (name in CONFIGURATION_PROPERTIES) {
      let value
      let config = CONFIGURATION_PROPERTIES[name]
      const propertyName = config.propertyName
      if (CONFIGURATION_PROPERTIES[name].converter) {
        value = CONFIGURATION_PROPERTIES[name].converter!(newval)
      } else {
        value = this[propertyName]
      }
      config.fn(value)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "off-webcomponents-configuration": OffWebcomponentsConfiguration
  }
}
