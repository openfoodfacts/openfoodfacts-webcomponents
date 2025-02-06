import { ROBOTOFF_API_URL, IS_DEVELOPMENT_MODE } from "../constants"
import { addParamsToUrl, removeEmptyKeys } from "../utils"
import { getLocale } from "../localization"
import { QuestionRequestParams, QuestionsResponse } from "../types/robotoff"

const robotoff = {
  annotate(insightId: string, annotation: string) {
    if (IS_DEVELOPMENT_MODE) {
      console.log(
        `Annotated, ${ROBOTOFF_API_URL}/insights/annotate`,
        new URLSearchParams(
          `insight_id=${insightId}&annotation=${annotation}&update=1`
        )
      )
      return
    } else {
      return fetch(`${ROBOTOFF_API_URL}/insights/annotate`, {
        method: "POST",
        body: new URLSearchParams(
          `insight_id=${insightId}&annotation=${annotation}&update=1`
        ),
        credentials: "include",
      })
    }
  },

  async questionsByProductCode(
    code: string,
    questionRequestParams: QuestionRequestParams = {}
  ) {
    if (!questionRequestParams.lang) {
      questionRequestParams.lang = getLocale()
    }
    const url = addParamsToUrl(
      `${ROBOTOFF_API_URL}/questions/${code}`,
      questionRequestParams
    )
    const response = await fetch(url)
    const result: QuestionsResponse = await response.json()
    return result
  },
  //
  // async questions(filterState: QuestionRequestParams, count = 10, page = 1) {
  //   const {
  //     insightType,
  //     brandFilter,
  //     valueTag,
  //     countryFilter,
  //     sortByPopularity,
  //     campaign,
  //     predictor,
  //   } = filterState
  //
  //   // const searchParams = {
  //   //   insight_types: insightType,
  //   //   value_tag: valueTag,
  //   //   brands: reformatValueTag(brandFilter),
  //   //   countries: countryId2countryCode(
  //   //     countryFilter !== "en:world" ? countryFilter : null
  //   //   ),
  //   //   campaign,
  //   //   predictor,
  //   //   order_by: sortByPopularity ? "popularity" : "random",
  //   // }
  //
  //   const lang = getLocale()
  //
  //   const response = await fetch(
  //     `${ROBOTOFF_API_URL}/questions/?${new URLSearchParams(
  //       removeEmptyKeys({
  //         ...searchParams,
  //         lang,
  //         count,
  //         page,
  //       })
  //     )}`
  //   )
  //   return response.json()
  // },

  async insightDetail(insight_id: string) {
    const response = await fetch(
      `${ROBOTOFF_API_URL}/insights/detail/${insight_id}`
    )
    return response.json()
  },

  async loadLogo(logoId: string) {
    const response = await fetch(`${ROBOTOFF_API_URL}/images/logos/${logoId}`)
    return response.json()
  },

  async updateLogo(logoId: string, value: any, type: string) {
    return fetch(`${ROBOTOFF_API_URL}/images/logos/${logoId}`, {
      method: "PUT",
      body: JSON.stringify(removeEmptyKeys({ value, type })),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
  },

  async searchLogos(
    barcode: string,
    value: any,
    type: string,
    count = 25,
    random = false
  ) {
    const formattedValue = /^[a-z][a-z]:/.test(value)
      ? { taxonomy_value: value }
      : { value }

    const response = await fetch(
      `${ROBOTOFF_API_URL}/images/logos/search/?${new URLSearchParams(
        removeEmptyKeys({
          barcode,
          type,
          count,
          random,
          ...formattedValue,
        })
      )}`
    )
    return response.json()
  },

  async getLogoAnnotations(logoId: string, index: number, count = 25) {
    const url =
      logoId.length > 0
        ? `${ROBOTOFF_API_URL}/ann/search/${logoId}`
        : `${ROBOTOFF_API_URL}/ann/search`
    const response = await fetch(
      `${url}?${new URLSearchParams(removeEmptyKeys({ index, count }))}`
    )
    return response.json()
  },

  async annotateLogos(annotations: string) {
    return fetch(`${ROBOTOFF_API_URL}/images/logos/annotate`, {
      method: "POST",
      body: JSON.stringify(removeEmptyKeys({ annotations })),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
  },

  async getInsights(
    barcode = "",
    insightType = "",
    valueTag = "",
    annotation = "",
    page = 1,
    count = 25,
    campaigns = "",
    country = ""
  ) {
    let annotated
    if (annotation.length && annotation === "not_annotated") {
      annotated = "0"
      annotation = ""
    }
    const response = await fetch(
      `${ROBOTOFF_API_URL}/insights?${new URLSearchParams(
        removeEmptyKeys({
          barcode,
          insight_types: insightType,
          value_tag: valueTag,
          annotation,
          page,
          annotated,
          count,
          campaigns,
          countries: country,
        })
      )}`
    )
    return response.json()
  },

  async getUserStatistics(username: string) {
    const response = await fetch(
      `${ROBOTOFF_API_URL}/users/statistics/${username}`
    )
    return response.json()
  },

  getCroppedImageUrl(
    imageUrl: string,
    boundingBox: [number, number, number, number]
  ) {
    const [y_min, x_min, y_max, x_max] = boundingBox
    return `${ROBOTOFF_API_URL}/images/crop?image_url=${imageUrl}&y_min=${y_min}&x_min=${x_min}&y_max=${y_max}&x_max=${x_max}`
  },

  async getLogosImages(logoIds: string[]) {
    const response = await fetch(
      `${ROBOTOFF_API_URL}/images/logos?logo_ids=${logoIds.join(",")}`
    )
    return response.json()
  },

  async getUnansweredValues(params: {
    type: "label" | "brand" | "category"
    countryCode: string
    campaign: string
    page?: number
    count?: number
  }) {
    const { page = 1, countryCode, ...other } = params

    const response = await fetch(
      `${ROBOTOFF_API_URL}/questions/unanswered/?${new URLSearchParams(
        removeEmptyKeys({
          ...other,
          countries: countryCode,
          page: page >= 1 ? page : 1,
        })
      )}`
    )
    return response.json()
  },
}

export default robotoff
