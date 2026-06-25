import { describe, expect, it } from "vitest";
import { hasBlockingDiagnostic, toPreviewDiagnostic } from "../../src/adapters/vrlDiagnosticAdapter";

describe("VRL diagnostic adapter", () => {
  it("maps VRL diagnostics into preview diagnostics", () => {
    expect(toPreviewDiagnostic(vrlDiagnostic("warning")).severity).toBe("warning");
  });

  it("detects blocking diagnostics", () => {
    expect(hasBlockingDiagnostic([{ message: "Problem", severity: "error" }])).toBe(true);
  });

  it("allows warning-only diagnostics", () => {
    expect(hasBlockingDiagnostic([{ message: "Problem", severity: "warning" }])).toBe(false);
  });
});

function vrlDiagnostic(severity: "error" | "warning") {
  return {
    kind: "validation",
    location: {
      column: 1,
      line: 1
    },
    message: "Problem",
    severity,
    suggestion: ""
  };
}
