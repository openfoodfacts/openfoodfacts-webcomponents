import { Computed, State } from "@lit-labs/signals"
import robotoff from "../api/robotoff"

export const questions = new State<any[]>([])

export const currentQuestionIndex = new State(0)
export const numberOfQuestions = new Computed(() => questions.get().length)
export const isQuestionsFinished = new State(false)

export const fetchQuestionsByProductCode = async (code: string) => {
  const response = await robotoff.questionsByProductCode(code)
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
