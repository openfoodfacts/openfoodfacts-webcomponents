import axios from "axios"
import { ROBOTOFF_API_URL, IS_DEVELOPMENT_MODE } from "../constants"
import COUNTRIES from "../utils/countries.json"
import { reformatValueTag, removeEmptyKeys } from "../utils"
import { getLocale } from "../localization"
import { QuestionFilter } from "../types"

export interface QuestionInterface {
  barcode: string
  insight_id: string
  insight_type: string
  question: string
  source_image_url?: string
  type: string
  value: string
  value_tag: string
}

type GetQuestionsResponse = { count: number; questions: QuestionInterface[] }

function countryId2countryCode(id: string | null) {
  if (id === null) {
    return null
  }
  const code = COUNTRIES.find((c) => c.id === id)?.countryCode
  if (code) {
    return code.toLowerCase()
  }
  return code
}

const robotoff = {
  annotate(insightId: string, annotation: string) {
    if (IS_DEVELOPMENT_MODE) {
      console.log(
        `Annotated, ${ROBOTOFF_API_URL}/insights/annotate`,
        new URLSearchParams(
          `insight_id=${insightId}&annotation=${annotation}&update=1`
        ),
        { withCredentials: true }
      )
      return
    } else {
      return axios.post(
        `${ROBOTOFF_API_URL}/insights/annotate`,
        new URLSearchParams(
          `insight_id=${insightId}&annotation=${annotation}&update=1`
        ),
        { withCredentials: true }
      )
    }
  },

  questionsByProductCode(code: string) {
    return axios
      .get<GetQuestionsResponse>(`${ROBOTOFF_API_URL}/questions/${code}`)
      .then((result) => {
        const questions = result.data.questions
        result.data.questions = questions.filter(
          (question) => question.source_image_url
        )
        return result
      })
  },

  questions(filterState: QuestionFilter, count = 10, page = 1) {
    const {
      insightType,
      brandFilter,
      valueTag,
      countryFilter,
      sortByPopularity,
      campaign,
      predictor,
    } = filterState

    const searchParams = {
      insight_types: insightType,
      value_tag: valueTag,
      brands: reformatValueTag(brandFilter),
      countries: countryId2countryCode(
        countryFilter !== "en:world" ? countryFilter : null
      ),
      campaign,
      predictor,
      order_by: sortByPopularity ? "popularity" : "random",
    }

    const lang = getLocale()

    return axios.get<GetQuestionsResponse>(`${ROBOTOFF_API_URL}/questions/`, {
      params: removeEmptyKeys({
        ...searchParams,
        lang,
        count,
        page,
      }),
    })
  },

  insightDetail(insight_id: string) {
    return axios.get(`${ROBOTOFF_API_URL}/insights/detail/${insight_id}`)
  },

  loadLogo(logoId: string) {
    return axios.get(`${ROBOTOFF_API_URL}/images/logos/${logoId}`)
  },

  updateLogo(logoId: string, value: any, type: string) {
    return axios.put(
      `${ROBOTOFF_API_URL}/images/logos/${logoId}`,
      removeEmptyKeys({
        value,
        type,
      }),
      { withCredentials: true }
    )
  },

  searchLogos(
    barcode: string,
    value: any,
    type: string,
    count = 25,
    random = false
  ) {
    const formattedValue = /^[a-z][a-z]:/.test(value)
      ? { taxonomy_value: value }
      : { value }

    return axios.get(`${ROBOTOFF_API_URL}/images/logos/search/`, {
      params: removeEmptyKeys({
        barcode,
        type,
        count,
        random,
        ...formattedValue,
      }),
    })
  },

  getLogoAnnotations(logoId: string, index: number, count = 25) {
    const url =
      logoId.length > 0
        ? `${ROBOTOFF_API_URL}/ann/search/${logoId}`
        : `${ROBOTOFF_API_URL}/ann/search`
    return axios.get(url, {
      params: removeEmptyKeys({
        index,
        count,
      }),
    })
  },

  annotateLogos(annotations: string) {
    return axios.post(
      `${ROBOTOFF_API_URL}/images/logos/annotate`,
      removeEmptyKeys({
        annotations,
      }),
      { withCredentials: true }
    )
  },

  getInsights(
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
    return axios.get(`${ROBOTOFF_API_URL}/insights`, {
      params: removeEmptyKeys({
        barcode,
        insight_types: insightType,
        value_tag: valueTag,
        annotation,
        page,
        annotated,
        count,
        campaigns,
        countries: country,
      }),
    })
  },

  getUserStatistics(username: string) {
    return axios.get(`${ROBOTOFF_API_URL}/users/statistics/${username}`)
  },

  getCroppedImageUrl(
    imageUrl: string,
    boundingBox: [number, number, number, number]
  ) {
    const [y_min, x_min, y_max, x_max] = boundingBox
    return `${ROBOTOFF_API_URL}/images/crop?image_url=${imageUrl}&y_min=${y_min}&x_min=${x_min}&y_max=${y_max}&x_max=${x_max}`
  },

  getLogosImages(logoIds: string[]) {
    return axios.get(
      `${ROBOTOFF_API_URL}/images/logos?logo_ids=${logoIds.join(",")}`
    )
  },

  getUnansweredValues(params: {
    type: "label" | "brand" | "category"
    countryCode: string
    campaign: string
    page?: number
    count?: number
  }) {
    const { page = 1, countryCode, ...other } = params

    return axios.get(
      `${ROBOTOFF_API_URL}/questions/unanswered/?${Object.entries(
        removeEmptyKeys({
          ...other,
          countries: countryCode,
          page: page >= 1 ? page : 1,
        })
      )
        .map(([key, value]) => `${key}=${value}`)
        .join("&")}`
    )
  },
}

export default robotoff
