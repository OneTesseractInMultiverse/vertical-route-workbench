import { formatDiagnostic, type VrlDiagnostic } from "@subvertic/vrl-core";
import type { PreviewDiagnostic } from "../ports/previewRenderer";

/** Converts compiler diagnostics into the simplified diagnostic shape used by the editor UI. */
export function toPreviewDiagnostic(diagnostic: VrlDiagnostic): PreviewDiagnostic {
  return {
    message: formatDiagnostic(diagnostic),
    severity: diagnostic.severity
  };
}

/** Determines whether any diagnostic should block saving or exporting. */
export function hasBlockingDiagnostic(diagnostics: PreviewDiagnostic[]): boolean {
  return diagnostics.some((diagnostic) => diagnostic.severity === "error");
}
