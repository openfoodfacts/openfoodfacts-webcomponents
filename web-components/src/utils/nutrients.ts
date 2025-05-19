import { InsightAnnotationSize } from "../types/robotoff"
import { isNullOrUndefined } from "."
import { getTaxonomyUnitById } from "../signals/taxonomies"

export enum Unit {
  NULL = "",
  MICROGRAMS = "µg",
  MILIGRAMS = "mg",
  GRAMS = "g",
  KILOJOULES = "kj",
  KILOCALORIES = "kcal",
}

export const EDITABLE_UNITS = [Unit.GRAMS, Unit.MILIGRAMS, Unit.MICROGRAMS]

export enum NutrientSuffix {
  PER_100G = "_100g",
  PER_SERVING = "_serving",
}
export const NUTRIENT_SERVING_SIZE_KEY = "serving_size"

export const INSIGHTS_ANNOTATION_SIZE = Object.values(InsightAnnotationSize)
export const NUTRIENT_SUFFIX: Record<InsightAnnotationSize, NutrientSuffix> = {
  [InsightAnnotationSize.CENTGRAMS]: NutrientSuffix.PER_100G,
  [InsightAnnotationSize.SERVING]: NutrientSuffix.PER_SERVING,
}

export const NUTRIENT_UNIT_SUFFIX = "_unit"

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

/**
 * get the possible units for a nutrient key
 * @param key - the nutrient key
 * @param fallbackUnit - the unit to check if it is forced or not.
 * For example, if the unit is "kj", it will return ["kj"].
 * @returns
 */
export const getPossibleUnits = (key: string, fallbackUnit?: string | null) => {
  if (key in FORCED_UNITS_BY_NUTRIENTS_KEYS) {
    const forcedUnit = [FORCED_UNITS_BY_NUTRIENTS_KEYS[key as ForcedNutrientKey]]
    return forcedUnit
  }
  if (isNullOrUndefined(fallbackUnit)) {
    fallbackUnit = getTaxonomyUnitById(key)
  }
  if (!fallbackUnit) {
    return []
  }
  if (EDITABLE_UNITS.includes(fallbackUnit as Unit)) {
    return EDITABLE_UNITS
  }
  return [fallbackUnit]
}

export const NUTRIENT_UNIT_NAME_PREFIX = "unit__"
