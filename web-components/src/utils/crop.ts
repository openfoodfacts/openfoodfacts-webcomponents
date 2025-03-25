import { CropImageBoundingBox } from "../types"
import { CropBoundingBox } from "../types/robotoff"

export const robotoffBoundingBoxToCropImageBoundingBox = (
  boundingBox: CropBoundingBox
): CropImageBoundingBox => {
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

export const cropImageBoundingBoxToRobotoffBoundingBox = (
  boundingBox: CropImageBoundingBox
): CropBoundingBox => {
  const { x, y, width, height } = boundingBox
  const top = y
  const left = x
  const bottom = y + height
  const right = x + width
  return [top, left, bottom, right]
}
