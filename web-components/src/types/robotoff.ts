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

export type QuestionAnnotationAnswer = "2" | "1" | "0" | "-1" // https://openfoodfacts.github.io/robotoff/references/api/#tag/Insights/paths/~1insights~1annotate/post
export enum InsightAnnotationType {
  CENTGRAMS = "100g",
  SERVING = "serving",
}
export type InsightAnnotatationData = Record<string, { value: string; unit: string | null }>

export type InsightAnnotationAnswer = {
  insightId: string
  data: InsightAnnotatationData
  type: InsightAnnotationType
}

export type InsightsRequestParams = Partial<{
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

export type InsightDatum = {
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

export type InsightData = {
  entities: {
    postprocessed: InsightDatum[]
  }
  nutrients: Record<string, InsightDatum>
}

export type Insight = {
  id: string
  barcode: string
  type: string
  data: InsightData
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
}
export type InsightsResponse = {
  count: number
  status: string
  insights: Insight[]
}

export type NutrientAnotationFormData = {
  value: string
  unit: string | null
}

export type ImagePredictionsRequestParams = {
  count: number
  page: number
  barcode: string
  model_name: string
  min_confidence: number
}

export type ImagePrediction = {
  id: number
  type: string
  model_name: string
  model_version: string
  data: {
    entities: {
      end: number
      lang: {
        lang: string
        confidence: number
      }
      text: string
      score: number
      start: number
      raw_end: number
      ingredients: {
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
        ingredients?: {
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
        }[]
      }[]
      bounding_box: number[]
      ingredients_n: number
      known_ingredients_n: number
      unknown_ingredients_n: number
    }[]
  }
  timestamp: string
  image: {
    id: number
    barcode: string
    uploaded_at: string
    image_id: string
    source_image: string
    width: number
    height: number
    deleted: boolean
    server_type: string
    fingerprint: number
  }
  max_confidence: number
}

export type ImagePredictionsResponse = {
  count: number
  image_predictions: ImagePrediction[]
  status: string
}
