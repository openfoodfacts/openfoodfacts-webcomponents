export type Product = {
  name: string
  price: number
  description: string
  imgUrl: string
}

export type QuestionFilter = {
  insightType: string
  brandFilter: string
  valueTag: string
  countryFilter: string | null
  sortByPopularity: boolean
  campaign: string
  predictor: string
}
