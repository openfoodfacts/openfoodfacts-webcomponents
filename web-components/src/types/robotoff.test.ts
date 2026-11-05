import { describe, expect, it } from "vitest"
import { AnnotationAnswer, isAnnotationLoading } from "./robotoff"

describe("isAnnotationLoading", () => {
  it("treats every annotation answer, including refusal, as an active request", () => {
    expect(isAnnotationLoading(AnnotationAnswer.ACCEPT_AND_ADD_DATA)).toBe(true)
    expect(isAnnotationLoading(AnnotationAnswer.ACCEPT)).toBe(true)
    expect(isAnnotationLoading(AnnotationAnswer.REFUSE)).toBe(true)
    expect(isAnnotationLoading(AnnotationAnswer.SKIP)).toBe(true)
    expect(isAnnotationLoading()).toBe(false)
  })
})
