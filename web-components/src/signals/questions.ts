import { Computed, State } from "@lit-labs/signals"
import robotoff from "../api/robotoff"
import {
  QuestionAnnotationAnswer,
  QuestionRequestParams,
} from "../types/robotoff"

export const questions = new State<any[]>([])

/** Current question index */
export const currentQuestionIndex = new State(0)
/** Has the user answered to one question */
export const hasAnswered = new State(false)
/** Does the current product has questions */
export const hasQuestions = new Computed(() => questions.get().length > 0)
/** Number of questions available */
export const numberOfQuestions = new Computed(() => questions.get().length ?? 0)
/** Indicates if all questions have been answered */
export const isQuestionsFinished = new State(false)

/**
 * Fetches questions for a given product code.
 * @param code - The product code.
 * @param params - Additional parameters for the question request.
 */
export const fetchQuestionsByProductCode = async (
  code: string,
  params: QuestionRequestParams = {}
) => {
  hasAnswered.set(false)
  isQuestionsFinished.set(false)
  currentQuestionIndex.set(0)
  const response = await robotoff.questionsByProductCode(code, params)
  questions.set(response.questions)
}

/**
 * Checks if all questions have been answered.
 * @returns True if all questions have been answered, otherwise false.
 */
export const checkIfQuestionsFinished = () => {
  const current = currentQuestionIndex.get()

  if (current === numberOfQuestions.get()) {
    isQuestionsFinished.set(true)
    return true
  }
  return false
}

/**
 * Answers a question.
 * @param insightId - The ID of the insight.
 * @param value - The answer to the question.
 */
export const answerQuestion = (
  insightId: string,
  value: QuestionAnnotationAnswer
) => {
  hasAnswered.set(true)
  robotoff.annotate(insightId, value)
}

/**
 * Moves to the next question.
 * @returns False if all questions have been answered, otherwise true.
 */
export const nextQuestion = () => {
  currentQuestionIndex.set(currentQuestionIndex.get() + 1)
  if (checkIfQuestionsFinished()) {
    return false
  }
  return true
}
