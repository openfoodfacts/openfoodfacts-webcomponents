import { Computed, State } from "@lit-labs/signals"
import robotoff from "../api/robotoff"
import { QuestionRequestParams } from "../types/robotoff"

export const questions = new State<any[]>([])

export const currentQuestionIndex = new State(0)
export const hasQuestions = new Computed(() => questions.get().length > 0)
export const numberOfQuestions = new Computed(() => questions.get().length ?? 0)
export const isQuestionsFinished = new State(false)

export const fetchQuestionsByProductCode = async (
  code: string,
  params: QuestionRequestParams = {}
) => {
  isQuestionsFinished.set(false)
  currentQuestionIndex.set(0)
  const response = await robotoff.questionsByProductCode(code, params)
  questions.set(response.questions)
}

export const checkIfQuestionsFinished = () => {
  const current = currentQuestionIndex.get()

  if (current === numberOfQuestions.get()) {
    isQuestionsFinished.set(true)
    return true
  }
  return false
}

export const nextQuestion = () => {
  currentQuestionIndex.set(currentQuestionIndex.get() + 1)
  if (checkIfQuestionsFinished()) {
    return false
  }
  return true
}
