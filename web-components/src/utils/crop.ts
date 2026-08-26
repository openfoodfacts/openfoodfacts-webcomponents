import type { CropperImageBoundingBox } from "../types"
import type { RobotoffBoundingBox } from "../types/robotoff"

/**
 * Converts a bounding box from the robotoff format to the crop image format.
 * @param boundingBox - The bounding box in the robotoff format.
 * @example [0, 0.407234539089848, 0.872586872586873, 0.998833138856476]
 * @returns The bounding box in the cropperjs image format.
 */
export const robotoffBoundingBoxToCropImageBoundingBox = (
  boundingBox: RobotoffBoundingBox,
  imageWidth: number,
  imageHeight: number
): CropperImageBoundingBox => {
  const [xMin, yMin, xMax, yMax] = boundingBox // values is a value between 0 and 1

  return {
    x: yMin * imageWidth,
    y: xMin * imageHeight,
    width: (yMax - yMin) * imageWidth,
    height: (xMax - xMin) * imageHeight,
  }
}

/**
 * Converts a bounding box from the crop image format to the robotoff format.
 * @param boundingBox - The bounding box in the cropperjs image format.
 * @returns The bounding box in the robotoff format.
 */
export const cropImageBoundingBoxToRobotoffBoundingBox = (
  boundingBox: CropperImageBoundingBox,
  imageWidth: number,
  imageHeight: number
): RobotoffBoundingBox => {
  const { x, y, width, height } = boundingBox
  const xMin = y / imageHeight
  const yMin = x / imageWidth
  const xMax = (y + height) / imageHeight
  const yMax = (x + width) / imageWidth
  return [xMin, yMin, xMax, yMax]
}
