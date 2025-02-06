import { Computed, State } from "@lit-labs/signals"
import robotoff from "../api/robotoff"

export const questions = new State<any[]>([])

export const currentQuestionIndex = new State(0)
export const numberOfQuestions = new Computed(() => questions.get().length)
export const finishQuestions = new State(false)

export const fetchQuestionsByProductCode = async (code: string) => {
  const response = await robotoff.questionsByProductCode(code)
  questions.set(response.questions)
}

export const nextQuestion = () => {
  const current = currentQuestionIndex.get()
  if (current === numberOfQuestions.get() - 1) {
    finishQuestions.set(true)
    return false
  }
  currentQuestionIndex.set(currentQuestionIndex.get() + 1)
  return true
}
