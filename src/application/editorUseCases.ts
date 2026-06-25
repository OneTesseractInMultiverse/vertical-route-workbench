import {
  insertElementBeforeExit,
  moveRouteElement,
  removeRouteElement,
  updateElementAttribute,
  updateElementLabel,
  updateRouteMetadata,
  updateRouteName
} from "../domain/routeDocument";
import { serializeRouteDocument } from "../domain/vrlSerializer";
import type { ElementType, IdFactory, RouteDocument, RouteMetadata } from "../domain/routeTypes";
import type { FileGateway, FileSaveResult } from "../ports/fileGateway";
import type { PreviewResult } from "../ports/previewRenderer";
import type { RouteLoader, RouteLoadResult } from "../ports/routeLoader";

export function addObstacle(
  document: RouteDocument,
  type: ElementType,
  idFactory?: IdFactory
): RouteDocument {
  return insertElementBeforeExit(document, type, idFactory);
}

export function editRouteName(document: RouteDocument, routeName: string): RouteDocument {
  return updateRouteName(document, routeName);
}

export function editRouteMetadata(
  document: RouteDocument,
  fieldName: keyof RouteMetadata,
  value: string
): RouteDocument {
  return updateRouteMetadata(document, fieldName, value);
}

export function editElementLabel(document: RouteDocument, editorId: string, label: string): RouteDocument {
  return updateElementLabel(document, editorId, label);
}

export function editElementAttribute(
  document: RouteDocument,
  editorId: string,
  fieldName: string,
  value: string
): RouteDocument {
  return updateElementAttribute(document, editorId, fieldName, value);
}

export function deleteObstacle(document: RouteDocument, editorId: string): RouteDocument {
  return removeRouteElement(document, editorId);
}

export function moveObstacle(document: RouteDocument, editorId: string, direction: -1 | 1): RouteDocument {
  return moveRouteElement(document, editorId, direction);
}

export function loadRouteSource(loader: RouteLoader, source: string): RouteLoadResult {
  return loader.load(source);
}

export async function saveRouteSource(
  gateway: FileGateway,
  document: RouteDocument,
  filePath: null | string,
  preview: PreviewResult
): Promise<FileSaveResult> {
  if (preview.canSave === false) {
    return { canceled: true };
  }

  return gateway.saveRouteFile({
    filePath,
    source: serializeRouteDocument(document)
  });
}

export async function saveRouteSourceAs(
  gateway: FileGateway,
  document: RouteDocument,
  preview: PreviewResult
): Promise<FileSaveResult> {
  if (preview.canSave === false) {
    return { canceled: true };
  }

  return gateway.saveRouteFileAs({
    filePath: null,
    source: serializeRouteDocument(document)
  });
}
