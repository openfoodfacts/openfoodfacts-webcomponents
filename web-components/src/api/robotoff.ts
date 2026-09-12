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

import {
  Robotoff,
  type RobotoffAnnotateBody,
  type RobotoffInsightQuery as SDKRobotoffInsightQuery,
} from "@openfoodfacts/openfoodfacts-nodejs"

const ROBOTOFF_API_PATH = "/api/v1"

function createRobotoff(fetch: typeof window.fetch) {
  const configuredBaseUrl = new URL(
    robotoffConfiguration.getItem("apiUrl") as string,
    window.location.href
  )
  const configuredBasePath = configuredBaseUrl.pathname.replace(/\/+$/, "")

  // ensure that any user account credentials get used in Robotoff
  const fetchWithCredentials: typeof window.fetch = (url, options) => {
    const requestUrl = new URL(url instanceof Request ? url.url : url.toString())
    const requestPath = requestUrl.pathname
    if (
      requestUrl.origin === configuredBaseUrl.origin &&
      (requestPath === ROBOTOFF_API_PATH || requestPath.startsWith(`${ROBOTOFF_API_PATH}/`))
    ) {
      requestUrl.pathname = configuredBasePath + requestPath.slice(ROBOTOFF_API_PATH.length)
    }
    const request =
      url instanceof Request
        ? new Request(requestUrl, {
            method: url.method,
            headers: url.headers,
            ...(url.method === "GET" || url.method === "HEAD"
              ? {}
              : { body: url.body, duplex: "half" as const }),
          })
        : requestUrl
    return fetch(request, { ...options, credentials: "include" })
  }
  return new Robotoff(fetchWithCredentials, {
    // The SDK always normalizes its base URL to /api/v1. The fetch adapter above
    // restores the configured path prefix after that normalization.
    baseUrl: new URL(ROBOTOFF_API_PATH, configuredBaseUrl.origin).toString(),
  })
}

const toRobotoffInsightQuery = (
  requestParams: InsightsRequestParams
): NonNullable<SDKRobotoffInsightQuery> => {
  const { barcode, ...query } = requestParams
  return {
    ...query,
    ...(barcode === undefined ? {} : { barcode: Number(barcode) }),
  }
}

/**
 * Annotate an insight
 * @param body
 */
const annotate = async (body: RobotoffAnnotateBody): Promise<unknown> => {
  if (robotoffConfiguration.getItem("dryRun")) {
    console.log("Annotated :", body)
    return undefined
  }

  const result = (await createRobotoff(fetch).annotate(body)) as unknown as {
    data?: unknown
    error?: unknown
  }
  if (result.error) {
    throw result.error
  }
  return result.data
}

/**
 * Robotoff API
 */
const robotoff = {
  annotateQuestion(insightId: string, annotation: AnnotationAnswer): Promise<unknown> {
    return annotate({ insight_id: insightId, annotation: annotation })
  },
  annotateNutrients(
    insightId: string,
    annotation: AnnotationAnswer,
    data?: NutrientsAnnotationData
  ): Promise<unknown> {
    return annotate({ insight_id: insightId, annotation: annotation, data: data })
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
  ): Promise<unknown> {
    return annotate({
      insight_id: insightId,
      annotation: annotation,
      ...(correction ? { data: { annotation: correction } } : {}),
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
  ): Promise<unknown> {
    return annotate({
      insight_id: insightId,
      annotation: annotation,
      ...(data ? { data: data } : {}),
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
    const result = (await createRobotoff(fetch).questionsByProductCode(code as unknown as number, {
      ...questionRequestParams,
      lang: questionRequestParams.lang ?? languageCode.get(),
    })) as unknown as { data?: QuestionsResponse; error?: unknown }
    if (result.error) {
      throw result.error
    }
    return result.data as QuestionsResponse
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
    const result = (await createRobotoff(fetch).insights(
      toRobotoffInsightQuery(requestParams)
    )) as unknown as {
      data?: InsightsResponse<T>
      error?: unknown
    }
    if (result.error) {
      throw result.error
    }
    return result.data as InsightsResponse<T>
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
      ].join(","),
    })
    return result.insights
  },
}

export default robotoff
