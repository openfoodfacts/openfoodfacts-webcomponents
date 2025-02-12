// src/config/env.ts
declare const __ENV__: {
  isDevelopment: boolean
}

export const ENV = __ENV__

export const ROBOTOFF_API_URL = "https://robotoff.openfoodfacts.org/api/v1"
export const IS_DEVELOPMENT_MODE = ENV.isDevelopment
export const PAGE_SIZE = 25

export enum EventType {
  SUBMIT = "submit",
  QUESTION_STATE = "question-state",
}
