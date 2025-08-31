import { DEFAULT_FOLKSONOMY_CONFIGURATION } from "../constants"
import { FolksonomyConfigurationOptions, UserInfo } from "../types/folksonomy"
import { SignalObject } from "../utils/signals"
import { State } from "@lit-labs/signals"
import folksonomyApi from "../api/folksonomy"

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

/**
 * Fetch user info and update the shared signal
 * Only fetches if not already loading or if force is true
 */
export async function fetchUserInfo(force: boolean = false): Promise<UserInfo | null> {
  // Don't fetch if already loading (unless forced)
  if (userInfoLoading.get() && !force) {
    return userInfo.get()
  }

  // Don't fetch if we already have user info (unless forced)
  if (userInfo.get() && !force) {
    return userInfo.get()
  }

  userInfoLoading.set(true)

  try {
    const fetchedUserInfo = await folksonomyApi.getUserInfo()
    userInfo.set(fetchedUserInfo)
    return fetchedUserInfo
  } catch (error) {
    console.error("Error fetching user info:", error)
    // User might not be authenticated, which is fine
    userInfo.set(null)
    return null
  } finally {
    userInfoLoading.set(false)
  }
}

/**
 * Clear user info (useful for logout)
 */
export function clearUserInfo() {
  userInfo.set(null)
  userInfoLoading.set(false)
}
