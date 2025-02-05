import Signal from "@lit-labs/signals"
import { PAGE_SIZE } from "../constants"
import robotoff from "../api/robotoff"
import { QuestionFilter } from "../types"

export const questionsPage = new Signal.State<number>(0)
export const filters = new Signal.State<QuestionFilter>({
  //   valueTag: string
  //   countryFilter: string | null
  //   sortByPopularity: boolean
  //   campaign: string
  //   predictor: string
  insightType: "",
  brandFilter: "",
  valueTag: "",
  countryFilter: null,
  sortByPopularity: false,
  campaign: "",
  predictor: "",
})
export const questions = new Signal.State<any[]>([])

export const currentQuestionIndex = new Signal.State(0)

export const fetchQuestions = async () => {
  const { data } = await robotoff.questions(
    filters.get(),
    PAGE_SIZE,
    questionsPage.get()
  )
  questions.set(data.questions)
  return { page: questionsPage.get(), pages_size: PAGE_SIZE, ...data }
}
