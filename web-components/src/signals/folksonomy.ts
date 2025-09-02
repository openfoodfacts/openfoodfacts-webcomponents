import { DEFAULT_FOLKSONOMY_CONFIGURATION } from "../constants"
import { FolksonomyConfigurationOptions, UserInfo } from "../types/folksonomy"
import { SignalObject } from "../utils/signals"
import { State } from "@lit-labs/signals"

/**
 * Configuration for the folksonomy web components
 */
export const folksonomyConfiguration = new SignalObject<FolksonomyConfigurationOptions>({
  ...DEFAULT_FOLKSONOMY_CONFIGURATION,
})

/**
 * Shared user info signal
 */
export const userInfo = new State<UserInfo | null>(null)

/**
 * Loading state for user info
 */
export const userInfoLoading = new State<boolean>(false)
