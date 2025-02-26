import { DEFAULT_ROBOTOFF_CONFIGURATION } from "../constants"
import { RobotoffConfigurationOptions } from "../types/robotoff"
import { SignalObject } from "../utils/signals"

export const robotoffConfiguration = new SignalObject<RobotoffConfigurationOptions>({
  ...DEFAULT_ROBOTOFF_CONFIGURATION,
})
