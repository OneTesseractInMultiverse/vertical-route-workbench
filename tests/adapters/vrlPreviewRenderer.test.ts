import { describe, expect, it, vi } from "vitest";
import { createVrlPreviewRenderer, renderPreview } from "../../src/adapters/vrlPreviewRenderer";
import type { VrlCompileResult } from "@subvertic/vrl-core";
import { documentWithRappel } from "../helpers/fixtures";

describe("VRL preview renderer adapter", () => {
  it("delegates source and layout options through created renderer ports", () => {
    const dependencies = successfulDependencies();
    createVrlPreviewRenderer(dependencies).render("source", documentWithRappel());
    expect(dependencies.compile).toHaveBeenCalledWith("source", {
      layout: expect.objectContaining({ pixelsPerMeter: 3.2, width: 760 })
    });
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

  it("passes document render settings to the SVG renderer", () => {
    const dependencies = successfulDependencies();
    renderPreview("source", documentWithRappel(), dependencies);
    expect(dependencies.renderSvg).toHaveBeenCalledWith({}, {}, { language: "en", symbology: "federation" });
  });

  it("returns blocking failures with diagnostics and no SVG", () => {
    expect(renderPreview("source", documentWithRappel(), failingDependencies())).toEqual({
      canSave: false,
      diagnostics: [{ message: "ERROR validation at 1:1: Bad route", severity: "error" }],
      ok: false,
      svg: ""
    });
  });

  it("does not call the SVG renderer when compilation fails", () => {
    const dependencies = failingDependencies();
    renderPreview("source", documentWithRappel(), dependencies);
    expect(dependencies.renderSvg).not.toHaveBeenCalled();
  });

  it("keeps warning-only previews savable", () => {
    expect(renderPreview("source", documentWithRappel(), warningDependencies()).canSave).toBe(true);
  });
});

function successfulDependencies() {
  return {
    compile: vi.fn(() => successfulCompileResult()),
    renderSvg: vi.fn(() => "<svg />")
  };
}

function failingDependencies() {
  return {
    compile: vi.fn(() => failingCompileResult()),
    renderSvg: vi.fn(() => "<svg />")
  };
}

function warningDependencies() {
  return {
    compile: vi.fn(() => warningCompileResult()),
    renderSvg: vi.fn(() => "<svg />")
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

function warningCompileResult(): VrlCompileResult {
  return {
    diagnostics: [vrlDiagnostic("warning")],
    layout: {},
    model: {},
    ok: true
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
