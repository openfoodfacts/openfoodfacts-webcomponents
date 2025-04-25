import { signal } from "@lit-labs/signals"

export const BASE_URL = "https://world.openfoodfacts.org/api/v2"

// this enable changing open food facts URL globally
export const openfoodfactsApiUrl = signal(BASE_URL)
