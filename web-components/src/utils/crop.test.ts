import { describe, it, expect } from "vitest";
import { cropImageToBlob, getRotatedSize, normalizeBoundingBox } from "./crop";

describe("crop utils", () => {
  describe("getRotatedSize", () => {
    it("should keep the size for 0° and 180°", () => {
      expect(getRotatedSize(200, 100, 0)).toEqual({ width: 200, height: 100 });
      expect(getRotatedSize(200, 100, 180)).toEqual({
        width: 200,
        height: 100,
      });
      expect(getRotatedSize(200, 100, -180)).toEqual({
        width: 200,
        height: 100,
      });
    });

    it("should swap width and height for 90° and 270°", () => {
      expect(getRotatedSize(200, 100, 90)).toEqual({ width: 100, height: 200 });
      expect(getRotatedSize(200, 100, 270)).toEqual({
        width: 100,
        height: 200,
      });
      expect(getRotatedSize(200, 100, -90)).toEqual({
        width: 100,
        height: 200,
      });
    });
  });

  describe("normalizeBoundingBox", () => {
    it("should return values relative to the image size", () => {
      expect(
        normalizeBoundingBox(
          { x: 50, y: 25, width: 100, height: 50 },
          200,
          100,
        ),
      ).toEqual({
        x_min: 0.25,
        y_min: 0.25,
        x_max: 0.75,
        y_max: 0.75,
      });
    });

    it("should return the full image for a full selection", () => {
      expect(
        normalizeBoundingBox({ x: 0, y: 0, width: 640, height: 480 }, 640, 480),
      ).toEqual({
        x_min: 0,
        y_min: 0,
        x_max: 1,
        y_max: 1,
      });
    });
  });

  describe("cropImageToBlob", () => {
    it("should reject a crop area smaller than 1 image pixel", async () => {
      const image = document.createElement("img");
      await expect(
        cropImageToBlob(image, { x: 10, y: 10, width: 0.4, height: 50 }),
      ).rejects.toThrow("Crop area is too small");
      await expect(
        cropImageToBlob(image, { x: 10, y: 10, width: 50, height: 0.2 }),
      ).rejects.toThrow("Crop area is too small");
    });
  });
});
