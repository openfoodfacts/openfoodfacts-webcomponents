import { EventState } from "../constants"
import { RobotoffConfigurationOptions } from "./robotoff"

export type OffWebcomponentConfigurationOptions = {
  robotoffConfiguration: RobotoffConfigurationOptions
  languageCode: string
  assetsImagesPath: string
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
