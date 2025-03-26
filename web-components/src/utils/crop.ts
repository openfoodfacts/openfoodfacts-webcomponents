import { CropperImageBoundingBox } from "../types"
import { CropBoundingBox } from "../types/robotoff"

/**
 * Converts a bounding box from the robotoff format to the crop image format.
 * @param boundingBox - The bounding box in the robotoff format.
 * @returns The bounding box in the cropperjs image format.
 */
export const robotoffBoundingBoxToCropImageBoundingBox = (
  boundingBox: CropBoundingBox
): CropperImageBoundingBox => {
  const [top, left, bottom, right] = boundingBox
  const x = left
  const y = top
  // TODO: verify that the bounding box is valid
  const width = right - left
  const height = bottom - top
  return {
    x,
    y,
    width,
    height,
  }
}

/**
 * Converts a bounding box from the crop image format to the robotoff format.
 * @param boundingBox - The bounding box in the cropperjs image format.
 * @returns The bounding box in the robotoff format.
 */
export const cropImageBoundingBoxToRobotoffBoundingBox = (
  boundingBox: CropperImageBoundingBox
): CropBoundingBox => {
  const { x, y, width, height } = boundingBox
  const top = y
  const left = x
  const bottom = y + height
  const right = x + width
  return [top, left, bottom, right]
}
