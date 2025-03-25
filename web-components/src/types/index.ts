import { EventState } from "../constants"
import { RobotoffConfigurationOptions } from "./robotoff"
import { FolksonomyConfigurationOptions } from "./folksonomy"

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

export type CropImageBoundingBox = {
  x: number
  y: number
  width: number
  height: number
}

export type CropResult = {
  newBoundingBox: CropImageBoundingBox
  oldBoundingBox?: CropImageBoundingBox
}
