import { addParamsToUrl } from "../utils"
import {
  QuestionRequestParams,
  QuestionsResponse,
  AnnotationAnswer,
  InsightsRequestParams,
  InsightsResponse,
  NutrientsInsight,
  IngredientSpellcheckInsight,
  NutrientsAnnotationData,
  AnnotationFormData,
  IngredientDetectionInsight,
  IngredientDetectionAnnotationData,
  InsightType,
} from "../types/robotoff"
import { robotoffConfiguration } from "../signals/robotoff"
import { languageCode } from "../signals/app"

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
    const formData: AnnotationFormData = {
      insight_id: insightId,
      annotation,
    }
    const formBody = new URLSearchParams(formData).toString()
    return annotate(formBody)
  },
  annotateNutrients(
    insightId: string,
    annotation: AnnotationAnswer,
    data?: NutrientsAnnotationData
  ) {
    const formData: AnnotationFormData = {
      annotation,
      insight_id: insightId,
    }
    // Add data only if it is defined
    if (data) {
      formData.data = JSON.stringify(data)
    }

    const formBody = new URLSearchParams(formData).toString()
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
  annotateIngredientSpellcheck(
    insightId: string,
    annotation: AnnotationAnswer,
    correction?: string
  ) {
    const data: Record<string, string> = {
      insight_id: insightId,
      annotation,
    }
    if (correction) {
      data.data = JSON.stringify({ annotation: correction })
    }
    const formBody = new URLSearchParams(data).toString()
    return annotate(formBody)
  },

  /**
   * Annotate an insight
   * @param insightId The insight id
   * @param annotation The annotation answer ${QuestionAnnotationAnswer}
   * @param data The data to send to the API
   * @returns {Promise<Response>}
   */
  annotateIngredientDetection(
    insightId: string,
    annotation: AnnotationAnswer,
    data?: IngredientDetectionAnnotationData
  ) {
    const formData: AnnotationFormData = {
      annotation,
      insight_id: insightId,
    }
    // Add data only if it is defined
    if (data) {
      formData.data = JSON.stringify(data)
    }
    const formBody = new URLSearchParams(formData).toString()
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
   * @returns {Promise<InsightsResponse>} The insights response, currently only
   * ingredients and nutrients insights are supported
   */
  async insights<
    T extends NutrientsInsight | IngredientSpellcheckInsight | IngredientDetectionInsight,
  >(requestParams: InsightsRequestParams = {}) {
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
  async fetchRobotoffContributionMessageInsights(requestParams: InsightsRequestParams = {}) {
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
