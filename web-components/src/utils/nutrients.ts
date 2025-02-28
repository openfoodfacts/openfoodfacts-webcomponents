import { msg } from "@lit/localize"
import { InsightAnnotationType } from "../types/robotoff"
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

export type NutrientSuffix = "_100g" | "_serving"

export const NUTRIENT_SERVING_SIZE_KEY = "serving_size"
export const NUTRIENT_SUFFIX: Record<InsightAnnotationType, NutrientSuffix> = {
  [InsightAnnotationType.CENTGRAMS]: "_100g",
  [InsightAnnotationType.SERVING]: "_serving",
}

export const ANNOTATION_TYPE_LABELS: Record<InsightAnnotationType, () => string> = {
  [InsightAnnotationType.CENTGRAMS]: () => msg("100g"),
  [InsightAnnotationType.SERVING]: () => msg("Specified serving"),
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

/**
 * get the possible units for a nutrient key
 * @param key - the nutrient key
 * @param unit - the unit to check if it is forced or not.
 * For example, if the unit is "kj", it will return ["kj"].
 * @returns
 */
export const getPossibleUnits = (key: string, unit?: string | null) => {
  if (key in FORCED_UNITS_BY_NUTRIENTS_KEYS) {
    const forcedUnit = [FORCED_UNITS_BY_NUTRIENTS_KEYS[key as ForcedNutrientKey]]
    return forcedUnit
  }
  if (isNullOrUndefined(unit)) {
    unit = getTaxonomyUnitById(key)
  }
  if (!unit || EDITABLE_UNITS.includes(unit as Unit)) {
    return EDITABLE_UNITS
  }
  return [unit]
}

export const NUTRIENT_UNIT_NAME_PREFIX = "unit__"
