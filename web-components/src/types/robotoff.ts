export type RobotoffConfigurationOptions = {
  apiUrl: string
  dryRun: boolean
  imgUrl: string
}

export type QuestionRequestParams = Partial<{
  insight_types: string
  brand_filter: string
  value_tag: string
  country_filter: string
  sort_by_popularity: boolean
  campaign: string
  predictor: string
  lang: string
}>

export type Question = {
  barcode: string
  server_type: string
  type: string
  value: string
  question: string
  insight_id: string
  insight_type: string
  value_tag: string
  source_image_url: string
}

export type QuestionsResponse = {
  status: string
  questions: Question[]
}

// https://openfoodfacts.github.io/robotoff/references/api/#tag/Insights/paths/~1insights~1annotate/post
export enum AnnotationAnswer {
  ACCEPT_AND_ADD_DATA = "2",
  ACCEPT = "1",
  REFUSE = "0",
  SKIP = "-1",
}
export enum InsightAnnotationSize {
  CENTGRAMS = "100g",
  SERVING = "serving",
}
export enum QuestionAnnotationAnswer {
  YES = "1",
  NO = "0",
  ANNOTATED = "2",
  SKIP = "-1",
} // https://openfoodfacts.github.io/robotoff/references/api/#tag/Insights/paths/~1insights~1annotate/post

export type InsightAnnotatationData = Record<string, { value: string; unit: string | null }>

export type InsightAnnotationAnswer = {
  insightId: string
  data: InsightAnnotatationData
  type: InsightAnnotationSize
}

export enum InsightType {
  ingredient_spellcheck = "ingredient_spellcheck",
  nutrient_extraction = "nutrient_extraction",
  ingredient_detection = "ingredient_detection",
}

export type InsightsRequestParams = Partial<{
  lc: string[]
  insight_types: string | string[]
  barcode: string
  annotated: boolean
  annotation: number
  value_tag: string
  brands: string
  countries: string
  server_type: string
  predictor: string
  order_by: string
  count: number
  page: number
  campaigns: string
}>

export type NutrientInsightDatum = {
  end: number
  text: string
  unit: string
  score: number
  start: number
  valid: boolean
  value: string
  entity: string
  char_end: number
  char_start: number
}

export type NutrientInsightData = {
  entities: {
    postprocessed: NutrientInsightDatum[]
  }
  nutrients: Record<string, NutrientInsightDatum>
}

export type BaseInsight<DataType> = {
  id: string
  barcode: string
  type: string
  timestamp: string | null
  completed_at: string | null
  annotation: string | null
  annotated_result: string | null
  n_votes: number
  username: string | null
  countries: string[]
  brands: string[]
  process_after: string | null
  value_tag: string | null
  value: string | null
  source_image: string | null
  automatic_processing: boolean
  server_type: string
  unique_scans_n: number
  reserved_barcode: boolean
  predictor: string
  predictor_version: string
  campaign: string[]
  confidence: number | null
  bounding_box: string | null
  data: DataType
}

export type NutrientsInsight = BaseInsight<NutrientInsightData>

export type IngredientSpellcheckInsight = BaseInsight<{
  lang: string
  original: string
  correction: string
  lang_confidence: number
}>

interface Lang {
  lang: string
  confidence: number
}

interface IngredientDetection {
  id: string
  text: string
  vegan?: string
  vegetarian?: string
  in_taxonomy: boolean
  ingredients?: IngredientDetection[]
  is_in_taxonomy?: number
  ciqual_food_code?: string
  ciqual_proxy_food_code?: string
  from_palm_oil?: string
  percent_estimate: number
  percent_max?: number
  percent_min?: number
  ecobalyse_code?: string
  processing?: string
  labels?: string
  bounding_box?: RobotoffBoundingBox
}

export type IngredientDetectionInsight = BaseInsight<{
  end: number
  lang: Lang
  text: string
  score: number
  start: number
  raw_end: number
  priority: number
  ingredients: IngredientDetection[]
  bounding_box: RobotoffBoundingBox
  ingredients_n: number
  known_ingredients_n: number
  unknown_ingredients_n: number
  fraction_known_ingredients: number
  rotation: number
}>

export type InsightsResponse<
  T extends NutrientsInsight | IngredientSpellcheckInsight | IngredientDetectionInsight,
> = {
  count: number
  status: string
  insights: T[]
}

export type NutrientAnotationFormData = {
  value: string
  unit: string | null
}

export type NutrientsAnnotationData = {
  serving_size: string | null
  nutrients: Record<string, NutrientAnotationFormData>
  nutrition_data_per: string
}

export type AnnotationFormData = {
  insight_id: string
  annotation: AnnotationAnswer
  data?: string
}

export type ImagePredictionsRequestParams = {
  count: number
  page: number
  barcode: string
  model_name: string
  min_confidence: number
}

export type IngredientPrediction = {
  id: string
  text: string
  vegan?: string
  vegetarian?: string
  in_taxonomy: boolean
  percent_max: number
  percent_min: number
  is_in_taxonomy: number
  percent_estimate: number
  ciqual_proxy_food_code?: string
  ingredients?: IngredientPrediction[]
}
export type RobotoffBoundingBox = [number, number, number, number]

export type IngredientDetectionAnnotationData = {
  annotation: string
  bounding_box: RobotoffBoundingBox
  rotation: number
}
