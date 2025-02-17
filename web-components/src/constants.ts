// src/config/env.ts
declare const __ENV__: {
  isDevelopment: boolean
  dryRun: boolean
}

export const ENV = __ENV__

export const DEFAULT_ROBOTOFF_API_URL = 
export const PAGE_SIZE = 25

export enum EventType {
  SUBMIT = "submit",
  QUESTION_STATE = "question-state",
}
