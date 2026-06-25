import { describe, expect, it } from "vitest";
import { countryOptions, normalizeCountryName } from "../../src/domain/countries";

describe("country metadata", () => {
  it("includes Costa Rica", () => {
    expect(countryOptions.find((country) => country.name === "Costa Rica")).toEqual({
      code: "CR",
      name: "Costa Rica"
    });
  });

  it("excludes dependent territories", () => {
    expect(countryOptions.find((country) => country.name === "Guam")).toBeUndefined();
  });

  it("normalizes country names to canonical casing", () => {
    expect(normalizeCountryName("costa rica", "Spain")).toBe("Costa Rica");
  });

  it("keeps fallback values for unknown countries", () => {
    expect(normalizeCountryName("Atlantis", "Costa Rica")).toBe("Costa Rica");
  });
});
