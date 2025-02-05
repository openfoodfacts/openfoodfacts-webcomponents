import Signal from "@lit-labs/signals"
import { PAGE_SIZE } from "../constants"
import robotoff from "../api/robotoff"

export const questionsPage = new Signal.State(0)
export const filters = new Signal.State({})
export const questions = new Signal.State([])

export const currentQuestionIndex = new Signal.State(0)

export const fetchQuestions = async () => {
  const { data } = await robotoff.questions(
    filters.value,
    PAGE_SIZE,
    questionsPage.value
  )
  questions.value = data.questions
  return { page: questionsPage.value, pages_size: PAGE_SIZE, ...data }
}
