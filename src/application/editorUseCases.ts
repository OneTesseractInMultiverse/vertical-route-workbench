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
import type { PngExporter } from "../ports/pngExporter";
import type { PreviewResult } from "../ports/previewRenderer";
import type { RouteLoader, RouteLoadResult } from "../ports/routeLoader";

const highResolutionPngScale = 4;

/** Result returned by the PNG export use case after rasterization and save handling. */
export type PreviewPngExportResult =
  | { filePath: string; ok: true }
  | { ok: false; reason: "blocked" | "canceled" | "render-failed" };

/** Adds an obstacle through the route document insertion policy. */
export function addObstacle(
  document: RouteDocument,
  type: ElementType,
  idFactory?: IdFactory
): RouteDocument {
  return insertElementBeforeExit(document, type, idFactory);
}

/** Updates the route name without mutating the existing document. */
export function editRouteName(document: RouteDocument, routeName: string): RouteDocument {
  return updateRouteName(document, routeName);
}

/** Updates one route metadata field and lets the domain normalize constrained fields. */
export function editRouteMetadata(
  document: RouteDocument,
  fieldName: keyof RouteMetadata,
  value: string
): RouteDocument {
  return updateRouteMetadata(document, fieldName, value);
}

/** Updates the display label for a route element. */
export function editElementLabel(document: RouteDocument, editorId: string, label: string): RouteDocument {
  return updateElementLabel(document, editorId, label);
}

/** Updates one editable obstacle attribute by field name. */
export function editElementAttribute(
  document: RouteDocument,
  editorId: string,
  fieldName: string,
  value: string
): RouteDocument {
  return updateElementAttribute(document, editorId, fieldName, value);
}

/** Removes a user-editable obstacle while preserving fixed endpoints. */
export function deleteObstacle(document: RouteDocument, editorId: string): RouteDocument {
  return removeRouteElement(document, editorId);
}

/** Moves a user-editable obstacle one slot in the route sequence. */
export function moveObstacle(document: RouteDocument, editorId: string, direction: -1 | 1): RouteDocument {
  return moveRouteElement(document, editorId, direction);
}

/** Loads `.vrl` source through the route-loader port. */
export function loadRouteSource(loader: RouteLoader, source: string): RouteLoadResult {
  return loader.load(source);
}

/** Saves the current document to the known path when preview diagnostics allow it. */
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

/** Saves the current document through a save-as flow when preview diagnostics allow it. */
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

/** Rasterizes the current preview SVG at high resolution and saves it as a PNG file. */
export async function exportPreviewPng(
  gateway: FileGateway,
  exporter: PngExporter,
  routeName: string,
  preview: PreviewResult
): Promise<PreviewPngExportResult> {
  if (preview.canSave === false || preview.svg.trim() === "") {
    return { ok: false, reason: "blocked" };
  }

  const exportedImage = await exporter.exportSvg({
    scale: highResolutionPngScale,
    svg: preview.svg
  });

  if (exportedImage.ok === false) {
    return { ok: false, reason: "render-failed" };
  }

  const saved = await gateway.savePngFile({
    data: exportedImage.data,
    defaultPath: pngFileNameForRoute(routeName)
  });

  return saved.canceled ? { ok: false, reason: "canceled" } : { ok: true, filePath: saved.filePath };
}

/** Creates a filesystem-safe default PNG filename from the route name. */
export function pngFileNameForRoute(routeName: string): string {
  const fileStem = safeFileStem(routeName);

  return `${fileStem}.png`;
}

/** Sanitizes a route name into a non-empty filename stem. */
function safeFileStem(routeName: string): string {
  const sanitized = routeName
    .trim()
    .split("")
    .map(safeFileNameCharacter)
    .join("")
    .replace(/\s+/g, " ")
    .replace(/-+/g, "-")
    .replace(/^[ .-]+|[ .-]+$/g, "");

  return sanitized === "" ? "route" : sanitized;
}

/** Replaces one unsafe filename character while preserving valid display characters. */
function safeFileNameCharacter(character: string): string {
  return isUnsafeFileNameCharacter(character) ? "-" : character;
}

/** Detects control characters and path separators that should not appear in file names. */
function isUnsafeFileNameCharacter(character: string): boolean {
  return character.charCodeAt(0) < 32 || '<>:"/\\|?*'.includes(character);
}
