import type { RouteDocument } from "../domain/routeTypes";
import type { PreviewDiagnostic } from "./previewRenderer";

export type RouteLoadResult =
  | { diagnostics: PreviewDiagnostic[]; document: RouteDocument; ok: true }
  | { diagnostics: PreviewDiagnostic[]; ok: false };

export type RouteLoader = {
  load: (source: string) => RouteLoadResult;
};
