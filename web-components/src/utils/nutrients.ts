export enum Unit {
  NULL = "",
  MICROGRAMS = "µg",
  MILIGRAMS = "mg",
  GRAMS = "g",
  KILOJOULES = "kj",
  KILOCALORIES = "kcal",
}

export const EDITABLE_UNITS = [Unit.MICROGRAMS, Unit.MILIGRAMS, Unit.GRAMS]

export enum NutrientColumn {
  CENTGRAMS = "100g",
  SERVING = "serving",
}
export type NutrientSuffix = "_100g" | "_serving"

export const NUTRIENT_SERVING_SIZE_KEY = "serving_size"
export const NUTRIENT_SUFFIX: Record<NutrientColumn, NutrientSuffix> = {
  [NutrientColumn.CENTGRAMS]: "_100g",
  [NutrientColumn.SERVING]: "_serving",
}

export enum ForcedNutrientKey {
  ENERGY_KJ = "energy-kj",
  ENERGY_KCAL = "energy-kcal",
  ENERGY_FROM_FAT = "energy-from-fat",
}

export const FORCED_UNITS_BY_NUTRIENTS_KEYS = {
  [ForcedNutrientKey.ENERGY_KJ]: Unit.KILOJOULES,
  [ForcedNutrientKey.ENERGY_KCAL]: Unit.KILOCALORIES,
  [ForcedNutrientKey.ENERGY_FROM_FAT]: Unit.KILOJOULES,
}

export const getPossibleUnits = (key: string, unit?: string | null) => {
  if (unit && unit in FORCED_UNITS_BY_NUTRIENTS_KEYS) {
    const forcedUnit = [FORCED_UNITS_BY_NUTRIENTS_KEYS[key as ForcedNutrientKey]]
    return forcedUnit
  }
  if (unit === null || EDITABLE_UNITS.includes(unit as Unit)) {
    return EDITABLE_UNITS
  }
  return [unit]
}

export const NUTRIENT_UNIT_NAME_PREFIX = "unit__"
