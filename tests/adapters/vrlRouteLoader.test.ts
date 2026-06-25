import { describe, expect, it } from "vitest";
import { createVrlRouteLoader, loadRouteSource } from "../../src/adapters/vrlRouteLoader";
import type { VrlCompileResult } from "@subvertic/vrl-core";
import { validVrlSource } from "../helpers/fixtures";

describe("VRL route loader adapter", () => {
  it("creates a loader port", () => {
    expect(typeof createVrlRouteLoader().load).toBe("function");
  });

  it("uses injected dependencies through the loader port", () => {
    expect(createVrlRouteLoader({ compile: () => minimalCompilation() }).load("source").ok).toBe(true);
  });

  it("loads valid VRL source through the real compiler", () => {
    expect(loadRouteSource(validVrlSource()).ok).toBe(true);
  });

  it("converts route names from compiled models", () => {
    const loaded = loadRouteSource(validVrlSource());
    expect(loaded.ok && loaded.document.routeName).toBe("Loaded Canyon");
  });

  it("converts metadata measurements to VRL strings", () => {
    const loaded = loadRouteSource(validVrlSource());
    expect(loaded.ok && loaded.document.metadata.entrance_elevation).toBe("1300m");
  });

  it("converts redirection arrays to VRL strings", () => {
    const loaded = loadRouteSource(validVrlSource());
    expect(loaded.ok && loaded.document.elements[2]?.attributes.redirections).toBe("12m:left,27m:right");
  });

  it("converts stage arrays to VRL strings", () => {
    const loaded = loadRouteSource(validVrlSource());
    expect(loaded.ok && loaded.document.elements[2]?.attributes.stages).toBe("20m+15m");
  });

  it("converts inclination objects to VRL strings", () => {
    const loaded = loadRouteSource(validVrlSource());
    expect(loaded.ok && loaded.document.elements[2]?.attributes.inclination).toBe("80%");
  });

  it("returns imported VRL ids for non-endpoints", () => {
    const loaded = loadRouteSource(validVrlSource());
    expect(loaded.ok && loaded.document.elements[2]?.vrlId).toBe("R9");
  });

  it("rejects failed compilation", () => {
    expect(loadRouteSource("bad", { compile: () => failedCompilation() }).ok).toBe(false);
  });

  it("rejects invalid compiled model shapes", () => {
    expect(loadRouteSource("bad", { compile: () => invalidModelCompilation() }).ok).toBe(false);
  });

  it("uses default metadata when fields are missing", () => {
    const loaded = loadRouteSource("source", { compile: () => minimalCompilation() });
    expect(loaded.ok && loaded.document.metadata.country).toBe("Costa Rica");
  });

  it("uses a fallback name for null route names", () => {
    const loaded = loadRouteSource("source", { compile: () => minimalCompilation() });
    expect(loaded.ok && loaded.document.routeName).toBe("Untitled Route");
  });
});

function failedCompilation(): VrlCompileResult {
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
    message: "Bad",
    severity,
    suggestion: ""
  };
}

function invalidModelCompilation(): VrlCompileResult {
  return {
    diagnostics: [],
    layout: null,
    model: { elements: [{ type: "jump" }] },
    ok: true
  };
}

function minimalCompilation(): VrlCompileResult {
  return {
    diagnostics: [],
    layout: null,
    model: {
      elements: [
        { attributes: {}, id: "S1", label: "Start", type: "start" },
        { attributes: {}, id: "E1", label: "Exit", type: "exit" }
      ],
      metadata: {},
      name: null
    },
    ok: true
  };
}
