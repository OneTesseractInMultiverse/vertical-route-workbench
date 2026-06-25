import { compileRoute, type VrlCompileResult } from "@subvertic/vrl-core";
import { normalizeCountryName } from "../domain/countries";
import { normalizeElevationMeasurement } from "../domain/elevation";
import { createRouteElement, defaultRouteMetadata } from "../domain/routeDocument";
import type { ElementType, RouteDocument, RouteElement, RouteMetadata } from "../domain/routeTypes";
import type { RouteLoadResult, RouteLoader } from "../ports/routeLoader";
import { toPreviewDiagnostic } from "./vrlDiagnosticAdapter";

const supportedElementTypes = new Set<ElementType>([
  "start",
  "walk",
  "rappel",
  "downclimb",
  "climb",
  "pool",
  "hazard",
  "note",
  "exit"
]);

const defaultDependencies: VrlRouteLoaderDependencies = {
  compile: compileRoute
};

export function createVrlRouteLoader(dependencies: VrlRouteLoaderDependencies = defaultDependencies): RouteLoader {
  return {
    load: (source) => loadRouteSource(source, dependencies)
  };
}

export function loadRouteSource(
  source: string,
  dependencies: VrlRouteLoaderDependencies = defaultDependencies
): RouteLoadResult {
  const compiled = dependencies.compile(source);
  const diagnostics = compiled.diagnostics.map(toPreviewDiagnostic);

  if (compiled.ok === false || isCompiledRouteModel(compiled.model) === false) {
    return {
      diagnostics,
      ok: false
    };
  }

  return {
    diagnostics,
    document: toRouteDocument(compiled.model),
    ok: true
  };
}

function toRouteDocument(model: CompiledRouteModel): RouteDocument {
  return {
    elements: model.elements.map(toRouteElement),
    metadata: toRouteMetadata(model.metadata),
    routeName: model.name ?? "Untitled Route"
  };
}

function toRouteMetadata(metadata: Record<string, unknown>): RouteMetadata {
  return {
    ...defaultRouteMetadata,
    country: normalizeCountryName(stringValue(metadata.country, defaultRouteMetadata.country), defaultRouteMetadata.country),
    difficulty: stringValue(metadata.difficulty, defaultRouteMetadata.difficulty),
    entrance_elevation: normalizeElevationMeasurement(attributeValue(metadata.entrance_elevation), defaultRouteMetadata.entrance_elevation),
    exit_elevation: normalizeElevationMeasurement(attributeValue(metadata.exit_elevation), defaultRouteMetadata.exit_elevation),
    region: stringValue(metadata.region, defaultRouteMetadata.region)
  };
}

function toRouteElement(element: CompiledRouteElement): RouteElement {
  const routeElement = createRouteElement(element.type, () => element.id);

  return {
    ...routeElement,
    attributes: toAttributeRecord(element.attributes),
    label: element.label ?? routeElement.label,
    vrlId: element.type === "start" || element.type === "exit" ? "" : element.id
  };
}

function toAttributeRecord(attributes: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(Object.entries(attributes).map(([fieldName, value]) => [fieldName, attributeValue(value)]));
}

function attributeValue(value: unknown): string {
  if (isMeasurement(value)) {
    return `${value.meters}m`;
  }

  if (isInclination(value)) {
    return `${value.percent}%`;
  }

  if (isRappelStageList(value)) {
    return value.map(attributeValue).join("+");
  }

  if (isRedirectionList(value)) {
    return value.map((redirection) => `${attributeValue(redirection.distance)}:${redirection.side}`).join(",");
  }

  return String(value ?? "");
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value !== "" ? value : fallback;
}

function isCompiledRouteModel(value: unknown): value is CompiledRouteModel {
  return isRecord(value) && Array.isArray(value.elements) && value.elements.every(isCompiledRouteElement);
}

function isCompiledRouteElement(value: unknown): value is CompiledRouteElement {
  return isRecord(value) && isElementType(value.type) && typeof value.id === "string" && isRecord(value.attributes);
}

function isElementType(value: unknown): value is ElementType {
  return typeof value === "string" && supportedElementTypes.has(value as ElementType);
}

function isInclination(value: unknown): value is { percent: number } {
  return isRecord(value) && typeof value.percent === "number";
}

function isMeasurement(value: unknown): value is { meters: number } {
  return isRecord(value) && typeof value.meters === "number";
}

function isRappelStageList(value: unknown): value is { meters: number }[] {
  return Array.isArray(value) && value.every(isMeasurement);
}

function isRedirectionList(value: unknown): value is { distance: { meters: number }; side: string }[] {
  return Array.isArray(value) && value.every(isRedirection);
}

function isRedirection(value: unknown): value is { distance: { meters: number }; side: string } {
  return isRecord(value) && isMeasurement(value.distance) && typeof value.side === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

type CompiledRouteElement = {
  attributes: Record<string, unknown>;
  id: string;
  label: null | string;
  type: ElementType;
};

type CompiledRouteModel = {
  elements: CompiledRouteElement[];
  metadata: Record<string, unknown>;
  name: null | string;
};

export type VrlRouteLoaderDependencies = {
  compile: (source: string, options?: unknown) => VrlCompileResult;
};
