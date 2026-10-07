import type { CropperImageBoundingBox } from "../types"
import type { RobotoffBoundingBox } from "../types/robotoff"
import type { NormalizedBoundingBox } from "../types/crops"

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

/**
 * Size of an image (or crop) once rotated by a multiple of 90°.
 * @param width - The width before rotation.
 * @param height - The height before rotation.
 * @param rotation - The rotation angle in degrees.
 * @returns The width and height after rotation.
 */
export const getRotatedSize = (
  width: number,
  height: number,
  rotation: number
): { width: number; height: number } => {
  const normalizedRotation = ((rotation % 360) + 360) % 360
  if (normalizedRotation === 90 || normalizedRotation === 270) {
    return { width: height, height: width }
  }
  return { width, height }
}

/**
 * Converts a bounding box in image pixels to a normalized one (values between 0 and 1).
 * Uses named keys to avoid any [y, x, y, x] vs [x, y, x, y] ordering confusion.
 * @param boundingBox - The bounding box in the cropperjs image format.
 * @returns The normalized bounding box.
 */
export const normalizeBoundingBox = (
  boundingBox: CropperImageBoundingBox,
  imageWidth: number,
  imageHeight: number
): NormalizedBoundingBox => {
  const { x, y, width, height } = boundingBox
  return {
    x_min: x / imageWidth,
    y_min: y / imageHeight,
    x_max: (x + width) / imageWidth,
    y_max: (y + height) / imageHeight,
  }
}

/**
 * Crops an image, then rotates the result.
 * @param image - The (loaded) source image.
 * @param boundingBox - The area to keep, in natural image pixels (unrotated frame).
 * @param rotation - The rotation angle in degrees (multiple of 90).
 * @param type - The output image type.
 * @param quality - The output image quality (between 0 and 1), for lossy types.
 * @returns The cropped image as a Blob.
 */
export const cropImageToBlob = (
  image: CanvasImageSource,
  boundingBox: CropperImageBoundingBox,
  rotation = 0,
  type = "image/webp",
  quality?: number
): Promise<Blob> => {
  const x = Math.round(boundingBox.x)
  const y = Math.round(boundingBox.y)
  const width = Math.round(boundingBox.width)
  const height = Math.round(boundingBox.height)
  if (width < 1 || height < 1) {
    // a selection smaller than 1 image pixel would give an empty canvas (toBlob returns null)
    return Promise.reject(new Error("Crop area is too small"))
  }
  const outputSize = getRotatedSize(width, height, rotation)

  const canvas = document.createElement("canvas")
  canvas.width = outputSize.width
  canvas.height = outputSize.height
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    return Promise.reject(new Error("Canvas 2D context not available"))
  }
  // rotate around the center of the output canvas, then draw the cropped area centered
  ctx.translate(outputSize.width / 2, outputSize.height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.drawImage(image, x, y, width, height, -width / 2, -height / 2, width, height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to export cropped image"))),
      type,
      quality
    )
  })
}
