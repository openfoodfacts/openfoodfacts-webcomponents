import { ROBOTOFF_API_URL, IS_DEVELOPMENT_MODE } from "../constants"
import { addParamsToUrl, removeEmptyKeys } from "../utils"
import { getLocale } from "../localization"
import {
  QuestionRequestParams,
  QuestionsResponse,
  QuestionAnnotationAnswer,
} from "../types/robotoff"

const robotoff = {
  annotate(insightId: string, annotation: QuestionAnnotationAnswer) {
    const body = JSON.stringify({
      insight_id: insightId,
      annotation,
    })
    if (IS_DEVELOPMENT_MODE) {
      console.log(`Annotated, ${ROBOTOFF_API_URL}/insights/annotate`, body)
      return
    } else {
      return fetch(`${ROBOTOFF_API_URL}/insights/annotate`, {
        method: "POST",
        body,
        // Is is necessary to include credentials?
        // credentials: "include",
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
}

export default robotoff
