import { State } from "@lit-labs/signals"
import { DEFAULT_ROBOTOFF_CONFIGURATION } from "../constants"

export const robotoffApiUrl = new State(DEFAULT_ROBOTOFF_CONFIGURATION.apiUrl)
export const robotoffDryRun = new State(DEFAULT_ROBOTOFF_CONFIGURATION.dryRun)
