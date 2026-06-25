import { normalizeCountryName } from "./countries";
import { normalizeElevationMeasurement } from "./elevation";
import { defaultAttributesFor, elementPrefix, obstacleDefinition } from "./obstacleCatalog";
import type { ElementType, IdFactory, RouteDocument, RouteElement, RouteMetadata } from "./routeTypes";

/** Default route metadata used for a new editor document and for missing imported metadata. */
export const defaultRouteMetadata: RouteMetadata = {
  country: "Costa Rica",
  difficulty: "V3 A3 II",
  entrance_elevation: "1300m",
  exit_elevation: "1100m",
  language: "en",
  region: "Cartago",
  symbology: "federation"
};

/** Creates a new route document with fixed start and exit endpoints. */
export function createInitialRouteDocument(idFactory: IdFactory = randomId): RouteDocument {
  return {
    elements: [
      createRouteElement("start", idFactory),
      createRouteElement("exit", idFactory)
    ],
    metadata: { ...defaultRouteMetadata },
    routeName: "Quebrada Gata"
  };
}

/** Creates one route element with catalog defaults, a stable editor ID, and no imported VRL ID. */
export function createRouteElement(type: ElementType, idFactory: IdFactory = randomId): RouteElement {
  const definition = obstacleDefinition(type);

  return {
    attributes: defaultAttributesFor(type),
    editorId: `${type}-${idFactory()}`,
    label: definition.defaultLabel,
    type,
    vrlId: ""
  };
}

/** Inserts a new obstacle immediately before the fixed exit endpoint. */
export function insertElementBeforeExit(
  document: RouteDocument,
  type: ElementType,
  idFactory: IdFactory = randomId
): RouteDocument {
  const exitIndex = Math.max(0, document.elements.length - 1);
  const nextElement = createRouteElement(type, idFactory);

  return {
    ...document,
    elements: [
      ...document.elements.slice(0, exitIndex),
      nextElement,
      ...document.elements.slice(exitIndex)
    ]
  };
}

/** Returns a copy of the route document with an updated route name. */
export function updateRouteName(document: RouteDocument, routeName: string): RouteDocument {
  return {
    ...document,
    routeName
  };
}

/** Returns a copy of the route document with one normalized metadata field changed. */
export function updateRouteMetadata(
  document: RouteDocument,
  fieldName: keyof RouteMetadata,
  value: string
): RouteDocument {
  const normalizedValue = normalizeRouteMetadataValue(document.metadata, fieldName, value);

  return {
    ...document,
    metadata: {
      ...document.metadata,
      [fieldName]: normalizedValue
    }
  };
}

/** Returns a copy of the route document with one element label changed. */
export function updateElementLabel(document: RouteDocument, editorId: string, label: string): RouteDocument {
  return updateRouteElement(document, editorId, (element) => ({
    ...element,
    label
  }));
}

/** Returns a copy of the route document with one element attribute changed. */
export function updateElementAttribute(
  document: RouteDocument,
  editorId: string,
  fieldName: string,
  value: string
): RouteDocument {
  return updateRouteElement(document, editorId, (element) => ({
    ...element,
    attributes: {
      ...element.attributes,
      [fieldName]: value
    }
  }));
}

/** Removes user-editable obstacles while preserving fixed start and exit endpoints. */
export function removeRouteElement(document: RouteDocument, editorId: string): RouteDocument {
  return {
    ...document,
    elements: document.elements.filter((element) => element.editorId !== editorId || isFixedEndpoint(element))
  };
}

/** Moves one non-endpoint element up or down without crossing start or exit. */
export function moveRouteElement(document: RouteDocument, editorId: string, direction: -1 | 1): RouteDocument {
  const sourceIndex = document.elements.findIndex((element) => element.editorId === editorId);
  const targetIndex = sourceIndex + direction;

  if (canMoveElement(document.elements, sourceIndex, targetIndex) === false) {
    return document;
  }

  return {
    ...document,
    elements: swapItems(document.elements, sourceIndex, targetIndex)
  };
}

/** Finds the selected route element by editor ID, returning `null` for empty or missing selection. */
export function selectedElement(document: RouteDocument, editorId: null | string): null | RouteElement {
  return document.elements.find((element) => element.editorId === editorId) ?? null;
}

/** Generates compact VRL IDs for obstacles and intentionally omits IDs for endpoints. */
export function generatedVrlId(type: ElementType, sequence: number): string {
  return type === "start" || type === "exit" ? "" : `${elementPrefix(type)}${sequence}`;
}

/** Identifies route endpoints that cannot be deleted or reordered. */
export function isFixedEndpoint(element: RouteElement): boolean {
  return element.type === "start" || element.type === "exit";
}

/** Applies a pure update function to a matching route element. */
function updateRouteElement(
  document: RouteDocument,
  editorId: string,
  update: (element: RouteElement) => RouteElement
): RouteDocument {
  return {
    ...document,
    elements: document.elements.map((element) => element.editorId === editorId ? update(element) : element)
  };
}

/** Applies metadata-specific normalization rules before storing route metadata. */
function normalizeRouteMetadataValue(metadata: RouteMetadata, fieldName: keyof RouteMetadata, value: string): string {
  if (fieldName === "country") {
    return normalizeCountryName(value, metadata.country);
  }

  if (fieldName === "entrance_elevation" || fieldName === "exit_elevation") {
    return normalizeElevationMeasurement(value, metadata[fieldName]);
  }

  return value;
}

/** Checks whether a move keeps the element between the fixed endpoints. */
function canMoveElement(elements: RouteElement[], sourceIndex: number, targetIndex: number): boolean {
  if (sourceIndex <= 0 || targetIndex <= 0) {
    return false;
  }

  if (sourceIndex >= elements.length - 1 || targetIndex >= elements.length - 1) {
    return false;
  }

  return true;
}

/** Swaps two items in an immutable array copy. */
function swapItems<T>(items: T[], sourceIndex: number, targetIndex: number): T[] {
  return items.map((item, index) => {
    if (index === sourceIndex) {
      return items[targetIndex] as T;
    }

    if (index === targetIndex) {
      return items[sourceIndex] as T;
    }

    return item;
  });
}

/** Creates a browser-backed UUID when available and a compact random fallback otherwise. */
function randomId(): string {
  return globalThis.crypto?.randomUUID() ?? Math.random().toString(36).slice(2);
}
