import { DEFAULT_FOLKSONOMY_CONFIGURATION } from "../constants"
import { FolksonomyConfigurationOptions } from "../types/folksonomy"
import { SignalObject } from "../utils/signals"

/**
 * Configuration for the folksonomy web components
 */
export const folksonomyConfiguration = new SignalObject<FolksonomyConfigurationOptions>({
  ...DEFAULT_FOLKSONOMY_CONFIGURATION,
})
