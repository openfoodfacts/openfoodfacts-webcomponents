export const DEFAULT_ROBOTOFF_CONFIGURATION = {
  apiUrl: "https://robotoff.openfoodfacts.org/api/v1",
  dryRun: false,
  imgUrl: "https://images.openfoodfacts.org/images/products",
}

export const DEFAULT_FOLKSONOMY_CONFIGURATION = {
  apiUrl: "https://api.folksonomy.openfoodfacts.org",
}

export const PAGE_SIZE = 25

export enum EventType {
  CLOSE = "close",
  SUCCESS = "success",
  SAVE = "save",
  SUBMIT = "submit",
  SKIP = "skip",
  QUESTION_STATE = "question-state",
  NUTRIENT_STATE = "nutrient-state",
  BARCODE_SCANNER_STATE = "barcode-scanner-state",
  INGREDIENTS_STATE = "ingredients-state",
}

export enum LoadingState {
  NOT_LOADED = "not-loaded",
  LOADING = "loading",
  LOADED = "loaded",
}

export const DEFAULT_LANGUAGE_CODE = "en"
export const DEFAULT_COUNTRY_CODE = "fr"

export enum EventState {
  LOADING = "loading", // loading data
  NO_DATA = "no-data", // no data to display
  HAS_DATA = "has-data", // data to display
  ANNOTATED = "annotated", // user do one annotation
  FINISHED = "FINISHED", // user do all annotations
}

export const DEFAULT_ASSETS_IMAGES_PATH = "/assets/images"

export const SELECT_ICON_FILE_NAME = "carret-bottom.svg"
export const WHITE_SELECT_ICON_FILE_NAME = "white-carret-bottom.svg"

export enum RobotoffContributionType {
  INGREDIENTS = "ingredients",
  NUTRIENTS = "nutrients",
  QUESTIONS = "questions",
}
