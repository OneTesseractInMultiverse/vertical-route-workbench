import type { RouteDocument } from "../domain/routeTypes";

export type DiagnosticSeverity = "error" | "warning";

export type PreviewDiagnostic = {
  message: string;
  severity: DiagnosticSeverity;
};

export type PreviewResult = {
  canSave: boolean;
  diagnostics: PreviewDiagnostic[];
  ok: boolean;
  svg: string;
};

export type PreviewRenderer = {
  render: (source: string, document: RouteDocument) => PreviewResult;
};
