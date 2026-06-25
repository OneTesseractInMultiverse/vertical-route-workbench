import type { RouteDocument } from "../domain/routeTypes";
import type { PreviewDiagnostic } from "./previewRenderer";

/** Result of parsing `.vrl` source into an editable route document. */
export type RouteLoadResult =
  | { diagnostics: PreviewDiagnostic[]; document: RouteDocument; ok: true }
  | { diagnostics: PreviewDiagnostic[]; ok: false };

/** Port for loading route source through the VRL parser/compiler. */
export type RouteLoader = {
  load: (source: string) => RouteLoadResult;
};
