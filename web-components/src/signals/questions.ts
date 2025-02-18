import { Computed, State } from "@lit-labs/signals"
import robotoff from "../api/robotoff"
import { Question, QuestionAnnotationAnswer, QuestionRequestParams } from "../types/robotoff"
import { setSignalObjectStateAttribute } from "../utils/signals"

// Store questions by id
export const questionsById = new State<Record<string, Question>>({})

// Store question ids by product code
export const questionIdsByProductCode = new State<Record<string, string[]>>({})

// Current question index by product code
export const currentQuestionIndexByProductCode = new State<Record<string, number>>({})

// Is questions finished by product code
export const isQuestionsFinishedByProductCode = new State<Record<string, boolean>>({})

// Get questions by product code
export const questions = (productCode: string) =>
  new Computed(() => {
    return questionIdsByProductCode.get()[productCode].map((id) => questionsById.get()[id])
  })

// Get current question index by product code
export const currentQuestionIndex = (productCode: string) =>
  new Computed(() => {
    return currentQuestionIndexByProductCode.get()[productCode] ?? 0
  })
/** Does the current product has questions */
export const hasQuestions = (productCode: string) =>
  new Computed(() => questionIdsByProductCode.get()[productCode]?.length > 0)
/** Number of questions available */
export const numberOfQuestions = (productCode: string) =>
  new Computed(() => questionIdsByProductCode.get()[productCode].length ?? 0)
/** Indicates if all questions have been answered */
export const isQuestionsFinished = (productCode: string) =>
  new Computed(() => isQuestionsFinishedByProductCode.get()[productCode] ?? false)

/**
 * Fetches questions for a given product code.
 * @param code - The product code.
 * @param params - Additional parameters for the question request.
 */
export const fetchQuestionsByProductCode = async (
  code: string,
  params: QuestionRequestParams = {}
) => {
  setSignalObjectStateAttribute(isQuestionsFinishedByProductCode, code, false)
  setSignalObjectStateAttribute(currentQuestionIndexByProductCode, code, 0)
  const response = await robotoff.questionsByProductCode(code, params)
  setSignalObjectStateAttribute(
    questionIdsByProductCode,
    code,
    response.questions.map((question) => question.insight_id)
  )

  // Update the questionsById signal
  const newQuestionsById = {
    ...questionsById.get(),
  }
  response.questions.forEach((question: Question) => {
    newQuestionsById[question.insight_id] = question
  })
  questionsById.set(newQuestionsById)
}

/**
 * Checks if all questions have been answered.
 * @returns True if all questions have been answered, otherwise false.
 */
export const checkIfQuestionsFinishedByProductCode = (productCode: string) => {
  const current = currentQuestionIndex(productCode).get()
  const count = numberOfQuestions(productCode).get()

  if (current === count) {
    setSignalObjectStateAttribute(isQuestionsFinishedByProductCode, productCode, true)
    return true
  }
  return false
}

/**
 * Answers a question.
 * @param insightId - The ID of the insight.
 * @param value - The answer to the question.
 */
export const answerQuestion = (insightId: string, value: QuestionAnnotationAnswer) => {
  robotoff.annotate(insightId, value)
}

/**
 * Moves to the next question.
 * @returns False if all questions have been answered, otherwise true.
 */
export const nextQuestionByProductCode = (productCode: string) => {
  const current = currentQuestionIndex(productCode).get()
  setSignalObjectStateAttribute(currentQuestionIndexByProductCode, productCode, current + 1)
  if (checkIfQuestionsFinishedByProductCode(productCode)) {
    return false
  }
  return true
}
