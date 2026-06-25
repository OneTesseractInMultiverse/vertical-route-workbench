import { describe, expect, it, vi } from "vitest";
import { createVrlRouteLoader, loadRouteSource } from "../../src/adapters/vrlRouteLoader";
import { defaultRouteMetadata } from "../../src/domain/routeDocument";
import type { VrlCompileResult } from "@subvertic/vrl-core";
import { validVrlSource } from "../helpers/fixtures";

describe("VRL route loader adapter", () => {
  it("delegates route source through created loader ports", () => {
    const compile = vi.fn(() => minimalCompilation());
    createVrlRouteLoader({ compile }).load("source");
    expect(compile).toHaveBeenCalledWith("source");
  });

  it("converts injected compiled models into editable documents", () => {
    expect(createVrlRouteLoader({ compile: () => minimalCompilation() }).load("source")).toEqual({
      diagnostics: [],
      document: {
        elements: [
          { attributes: {}, editorId: "start-S1", label: "Start", type: "start", vrlId: "" },
          { attributes: {}, editorId: "exit-E1", label: "Exit", type: "exit", vrlId: "" }
        ],
        metadata: defaultRouteMetadata,
        routeName: "Untitled Route"
      },
      ok: true
    });
  });

  it("loads valid VRL source through the real compiler", () => {
    const loaded = loadRouteSource(validVrlSource());
    expect(loaded.ok && loaded.document.elements.map((element) => element.type)).toEqual(["start", "walk", "rappel", "pool", "hazard", "note", "exit"]);
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

  it("rejects failed compilation with diagnostics", () => {
    expect(loadRouteSource("bad", { compile: () => failedCompilation() })).toEqual({
      diagnostics: [{ message: "ERROR validation at 1:1: Bad", severity: "error" }],
      ok: false
    });
  });

  it("rejects invalid compiled model shapes without producing documents", () => {
    expect(loadRouteSource("bad", { compile: () => invalidModelCompilation() })).toEqual({
      diagnostics: [],
      ok: false
    });
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
