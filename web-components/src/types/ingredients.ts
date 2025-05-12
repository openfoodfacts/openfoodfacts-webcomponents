import { Change } from "diff"
import { AnnotationAnswer } from "./robotoff"
import { EventState } from "../constants"

/**
 * Enum for the type of change in the text
 */
export enum ChangeType {
  ADDED = "added",
  REMOVED = "removed",
  CHANGED = "changed",
}

/**
 * Type for a change in the text with its index
 */
export type IndexedChange = Change & { index: number }

/**
 * Type for a grouped change in the text
 * It allow to groupe additions, removals in "changed" type
 * For example, if the text is "hello world" and the correction is "hello universe"
 * The grouped change will be of type "changed" with the value "world" and the new value "universe
 * instead of remove "world" and add "universe" separately
 */
export type IndexedGroupedChange = {
  type: ChangeType
  value?: string
  oldValue?: string
  newValue?: string
  indexes: number[]
  position: number
}

/**
 * Type for the event detail of the text corrector
 */
export type TextCorrectorEventDetail = {
  correction?: string
  annotation: AnnotationAnswer
}

/**
 * Type for the event of the text corrector
 *
 * It is a custom event with the detail of the text corrector
 */
export type TextCorrectorEvent = CustomEvent<TextCorrectorEventDetail>

/**
 * Type for the event detail of the robotoff ingredients state
 *  It is a custom event with the detail of the robotoff ingredients state
 */
export type RobotoffIngredientsStateEventDetail = {
  state: EventState
  insightId?: string
  productCode?: string
} & Partial<TextCorrectorEventDetail>
