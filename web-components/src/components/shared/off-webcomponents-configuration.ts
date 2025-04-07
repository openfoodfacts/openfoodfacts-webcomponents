import { robotoffConfiguration } from "../../signals/robotoff"
import {
  DEFAULT_ASSETS_IMAGES_PATH,
  DEFAULT_LANGUAGE_CODE,
  DEFAULT_ROBOTOFF_CONFIGURATION,
} from "../../constants"
import { LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"
import { OffWebcomponentConfigurationOptions } from "../../types"
import { RobotoffConfigurationOptions } from "../../types/robotoff"
import { getLocale, setLocale } from "../../localization"
import { assetsImagesPath } from "../../signals/app"
import { sourceLocale } from "../../localization/dist/locale-codes"

/**
 * The configuration properties of the webcomponent configuration element.
 * It is used to configure the app parameters.
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
      // Set the robotoff configuration
      robotoffConfiguration.set(value)
    },
  },
  "language-code": {
    propertyName: "languageCode",
    fn: (value: string) => {
      // Set the language code
      setLocale(value)
    },
  },
  "assets-images-path": {
    propertyName: "assetsImagesPath",
    fn: (value: string) => {
      assetsImagesPath.set(value)
    },
  },
}

/**
 * Robotoff configuration element.
 * It is used to configure the robotoff parameters.
 * @element off-webcomponents-configuration
 */
@customElement("off-webcomponents-configuration")
export class OffWebcomponentsConfiguration extends LitElement {
  /**
   * The robotoff configuration object.
   * @type {RobotoffConfigurationOptions}
   */
  @property({ type: Object, attribute: "robotoff-configuration" })
  robotoffConfiguration: RobotoffConfigurationOptions = {
    ...DEFAULT_ROBOTOFF_CONFIGURATION,
  }

  /**
   * The language code we need to use for the app.
   * @attr language-code
   */
  @property({ type: String, attribute: "language-code" })
  languageCode?: string = DEFAULT_LANGUAGE_CODE

  /**
   * The image path we need to use to retrieve the images in assets/images folder.
   * @attr image-path
   */
  @property({ type: String, attribute: "assets-images-path" })
  assetsImagesPath?: string = DEFAULT_ASSETS_IMAGES_PATH

  override attributeChangedCallback(name: string, oldval: string, newval: string) {
    super.attributeChangedCallback(name, oldval, newval)
    if (name in CONFIGURATION_PROPERTIES) {
      let value
      const config = CONFIGURATION_PROPERTIES[name]
      const propertyName = config.propertyName
      if (CONFIGURATION_PROPERTIES[name].converter) {
        value = CONFIGURATION_PROPERTIES[name].converter!(newval)
      } else {
        value = this[propertyName]
      }
      // Run the callback function that apply configuration
      config.fn.call(this, value)
    }
  }

  override connectedCallback(): void {
    super.connectedCallback()
    // Set the language code to default language code (en) if local is still in source locale
    if (getLocale() !== sourceLocale) {
      CONFIGURATION_PROPERTIES["language-code"].fn.call(this, this.languageCode)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "off-webcomponent-configuration": OffWebcomponentsConfiguration
  }
}
