import { formatDiagnostic, type VrlDiagnostic } from "@subvertic/vrl-core";
import type { PreviewDiagnostic } from "../ports/previewRenderer";

export function toPreviewDiagnostic(diagnostic: VrlDiagnostic): PreviewDiagnostic {
  return {
    message: formatDiagnostic(diagnostic),
    severity: diagnostic.severity
  };
}

export function hasBlockingDiagnostic(diagnostics: PreviewDiagnostic[]): boolean {
  return diagnostics.some((diagnostic) => diagnostic.severity === "error");
}
