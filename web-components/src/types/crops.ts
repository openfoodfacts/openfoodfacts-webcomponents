import type { CropperImageBoundingBox } from ".";

export type CropperActionEvent = CustomEvent<{ action: string; scale: number }>;

/**
 * Bounding box with values between 0 and 1, relative to the image size.
 */
export type NormalizedBoundingBox = {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
};

/**
 * Result of the image-crop component.
 */
export type ImageCropResult = {
  // the cropped (and rotated) image
  blob: Blob;
  // the crop area, in natural image pixels (unrotated frame)
  boundingBox: CropperImageBoundingBox;
  // the crop area, relative to the image size (unrotated frame)
  normalizedBoundingBox: NormalizedBoundingBox;
  // the rotation applied to the cropped image, in degrees
  rotation: number;
};
