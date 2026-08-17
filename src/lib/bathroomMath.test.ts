import { describe, expect, it } from "vitest";
import { canonicalById } from "../data/canonicalScale";
import {
  calculateNetBathroom,
  compareScaleValues,
  getIntervalRatioLog10,
  getLog10Magnitude,
  interpolateScalePosition,
  LOG10_3,
} from "./bathroomMath";

describe("Bathroom Number Scale mathematics", () => {
  it("gives a shower 81 handwashes of magnitude", () => {
    expect(getLog10Magnitude(-3) - getLog10Magnitude(-1)).toBeCloseTo(Math.log10(81), 12);
  });

  it("uses geometric interpolation for half steps", () => {
    expect(getLog10Magnitude(1.5) - getLog10Magnitude(1)).toBeCloseTo(LOG10_3 / 2, 12);
    expect(getLog10Magnitude(2) - getLog10Magnitude(1.5)).toBeCloseTo(LOG10_3 / 2, 12);
  });

  it("places losing a tooth at the specified logarithmic position", () => {
    expect(interpolateScalePosition(2, 3, 15)).toBeCloseTo(2.8216578402, 9);
  });

  it("places mouthwash between handwashing and brushing", () => {
    expect(interpolateScalePosition(-1, -2, 2)).toBeCloseTo(-1.6309297536, 9);
  });

  it("makes murder the geometric midpoint of the 3 to 4 interval", () => {
    expect(getIntervalRatioLog10(3, 3.5)).toBeCloseTo(13.5 * LOG10_3, 9);
  });

  it("compares showering and handwashing correctly", () => {
    const result = compareScaleValues(canonicalById.get("negative-3")!, canonicalById.get("negative-1")!);
    expect(result.headline).toContain("81 times better");
  });

  it("recognizes equal magnitudes on opposite sides", () => {
    const result = compareScaleValues(canonicalById.get("negative-2")!, canonicalById.get("positive-2")!);
    expect(result.detail).toContain("exactly equal");
    expect(result.log10Ratio).toBe(0);
  });

  it("lets terminal states dominate all finite events", () => {
    const result = calculateNetBathroom([
      { action: canonicalById.get("positive-6")!, count: 1 },
      { action: canonicalById.get("negative-3")!, count: 9999 },
    ]);
    expect(result.value).toBe(6);
  });

  it("cancels equal opposite terminal states", () => {
    const result = calculateNetBathroom([
      { action: canonicalById.get("positive-6")!, count: 1 },
      { action: canonicalById.get("negative-6")!, count: 1 },
    ]);
    expect(result.value).toBe(0);
  });
});
