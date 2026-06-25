export const maximumElevationMeters = 9000;
export const minimumElevationMeters = 0;

const elevationInputPattern = /^\d+(?:\.\d+)?$/;
const elevationMeasurementPattern = /^(\d+(?:\.\d+)?)m$/;

export function elevationInputValue(measurement: string): string {
  const meters = parseElevationMeasurement(measurement);

  return meters === null ? "" : formatElevationMeters(meters);
}

export function elevationMeasurementFromInput(input: string): null | string {
  const meters = parseElevationInput(input);

  return meters === null ? null : `${formatElevationMeters(meters)}m`;
}

export function normalizeElevationMeasurement(value: string, fallback: string): string {
  const normalized = elevationMeasurementFromInput(value.endsWith("m") ? elevationInputValue(value) : value);

  return normalized ?? fallback;
}

function parseElevationMeasurement(measurement: string): null | number {
  const match = elevationMeasurementPattern.exec(measurement);

  return match === null ? null : parseElevationInput(match[1] as string);
}

function parseElevationInput(input: string): null | number {
  if (elevationInputPattern.test(input.trim()) === false) {
    return null;
  }

  const meters = Number(input);

  return isElevationMetersInRange(meters) ? meters : null;
}

function isElevationMetersInRange(meters: number): boolean {
  return Number.isFinite(meters) && meters >= minimumElevationMeters && meters <= maximumElevationMeters;
}

function formatElevationMeters(meters: number): string {
  return String(meters);
}
