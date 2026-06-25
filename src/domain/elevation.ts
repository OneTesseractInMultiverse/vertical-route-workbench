/** Highest valid elevation accepted by route metadata inputs. */
export const maximumElevationMeters = 9000;

/** Lowest valid elevation accepted by route metadata inputs. */
export const minimumElevationMeters = 0;

const elevationInputPattern = /^\d+(?:\.\d+)?$/;
const elevationMeasurementPattern = /^(\d+(?:\.\d+)?)m$/;

/** Converts a stored VRL measurement such as `1300m` into the numeric field value shown in the UI. */
export function elevationInputValue(measurement: string): string {
  const meters = parseElevationMeasurement(measurement);

  return meters === null ? "" : formatElevationMeters(meters);
}

/** Converts user-entered elevation text into a normalized VRL measurement when it is inside the allowed range. */
export function elevationMeasurementFromInput(input: string): null | string {
  const meters = parseElevationInput(input);

  return meters === null ? null : `${formatElevationMeters(meters)}m`;
}

/** Normalizes UI or VRL elevation text while preserving the previous value for invalid input. */
export function normalizeElevationMeasurement(value: string, fallback: string): string {
  const normalized = elevationMeasurementFromInput(value.endsWith("m") ? elevationInputValue(value) : value);

  return normalized ?? fallback;
}

/** Parses a VRL measurement and rejects malformed or out-of-range values. */
function parseElevationMeasurement(measurement: string): null | number {
  const match = elevationMeasurementPattern.exec(measurement);

  return match === null ? null : parseElevationInput(match[1] as string);
}

/** Parses raw input text and applies the elevation range guard. */
function parseElevationInput(input: string): null | number {
  if (elevationInputPattern.test(input.trim()) === false) {
    return null;
  }

  const meters = Number(input);

  return isElevationMetersInRange(meters) ? meters : null;
}

/** Checks the numeric sea-level and maximum-elevation invariant. */
function isElevationMetersInRange(meters: number): boolean {
  return Number.isFinite(meters) && meters >= minimumElevationMeters && meters <= maximumElevationMeters;
}

/** Formats accepted numeric elevations without adding decimal padding. */
function formatElevationMeters(meters: number): string {
  return String(meters);
}
