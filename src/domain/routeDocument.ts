import { normalizeCountryName } from "./countries";
import { normalizeElevationMeasurement } from "./elevation";
import { defaultAttributesFor, elementPrefix, obstacleDefinition } from "./obstacleCatalog";
import type { ElementType, IdFactory, RouteDocument, RouteElement, RouteMetadata } from "./routeTypes";

export const defaultRouteMetadata: RouteMetadata = {
  country: "Costa Rica",
  difficulty: "V3 A3 II",
  entrance_elevation: "1300m",
  exit_elevation: "1100m",
  language: "en",
  region: "Cartago",
  symbology: "federation"
};

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

export function updateRouteName(document: RouteDocument, routeName: string): RouteDocument {
  return {
    ...document,
    routeName
  };
}

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

export function updateElementLabel(document: RouteDocument, editorId: string, label: string): RouteDocument {
  return updateRouteElement(document, editorId, (element) => ({
    ...element,
    label
  }));
}

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

export function removeRouteElement(document: RouteDocument, editorId: string): RouteDocument {
  return {
    ...document,
    elements: document.elements.filter((element) => element.editorId !== editorId || isFixedEndpoint(element))
  };
}

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

export function selectedElement(document: RouteDocument, editorId: null | string): null | RouteElement {
  return document.elements.find((element) => element.editorId === editorId) ?? null;
}

export function generatedVrlId(type: ElementType, sequence: number): string {
  return type === "start" || type === "exit" ? "" : `${elementPrefix(type)}${sequence}`;
}

export function isFixedEndpoint(element: RouteElement): boolean {
  return element.type === "start" || element.type === "exit";
}

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

function normalizeRouteMetadataValue(metadata: RouteMetadata, fieldName: keyof RouteMetadata, value: string): string {
  if (fieldName === "country") {
    return normalizeCountryName(value, metadata.country);
  }

  if (fieldName === "entrance_elevation" || fieldName === "exit_elevation") {
    return normalizeElevationMeasurement(value, metadata[fieldName]);
  }

  return value;
}

function canMoveElement(elements: RouteElement[], sourceIndex: number, targetIndex: number): boolean {
  if (sourceIndex <= 0 || targetIndex <= 0) {
    return false;
  }

  if (sourceIndex >= elements.length - 1 || targetIndex >= elements.length - 1) {
    return false;
  }

  return true;
}

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

function randomId(): string {
  return globalThis.crypto?.randomUUID() ?? Math.random().toString(36).slice(2);
}
