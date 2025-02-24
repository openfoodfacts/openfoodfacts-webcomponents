import { addParamsToUrl } from "../utils"
import { getLocaleAfterInit } from "../localization"
import {
  QuestionRequestParams,
  QuestionsResponse,
  QuestionAnnotationAnswer,
  InsightsRequestParams,
  InsightsResponse,
  NutrientAnotationForm,
} from "../types/robotoff"
import { robotoffApiUrl, robotoffDryRun } from "../signals/robotoff"

const getApiUrl = (path: string) => {
  return `${robotoffApiUrl.get()}${path}`
}

const annotate = (formBody: string) => {
  const apiUrl = getApiUrl(`/insights/annotate`)
  if (robotoffDryRun.get()) {
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

const robotoff = {
  annotate,
  annotateQuestion(insightId: string, annotation: QuestionAnnotationAnswer) {
    const formBody = new URLSearchParams({
      insight_id: insightId,
      annotation: annotation,
    }).toString()
    return annotate(formBody)
  },
  annotateNutrients(insightId: string, data: NutrientAnotationForm, type: "100g" | "serving") {
    const formBody = new URLSearchParams({
      insight_id: insightId,
      data: JSON.stringify(data),
      type,
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

  // async postRobotoff(config: PostRobotoffParams) {
  //   const { insightId, data, type } = config

  //   const filteredValues = {}

  //   Object.keys(data).forEach((key) => {
  //     if (key.includes(type) && data[key].value) {
  //       const nutriId = type.replace(`_${type}`, "") // remove the _100g _serving suffix
  //       const forcedUnit = FORCED_UNITS[nutriId]
  //       filteredValues[key] = {
  //         value: data[key].value,
  //         unit: forcedUnit ?? data[key].unit,
  //       }
  //     }
  //   })

  //   axios.post(
  //     `${ROBOTOFF_API_URL}/insights/annotate`,
  //     new URLSearchParams(
  //       `insight_id=${insightId}&annotation=2&data=${JSON.stringify({
  //         nutrients: filteredValues,
  //       })}`
  //     ),
  //     {
  //       withCredentials: true,

  //       headers: { "content-type": "application/x-www-form-urlencoded" },
  //     }
  //   )
  // },
}

export default robotoff
