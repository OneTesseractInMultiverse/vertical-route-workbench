import { generatedCountryOptions } from "../generated/countryData";

/** Country option shown in metadata dropdowns. */
export type CountryOption = {
  code: string;
  name: string;
};

/** Stable list of independent countries generated from `world-countries`. */
export const countryOptions: readonly CountryOption[] = generatedCountryOptions;

const countryNamesByFoldedName = new Map(countryOptions.map((country) => [foldCountryName(country.name), country.name]));

/** Returns the canonical country name for known input and the supplied fallback for unknown values. */
export function normalizeCountryName(value: string, fallback: string): string {
  return countryNamesByFoldedName.get(foldCountryName(value)) ?? fallback;
}

/** Folds country names for case-insensitive lookup while preserving the displayed canonical value. */
function foldCountryName(value: string): string {
  return value.trim().toLocaleLowerCase("en");
}
