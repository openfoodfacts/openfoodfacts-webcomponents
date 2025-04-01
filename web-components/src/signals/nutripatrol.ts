import { DEFAULT_NUTRIPATROL_CONFIGURATION } from "../constants"
import { NutripatrolConfigurationOptions } from "../types/nutripatrol"
import { SignalObject } from "../utils/signals"

export const nutripatrolConfiguration = new SignalObject<NutripatrolConfigurationOptions>({
  ...DEFAULT_NUTRIPATROL_CONFIGURATION,
})
