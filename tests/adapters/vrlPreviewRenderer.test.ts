import { describe, expect, it } from "vitest";
import { createVrlPreviewRenderer, renderPreview } from "../../src/adapters/vrlPreviewRenderer";
import type { VrlCompileResult } from "@subvertic/vrl-core";
import { documentWithRappel } from "../helpers/fixtures";

describe("VRL preview renderer adapter", () => {
  it("creates a renderer port", () => {
    expect(typeof createVrlPreviewRenderer().render).toBe("function");
  });

  it("uses injected dependencies through the renderer port", () => {
    expect(createVrlPreviewRenderer(successfulDependencies()).render("source", documentWithRappel()).svg).toBe("<svg />");
  });

  it("renders SVG when compilation succeeds", () => {
    expect(renderPreview("source", documentWithRappel(), successfulDependencies()).svg).toBe("<svg />");
  });

  it("marks previews savable when compilation has no errors", () => {
    expect(renderPreview("source", documentWithRappel(), successfulDependencies()).canSave).toBe(true);
  });

  it("keeps SVG empty when compilation fails", () => {
    expect(renderPreview("source", documentWithRappel(), failingDependencies()).svg).toBe("");
  });

  it("blocks saving when compilation fails", () => {
    expect(renderPreview("source", documentWithRappel(), failingDependencies()).canSave).toBe(false);
  });
});

function successfulDependencies() {
  return {
    compile: () => successfulCompileResult(),
    renderSvg: () => "<svg />"
  };
}

function failingDependencies() {
  return {
    compile: () => failingCompileResult(),
    renderSvg: () => "<svg />"
  };
}

function successfulCompileResult(): VrlCompileResult {
  return {
    diagnostics: [],
    layout: {},
    model: {},
    ok: true
  };
}

function failingCompileResult(): VrlCompileResult {
  return {
    diagnostics: [vrlDiagnostic("error")],
    layout: null,
    model: null,
    ok: false
  };
}

function vrlDiagnostic(severity: "error" | "warning") {
  return {
    kind: "validation",
    location: {
      column: 1,
      line: 1
    },
    message: "Bad route",
    severity,
    suggestion: ""
  };
}
