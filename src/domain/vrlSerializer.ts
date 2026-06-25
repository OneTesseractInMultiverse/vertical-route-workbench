import { generatedVrlId } from "./routeDocument";
import type { ElementType, RouteDocument, RouteElement, RouteMetadata } from "./routeTypes";

const metadataFields = [
  "difficulty",
  "region",
  "country",
  "entrance_elevation",
  "exit_elevation"
] satisfies readonly (keyof RouteMetadata)[];

export function serializeRouteDocument(document: RouteDocument): string {
  return [
    `route ${quoteValue(document.routeName)} {`,
    serializeMetadata(document.metadata),
    ...serializeElements(document.elements),
    "}"
  ].filter(Boolean).join("\n").concat("\n");
}

export function serializeMetadata(metadata: RouteMetadata): string {
  const attributes = metadataFields
    .map((fieldName) => serializeAttribute(fieldName, metadata[fieldName]))
    .filter((attribute) => attribute !== "");

  return attributes.length === 0 ? "" : `  metadata ${attributes.join(" ")}`;
}

export function serializeElements(elements: RouteElement[]): string[] {
  const counters = createElementCounters();

  return elements.map((element) => {
    counters[element.type] += 1;
    return `  ${serializeElement(element, generatedElementId(element, counters[element.type]))}`;
  });
}

export function serializeElement(element: RouteElement, vrlId: string): string {
  if (element.type === "note") {
    return `note ${quoteValue(element.attributes.text ?? "")}`;
  }

  const label = element.type === "start" || element.type === "exit" ? quoteValue(element.label) : vrlId;
  const attributes = serializeAttributeRecord(element.attributes);
  const parts = [element.type, label, attributes].filter((part) => part !== "");

  return parts.join(" ");
}

export function serializeAttributeRecord(attributes: Record<string, string>): string {
  return Object.entries(attributes)
    .map(([fieldName, value]) => serializeAttribute(fieldName, value))
    .filter((attribute) => attribute !== "")
    .join(" ");
}

export function serializeAttribute(fieldName: string, value: string): string {
  return value === "" ? "" : `${fieldName}=${quoteAttributeValue(value)}`;
}

export function quoteValue(value: string): string {
  return `"${escapeQuotedValue(value)}"`;
}

export function quoteAttributeValue(value: string): string {
  return needsQuotes(value) ? quoteValue(value) : value;
}

function createElementCounters(): Record<ElementType, number> {
  return {
    climb: 0,
    downclimb: 0,
    exit: 0,
    hazard: 0,
    note: 0,
    pool: 0,
    rappel: 0,
    start: 0,
    walk: 0
  };
}

function generatedElementId(element: RouteElement, sequence: number): string {
  return element.vrlId === "" ? generatedVrlId(element.type, sequence) : element.vrlId;
}

function escapeQuotedValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function needsQuotes(value: string): boolean {
  return /\s|#|"/.test(value);
}
