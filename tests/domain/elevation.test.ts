import { describe, expect, it } from "vitest";
import {
  elevationInputValue,
  elevationMeasurementFromInput,
  maximumElevationMeters,
  minimumElevationMeters,
  normalizeElevationMeasurement
} from "../../src/domain/elevation";

describe("elevation metadata", () => {
  it("uses sea level as the minimum elevation", () => {
    expect(minimumElevationMeters).toBe(0);
  });

  it("caps elevation at nine thousand meters", () => {
    expect(maximumElevationMeters).toBe(9000);
  });

  it("converts metric elevation to input values", () => {
    expect(elevationInputValue("1300m")).toBe("1300");
  });

  it("returns empty input values for invalid measurements", () => {
    expect(elevationInputValue("above")).toBe("");
  });

  it("converts valid input to metric elevation", () => {
    expect(elevationMeasurementFromInput("9000")).toBe("9000m");
  });

  it("rejects elevation above the maximum", () => {
    expect(elevationMeasurementFromInput("9001")).toBeNull();
  });

  it("rejects elevation below sea level", () => {
    expect(elevationMeasurementFromInput("-1")).toBeNull();
  });

  it("rejects non-numeric elevation input", () => {
    expect(elevationMeasurementFromInput("high")).toBeNull();
  });

  it("normalizes metric elevation values", () => {
    expect(normalizeElevationMeasurement("1200m", "0m")).toBe("1200m");
  });

  it("keeps the fallback when elevation values are invalid", () => {
    expect(normalizeElevationMeasurement("9100m", "1300m")).toBe("1300m");
  });
});
