import { EventState } from "../constants"
import type { RobotoffConfigurationOptions } from "./robotoff"
import type { FolksonomyConfigurationOptions } from "./folksonomy"

export type OffWebcomponentConfigurationOptions = {
  robotoffConfiguration: RobotoffConfigurationOptions
  languageCode: string
  countryCode: string
  assetsImagesPath: string
  folksonomyConfiguration: FolksonomyConfigurationOptions
  openfoodfactsApiUrl: string
}

export type Product = {
  name: string
  price: number
  description: string
  imgUrl: string
}

export type BasicStateEventDetail = {
  state: EventState
}

export type QuestionStateEventDetail = {
  index?: number
  numberOfQuestions?: number
} & BasicStateEventDetail

export type QuestionStateEvent = CustomEvent<QuestionStateEventDetail>

export type AutocompleteInputChangeEventDetail = {
  value: string
  filteredSuggestions: AutocompleteSuggestion[]
  matching?: AutocompleteSuggestion
}

export type AutocompleteInputChangeEvent = CustomEvent<AutocompleteInputChangeEventDetail>

export type AutocompleteSuggestionSelectEvent = CustomEvent<AutocompleteSuggestion>

export type AutocompleteSuggestion = {
  label?: string
  value: string
  isNotFound?: boolean
}

export type CropperImageBoundingBox = {
  x: number
  y: number
  width: number
  height: number
}

export type CropResult = {
  newBoundingBox: CropperImageBoundingBox
  oldBoundingBox?: CropperImageBoundingBox
  rotation: number
}

export type TextCorrectorHighlightInput = {
  value: string
}
