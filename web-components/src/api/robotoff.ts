import { addParamsToUrl } from "../utils"
import {
  type QuestionRequestParams,
  type QuestionsResponse,
  AnnotationAnswer,
  type InsightsRequestParams,
  type InsightsResponse,
  type NutrientsInsight,
  type IngredientSpellcheckInsight,
  type NutrientsAnnotationData,
  type IngredientDetectionInsight,
  type IngredientDetectionAnnotationData,
  InsightType,
} from "../types/robotoff"
import { robotoffConfiguration } from "../signals/robotoff"
import { languageCode } from "../signals/app"

import { Robotoff } from "@openfoodfacts/openfoodfacts-nodejs"

function createRobotoff(fetch: typeof window.fetch) {
  // ensure that any user account credentials get used in Robotoff
  const fetchWithCredentials: typeof window.fetch = (url, options) => {
    return fetch(url, { ...options, credentials: "include" })
  }
  return new Robotoff(fetchWithCredentials, {
    baseUrl: robotoffConfiguration.getItem("apiUrl") as string,
  })
}

/**
 * Get the API URL for a given path with the current configuration
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
    const robotoff = createRobotoff(fetch)
    return robotoff.annotate({ insight_id: insightId, annotation: annotation })
  },
  annotateNutrients(
    insightId: string,
    annotation: AnnotationAnswer,
    data?: NutrientsAnnotationData
  ) {
    const newLocal = createRobotoff(fetch)
    return newLocal.annotate({ insight_id: insightId, annotation: annotation, data: data })
  },

  /**
   * Annotate an insight
   * @param insightId The insight id
   * @param annotation The annotation answer ${QuestionAnnotationAnswer}
   * @param correction The correction given by the user if the correction is different
   * from the one proposed by the insight or the original one
   */
  annotateIngredientSpellcheck(
    insightId: string,
    annotation: AnnotationAnswer,
    correction?: string
  ) {
    return createRobotoff(fetch).annotate({
      insight_id: insightId,
      annotation: annotation,
      data: { annotation: correction },
    })
  },

  /**
   * Annotate an insight
   * @param insightId The insight id
   * @param annotation The annotation answer ${QuestionAnnotationAnswer}
   * @param data The data to send to the API
   */
  annotateIngredientDetection(
    insightId: string,
    annotation: AnnotationAnswer,
    data?: IngredientDetectionAnnotationData
  ) {
    return createRobotoff(fetch).annotate({
      insight_id: insightId,
      annotation: annotation,
      data: data,
    })
  },

  /**
   * Get questions by product code
   * @param code The product code
   * @param questionRequestParams The request params
   * @returns {Promise<QuestionsResponse>}
   */
  async questionsByProductCode(
    code: string,
    questionRequestParams: QuestionRequestParams = {}
  ): Promise<QuestionsResponse> {
    if (!questionRequestParams.lang) {
      questionRequestParams.lang = languageCode.get()
    }
    const apiUrl = getApiUrl(`/questions/${code}`)
    const url = addParamsToUrl(apiUrl, questionRequestParams)
    // Note: we need credentials to be sure to have all questions
    const response = await fetch(url, { credentials: "include" })
    const result: QuestionsResponse = await response.json()
    return result
  },

  /**
   * Get insights
   * @param requestParams The request params
   * @returns The insights response. Currently only ingredients and
   * nutrients insights are supported
   */
  async insights<
    T extends NutrientsInsight | IngredientSpellcheckInsight | IngredientDetectionInsight,
  >(requestParams: InsightsRequestParams = {}): Promise<InsightsResponse<T>> {
    const apiUrl = getApiUrl("/insights")
    const url = addParamsToUrl(apiUrl, requestParams)
    // Note: we need credentials to be sure to have all insights
    const response = await fetch(url, { credentials: "include" })
    const result: InsightsResponse<T> = await response.json()
    return result
  },

  /**
   * Get insights for the robotoff contribution message
   * Reduces the number of calls to the API by fetching multiple insights at once
   * @param requestParams The request params
   * @returns {Promise<InsightsResponse>} The insights response, currently only
   * ingredients and nutrients insights are supported
   */
  async fetchRobotoffContributionMessageInsights(
    requestParams: InsightsRequestParams = {}
  ): Promise<Array<NutrientsInsight | IngredientSpellcheckInsight | IngredientDetectionInsight>> {
    const result = await this.insights<
      NutrientsInsight | IngredientSpellcheckInsight | IngredientDetectionInsight
    >({
      ...requestParams,
      annotated: false,
      insight_types: [
        InsightType.nutrient_extraction,
        InsightType.ingredient_spellcheck,
        InsightType.ingredient_detection,
      ],
    })
    return result.insights
  },
}

export default robotoff
