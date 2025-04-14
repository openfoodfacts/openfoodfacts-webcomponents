import { EventState } from "../constants"
import { QuestionAnnotationAnswer, RobotoffConfigurationOptions } from "./robotoff"

export type OffWebcomponentConfigurationOptions = {
  robotoffConfiguration: RobotoffConfigurationOptions
  languageCode: string
  assetsImagesPath: string
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

export type TextCorrectorEventDetail = {
  correction?: string
  annotation: QuestionAnnotationAnswer
}

export type TextCorrectorEvent = CustomEvent<TextCorrectorEventDetail>

export type RobotoffIngredientsStateEventDetail = {
  state: EventState
  insightId?: string
  productCode?: string
} & Partial<TextCorrectorEventDetail>
