import { addParamsToUrl } from "../utils"
import { getLocaleAfterInit } from "../localization"
import {
  QuestionRequestParams,
  QuestionsResponse,
  QuestionAnnotationAnswer,
  InsightsRequestParams,
  InsightsResponse,
  InsightAnnotationAnswer,
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
  annotateQuestion(insightId: string, annotation: QuestionAnnotationAnswer) {
    const formBody = new URLSearchParams({
      insight_id: insightId,
      annotation: annotation,
    }).toString()
    return annotate(formBody)
  },
  annotateNutrients(annotation: InsightAnnotationAnswer) {
    const formBody = new URLSearchParams({
      annotation: "2",
      insight_id: annotation.insightId,
      data: JSON.stringify({
        nutrients: annotation.data,
      }),
      type: annotation.type,
    }).toString()
    return annotate(formBody)
  },

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

  async insights(requestParams: InsightsRequestParams = {}) {
    const apiUrl = getApiUrl("/insights")
    const url = addParamsToUrl(apiUrl, requestParams)
    const response = await fetch(url)
    const result: InsightsResponse = await response.json()
    return result
  },
}

export default robotoff
