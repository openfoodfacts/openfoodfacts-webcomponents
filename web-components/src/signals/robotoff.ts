import { DEFAULT_ROBOTOFF_CONFIGURATION } from "../constants"
import type { RobotoffConfigurationOptions } from "../types/robotoff"
import { SignalObject } from "../utils/signals"

/**
 * Configuration for the robotoff web components
 */
export const robotoffConfiguration = new SignalObject<RobotoffConfigurationOptions>({
  ...DEFAULT_ROBOTOFF_CONFIGURATION,
})

export const getRobotoffImageUrl = (path: string) =>
  `${robotoffConfiguration.getItem("imgUrl")}${path}`
