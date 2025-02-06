export type QuestionRequestParams = Partial<{
  insight_type: string
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
