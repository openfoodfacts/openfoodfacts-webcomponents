import { DEFAULT_ROBOTOFF_CONFIGURATION } from "../constants"
import { SignalObject } from "../utils/signals"
import { RobotoffConfiguration } from "../off-webcomponents"

export const robotoffConfiguration = new SignalObject<RobotoffConfiguration>({
  ...DEFAULT_ROBOTOFF_CONFIGURATION,
})
