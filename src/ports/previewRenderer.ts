import type { RouteDocument } from "../domain/routeTypes";

/** Severity levels surfaced from the VRL compiler into the editor UI. */
export type DiagnosticSeverity = "error" | "warning";

/** UI-safe compiler diagnostic with formatted text and severity. */
export type PreviewDiagnostic = {
  message: string;
  severity: DiagnosticSeverity;
};

/** Result of compiling VRL source and optionally rendering a topo SVG preview. */
export type PreviewResult = {
  canSave: boolean;
  diagnostics: PreviewDiagnostic[];
  ok: boolean;
  svg: string;
};

/** Port used by the application shell to produce the live SVG preview. */
export type PreviewRenderer = {
  render: (source: string, document: RouteDocument) => PreviewResult;
};
