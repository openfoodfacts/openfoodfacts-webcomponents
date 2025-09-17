import { robotoffConfiguration } from "../../signals/robotoff"
import { folksonomyConfiguration } from "../../signals/folksonomy"
import {
  DEFAULT_ASSETS_IMAGES_PATH,
  DEFAULT_LANGUAGE_CODE,
  DEFAULT_ROBOTOFF_CONFIGURATION,
  DEFAULT_FOLKSONOMY_CONFIGURATION,
} from "../../constants"
import { LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"
import type { OffWebcomponentConfigurationOptions } from "../../types"
import type { RobotoffConfigurationOptions } from "../../types/robotoff"
import type { FolksonomyConfigurationOptions } from "../../types/folksonomy"
import { setLanguageCode } from "../../localization"
import { assetsImagesPath, countryCode } from "../../signals/app"
import { DEFAULT_OPENFOODFACTS_API_URL, openfoodfactsApiUrl } from "../../signals/openfoodfacts"

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
      setLanguageCode(value)
    },
  },
  "country-code": {
    propertyName: "countryCode",
    fn: (value: string) => {
      // Set the country code
      countryCode.set(value)
    },
  },
  "assets-images-path": {
    propertyName: "assetsImagesPath",
    fn: (value: string) => {
      assetsImagesPath.set(value)
    },
  },
  "folksonomy-configuration": {
    propertyName: "folksonomyConfiguration",
    converter: (value: string) => {
      const configuration = JSON.parse(value)
      return { ...DEFAULT_FOLKSONOMY_CONFIGURATION, ...configuration }
    },
    fn: (value: FolksonomyConfigurationOptions) => {
      // Set the folksonomy configuration
      folksonomyConfiguration.set(value)
    },
  },
  "openfoodfacts-api-url": {
    propertyName: "openfoodfactsApiUrl",
    fn: (value: string) => {
      // Set the Open Food Facts API URL
      openfoodfactsApiUrl.set(value)
    },
  },
}

/**
 * It is used to configure the OFF web components parmeters.
 * @element off-webcomponents-configuration
 */
@customElement("off-webcomponents-configuration")
export class OffWebcomponentsConfiguration extends LitElement {
  /**
   * The robotoff configuration object.
   * @type {RobotoffConfigurationOptions}
   */
  @property({ type: Object, attribute: "robotoff-configuration", reflect: true })
  robotoffConfiguration: RobotoffConfigurationOptions = {
    ...DEFAULT_ROBOTOFF_CONFIGURATION,
  }

  /**
   * The language code we need to use for the app.
   * @attr language-code
   */
  @property({ type: String, attribute: "language-code", reflect: true })
  languageCode?: string = DEFAULT_LANGUAGE_CODE

  /**
   * The country code we need to use for the app.
   * @attr country-code
   */
  @property({ type: String, attribute: "country-code", reflect: true })
  countryCode?: string

  /**
   * The image path we need to use to retrieve the images in assets/images folder.
   * @attr image-path
   */
  @property({ type: String, attribute: "assets-images-path", reflect: true })
  assetsImagesPath?: string = DEFAULT_ASSETS_IMAGES_PATH

  /**
   * The folksonomy configuration object.
   * @type {FolksonomyConfigurationOptions}
   */
  @property({ type: Object, attribute: "folksonomy-configuration", reflect: true })
  folksonomyConfiguration: FolksonomyConfigurationOptions = {
    ...DEFAULT_FOLKSONOMY_CONFIGURATION,
  }

  /**
   * The Open Food Facts API URL.
   * @attr openfoodfacts-api-url
   */
  @property({ type: String, attribute: "openfoodfacts-api-url", reflect: true })
  openfoodfactsApiUrl?: string = DEFAULT_OPENFOODFACTS_API_URL

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
}

declare global {
  interface HTMLElementTagNameMap {
    "off-webcomponent-configuration": OffWebcomponentsConfiguration
  }
}
