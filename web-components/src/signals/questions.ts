import { Computed } from "@lit-labs/signals"
import robotoff from "../api/robotoff"
import { type Question, AnnotationAnswer, type QuestionRequestParams } from "../types/robotoff"
import { SignalMap } from "../utils/signals"

// Store questions by id
export const questionsById = new SignalMap<Question>({})

// Store question ids by product code
export const questionIdsByProductCode = new SignalMap<string[]>({})

// Current question index by product code
export const currentQuestionIndexByProductCode = new SignalMap<number>({})

// Is questions finished by product code
export const isQuestionsFinishedByProductCode = new SignalMap<boolean>({})

// Get questions by product code
export const questions = (productCode: string) =>
  new Computed(() => {
    return questionIdsByProductCode.get()[productCode].map((id) => questionsById.getItem(id))
  })

// Get current question index by product code
export const currentQuestionIndex = (productCode: string) =>
  new Computed(() => {
    return currentQuestionIndexByProductCode.getItem(productCode) ?? 0
  })
/** Does the current product has questions */
export const hasQuestions = (productCode: string) =>
  new Computed(() => questionIdsByProductCode.getItem(productCode)?.length > 0)
/** Number of questions available */
export const numberOfQuestions = (productCode: string) =>
  new Computed(() => questionIdsByProductCode.getItem(productCode)?.length ?? 0)
/** Indicates if all questions have been answered */
export const isQuestionsFinished = (productCode: string) =>
  new Computed(() => isQuestionsFinishedByProductCode.getItem(productCode) ?? false)

/**
 * Fetches questions for a given product code.
 * @param code - The product code.
 * @param params - Additional parameters for the question request.
 */
export const fetchQuestionsByProductCode = async (
  code: string,
  params: QuestionRequestParams = {}
): Promise<Question[]> => {
  isQuestionsFinishedByProductCode.setItem(code, false)
  currentQuestionIndexByProductCode.setItem(code, 0)
  questionIdsByProductCode.setItem(code, [])
  const response = await robotoff.questionsByProductCode(code, params)

  questionIdsByProductCode.setItem(
    code,
    response.questions?.map((question) => question.insight_id) ?? []
  )

  response.questions?.forEach((question: Question) => {
    questionsById.setItem(question.insight_id, question)
  })

  return response.questions ?? []
}

/**
 * Checks if all questions have been answered.
 * @returns True if all questions have been answered, otherwise false.
 */
export const checkIfQuestionsFinishedByProductCode = (productCode: string) => {
  const current = currentQuestionIndex(productCode).get()
  const count = numberOfQuestions(productCode).get()

  if (current === count) {
    isQuestionsFinishedByProductCode.setItem(productCode, true)
    return true
  }
  return false
}

/**
 * Answers a question.
 * @param insightId - The ID of the insight.
 * @param value - The answer to the question.
 */
export const answerQuestion = async (insightId: string, value: AnnotationAnswer) => {
  await robotoff.annotateQuestion(insightId, value)
}

/**
 * Moves to the next question.
 * @returns False if all questions have been answered, otherwise true.
 */
export const nextQuestionByProductCode = (productCode: string) => {
  const current = currentQuestionIndex(productCode).get()
  currentQuestionIndexByProductCode.setItem(productCode, current + 1)
  if (checkIfQuestionsFinishedByProductCode(productCode)) {
    return false
  }
  return true
}
