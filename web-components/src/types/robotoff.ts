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
export enum QuestionAnnotationAnswer {
  ACCEPT_AND_ADD_DATA = "2",
  ACCEPT = "1",
  REFUSE = "0",
  SKIP = "-1",
}
export enum InsightAnnotationSize {
  CENTGRAMS = "100g",
  SERVING = "serving",
}

export type InsightAnnotatationData = Record<string, { value: string; unit: string | null }>

export type InsightAnnotationAnswer = {
  insightId: string
  data: InsightAnnotatationData
  type: InsightAnnotationSize
}

export enum InsightType {
  ingredient_spellcheck = "ingredient_spellcheck",
  nutrient_extraction = "nutrient_extraction",
}

export type InsightsRequestParams = Partial<{
  language_codes: string[]
  insight_types: string
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

export type IngredientsInsight = BaseInsight<{
  lang: string
  original: string
  correction: string
  lang_confidence: number
}>

export type InsightsResponse<T extends NutrientsInsight | IngredientsInsight> = {
  count: number
  status: string
  insights: T[]
}

export type NutrientAnotationFormData = {
  value: string
  unit: string | null
}
