import { RobotoffConfigurationOptions } from "./robotoff"

export type OffWebcomponentConfigurationOptions = {
  robotoffConfiguration: RobotoffConfigurationOptions
  languageCode: string
}

export type Product = {
  name: string
  price: number
  description: string
  imgUrl: string
}

export type QuestionStateEventDetail = {
  index: number
  numberOfQuestions: number
}

export type QuestionStateEvent = CustomEvent<QuestionStateEventDetail>
