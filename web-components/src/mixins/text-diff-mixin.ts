import { LitElement } from "lit"
import { diffWordsWithSpace, type Change } from "diff"
import { state } from "lit/decorators.js"
import type { IndexedChange } from "../types/ingredient-spellcheck"
import type { Constructor } from "."
/**
 * Interface for the TextCorrectorMixin.
 */
export interface TextDiffMixinInterface {
  diffResult: IndexedChange[]
  getResult(): string
  computeDiffResult(original: string, textToCompare: string): void
}

/**
 * Mixin that adds text diff functionality to a LitElement.
 */
export const TextDiffMixin = <T extends Constructor<LitElement>>(
  superClass: T
): Constructor<TextDiffMixinInterface> & T => {
  class TextCorrectorMixinClass extends superClass {
    /**
     * Gets the result of the diff.
     * @returns {string} The result of the diff.
     */
    getResult() {
      return this.diffResult.map((change) => change.value).join("")
    }

    /**
     * The result of the diff between the original and corrected text.
     * @type {IndexedChange[]}
     */
    @state()
    diffResult: IndexedChange[] = []

    computeDiffResult(value: string, textToCompare: string) {
      this.diffResult = diffWordsWithSpace(value, textToCompare).map(
        (part: Change, index: number) => {
          return {
            ...part,
            index,
          }
        }
      )
    }
  }

  return TextCorrectorMixinClass as Constructor<TextDiffMixinInterface> & T
}
