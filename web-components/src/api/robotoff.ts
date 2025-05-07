import { addParamsToUrl } from "../utils"
import { getLocaleAfterInit } from "../localization"
import {
  QuestionRequestParams,
  QuestionsResponse,
  AnnotationAnswer,
  InsightsRequestParams,
  InsightsResponse,
  InsightAnnotationAnswer,
  NutrientsInsight,
  IngredientsInsight,
  NutrientsAnnotationData,
} from "../types/robotoff"
import { robotoffConfiguration } from "../signals/robotoff"

/**
 * Get the API URL for a given path with the current configuration
 * @param path
 * @returns {string}
 */

const getApiUrl = (path: string) => {
  return `${robotoffConfiguration.getItem("apiUrl")}${path}`
}

/**
 * Annotate an insight
 * @param formBody
 * @returns {Promise<Response>}
 */

const annotate = (formBody: string) => {
  const apiUrl = getApiUrl("/insights/annotate")
  if (robotoffConfiguration.getItem("dryRun")) {
    console.log("Annotated :", apiUrl, formBody)
    return
  } else {
    return fetch(apiUrl, {
      method: "POST",
      body: formBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      credentials: "include",
    })
  }
}
/**
 * Robotoff API
 */
const robotoff = {
  annotate,
  annotateQuestion(insightId: string, annotation: AnnotationAnswer) {
    const formBody = new URLSearchParams({
      insight_id: insightId,
      annotation: annotation,
    }).toString()
    return annotate(formBody)
  },
  annotateNutrients(annotation: InsightAnnotationAnswer) {
    const servingSize = annotation.data["serving_size"]?.value ?? null
    // Clone the nutrients object to avoid mutating the original annotation.data
    const clonedData = { ...annotation.data }
    delete clonedData["serving_size"]
    const data: NutrientsAnnotationData = {
      nutrients: clonedData,
      nutrition_data_per: annotation.type,
      serving_size: servingSize,
    }

    const formBody = new URLSearchParams({
      annotation: AnnotationAnswer.ACCEPT_AND_ADD_DATA,
      insight_id: annotation.insightId,
      data: JSON.stringify(data),
    }).toString()
    return annotate(formBody)
  },

  /**
   * Annotate an insight
   * @param insightId The insight id
   * @param annotation The annotation answer ${QuestionAnnotationAnswer}
   * @param correction The correction given by the user if the correction is different
   * from the one proposed by the insight or the original one
   * @returns {Promise<Response>}
   */
  annotateIngredients(insightId: string, annotation: AnnotationAnswer, correction?: string) {
    const data: Record<string, string> = {
      insight_id: insightId,
      annotation,
    }
    if (correction) {
      data.data = JSON.stringify({ correction })
    }
    const formBody = new URLSearchParams(data).toString()
    return annotate(formBody)
  },

  /**
   * Get questions by product code
   * @param code The product code
   * @param questionRequestParams The request params
   * @returns {Promise<QuestionsResponse>}
   */
  async questionsByProductCode(code: string, questionRequestParams: QuestionRequestParams = {}) {
    if (!questionRequestParams.lang) {
      questionRequestParams.lang = await getLocaleAfterInit()
    }
    const apiUrl = getApiUrl(`/questions/${code}`)
    const url = addParamsToUrl(apiUrl, questionRequestParams)
    const response = await fetch(url)
    const result: QuestionsResponse = await response.json()
    return result
  },

  /**
   * Get insights
   * @param requestParams The request params
   * @returns {Promise<InsightsResponse>} The insights response, currently only
   * ingredients and nutrients insights are supported
   */
  async insights<T extends NutrientsInsight | IngredientsInsight>(
    requestParams: InsightsRequestParams = {}
  ) {
    const apiUrl = getApiUrl("/insights")
    const url = addParamsToUrl(apiUrl, requestParams)
    const response = await fetch(url)
    const result: InsightsResponse<T> = await response.json()
    return result
  },
}

export default robotoff
