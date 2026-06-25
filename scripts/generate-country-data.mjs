import { writeFile } from "node:fs/promises";
import { URL } from "node:url";
import countries from "world-countries";

const countryOptions = countries
  .filter((country) => country.independent !== false)
  .map((country) => ({
    code: country.cca2,
    name: country.name.common
  }))
  .sort((left, right) => left.name.localeCompare(right.name, "en", { sensitivity: "base" }));

const source = `export type GeneratedCountryOption = {
  code: string;
  name: string;
};

export const generatedCountryOptions: readonly GeneratedCountryOption[] = ${JSON.stringify(countryOptions, null, 2)} as const;
`;

await writeFile(new URL("../src/generated/countryData.ts", import.meta.url), source, "utf8");
