import { addParamsToUrl } from "../utils"
import { getLocale } from "../localization"
import {
  QuestionRequestParams,
  QuestionsResponse,
  QuestionAnnotationAnswer,
} from "../types/robotoff"
import { robotoffApiUrl, robotoffDryRun } from "../signals/robotoff"

const getApiUrl = (path: string) => {
  return `${robotoffApiUrl.get()}}${path}`
}

const robotoff = {
  annotate(insightId: string, annotation: QuestionAnnotationAnswer) {
    const formBody = new URLSearchParams({
      insight_id: insightId,
      annotation: annotation,
    }).toString()
    const apiUrl = getApiUrl(`/insights/annotate`)
    if (robotoffDryRun.get()) {
      console.log(`Annotated ${apiUrl}`, formBody)
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
  },

  async questionsByProductCode(code: string, questionRequestParams: QuestionRequestParams = {}) {
    if (!questionRequestParams.lang) {
      questionRequestParams.lang = getLocale()
    }
    const apiUrl = getApiUrl(`/questions/${code}`)
    const url = addParamsToUrl(apiUrl, questionRequestParams)
    const response = await fetch(url)
    const result: QuestionsResponse = await response.json()
    return result
  },
}

export default robotoff
