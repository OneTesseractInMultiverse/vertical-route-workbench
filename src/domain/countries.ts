import { generatedCountryOptions } from "../generated/countryData";

export type CountryOption = {
  code: string;
  name: string;
};

export const countryOptions: readonly CountryOption[] = generatedCountryOptions;

const countryNamesByFoldedName = new Map(countryOptions.map((country) => [foldCountryName(country.name), country.name]));

export function normalizeCountryName(value: string, fallback: string): string {
  return countryNamesByFoldedName.get(foldCountryName(value)) ?? fallback;
}

function foldCountryName(value: string): string {
  return value.trim().toLocaleLowerCase("en");
}
