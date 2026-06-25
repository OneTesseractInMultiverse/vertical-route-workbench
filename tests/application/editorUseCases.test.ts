import { describe, expect, it, vi } from "vitest";
import {
  addObstacle,
  deleteObstacle,
  editElementAttribute,
  editElementLabel,
  editRouteMetadata,
  editRouteName,
  exportPreviewPng,
  loadRouteSource,
  moveObstacle,
  pngFileNameForRoute,
  saveRouteSource,
  saveRouteSourceAs
} from "../../src/application/editorUseCases";
import { createInitialRouteDocument } from "../../src/domain/routeDocument";
import type { FileGateway } from "../../src/ports/fileGateway";
import type { PngExporter } from "../../src/ports/pngExporter";
import type { PreviewResult } from "../../src/ports/previewRenderer";
import type { RouteLoader } from "../../src/ports/routeLoader";
import { deterministicIds, documentWithRappel } from "../helpers/fixtures";

describe("editor use cases", () => {
  it("adds obstacles through the document policy", () => {
    expect(addObstacle(createInitialRouteDocument(deterministicIds("start", "exit")), "pool", deterministicIds("pool")).elements.map((element) => element.type)).toEqual(["start", "pool", "exit"]);
  });

  it("edits route names", () => {
    expect(editRouteName(createInitialRouteDocument(), "Gata").routeName).toBe("Gata");
  });

  it("edits metadata", () => {
    expect(editRouteMetadata(createInitialRouteDocument(), "country", "Spain").metadata.country).toBe("Spain");
  });

  it("edits labels", () => {
    expect(editElementLabel(documentWithRappel(), "rappel-rappel", "Main line").elements[1]?.label).toBe("Main line");
  });

  it("edits attributes", () => {
    expect(editElementAttribute(documentWithRappel(), "rappel-rappel", "rope", "60m").elements[1]?.attributes.rope).toBe("60m");
  });

  it("deletes obstacles", () => {
    expect(deleteObstacle(documentWithRappel(), "rappel-rappel").elements.map((element) => element.type)).toEqual(["start", "exit"]);
  });

  it("moves obstacles", () => {
    const document = addObstacle(documentWithRappel(), "pool", deterministicIds("pool"));
    expect(moveObstacle(document, "rappel-rappel", 1).elements.map((element) => element.type)).toEqual(["start", "pool", "rappel", "exit"]);
  });

  it("loads route source through the route loader port", () => {
    expect(loadRouteSource(successfulLoader(), "source")).toEqual({
      diagnostics: [],
      document: documentWithRappel(),
      ok: true
    });
  });

  it("passes route source to the route loader port", () => {
    const loader = successfulLoader();
    loadRouteSource(loader, "source");
    expect(loader.load).toHaveBeenCalledWith("source");
  });

  it("returns canceled when save is blocked by preview diagnostics", async () => {
    await expect(saveRouteSource(fileGateway(), documentWithRappel(), null, blockedPreview())).resolves.toEqual({ canceled: true });
  });

  it("does not call save ports when save is blocked", async () => {
    const gateway = fileGateway();
    await saveRouteSource(gateway, documentWithRappel(), null, blockedPreview());
    expect(gateway.saveRouteFile).not.toHaveBeenCalled();
  });

  it("returns canceled when save as is blocked by preview diagnostics", async () => {
    await expect(saveRouteSourceAs(fileGateway(), documentWithRappel(), blockedPreview())).resolves.toEqual({ canceled: true });
  });

  it("does not call save-as ports when save-as is blocked", async () => {
    const gateway = fileGateway();
    await saveRouteSourceAs(gateway, documentWithRappel(), blockedPreview());
    expect(gateway.saveRouteFileAs).not.toHaveBeenCalled();
  });

  it("saves through the file gateway", async () => {
    await expect(saveRouteSource(fileGateway(), documentWithRappel(), null, cleanPreview())).resolves.toEqual({ canceled: false, filePath: "route.vrl" });
  });

  it("passes serialized route source to save ports", async () => {
    const gateway = fileGateway();
    await saveRouteSource(gateway, documentWithRappel(), null, cleanPreview());
    expect(gateway.saveRouteFile).toHaveBeenCalledWith({ filePath: null, source: serializedRappelDocument() });
  });

  it("saves as through the file gateway", async () => {
    await expect(saveRouteSourceAs(fileGateway(), documentWithRappel(), cleanPreview())).resolves.toEqual({ canceled: false, filePath: "route-as.vrl" });
  });

  it("passes serialized route source to save-as ports", async () => {
    const gateway = fileGateway();
    await saveRouteSourceAs(gateway, documentWithRappel(), cleanPreview());
    expect(gateway.saveRouteFileAs).toHaveBeenCalledWith({ filePath: null, source: serializedRappelDocument() });
  });

  it("returns blocked when PNG export has preview diagnostics", async () => {
    await expect(exportPreviewPng(fileGateway(), successfulPngExporter(), "Gata", blockedPreview())).resolves.toEqual({ ok: false, reason: "blocked" });
  });

  it("does not rasterize PNG exports when preview diagnostics block export", async () => {
    const exporter = successfulPngExporter();
    await exportPreviewPng(fileGateway(), exporter, "Gata", blockedPreview());
    expect(exporter.exportSvg).not.toHaveBeenCalled();
  });

  it("returns blocked when PNG export has no SVG", async () => {
    await expect(exportPreviewPng(fileGateway(), successfulPngExporter(), "Gata", emptyPreview())).resolves.toEqual({ ok: false, reason: "blocked" });
  });

  it("returns render failed when PNG rasterization fails", async () => {
    await expect(exportPreviewPng(fileGateway(), failedPngExporter(), "Gata", cleanPreview())).resolves.toEqual({ ok: false, reason: "render-failed" });
  });

  it("does not save PNG files when rasterization fails", async () => {
    const gateway = fileGateway();
    await exportPreviewPng(gateway, failedPngExporter(), "Gata", cleanPreview());
    expect(gateway.savePngFile).not.toHaveBeenCalled();
  });

  it("returns canceled when PNG save is canceled", async () => {
    await expect(exportPreviewPng(cancelingFileGateway(), successfulPngExporter(), "Gata", cleanPreview())).resolves.toEqual({ ok: false, reason: "canceled" });
  });

  it("exports PNG files through the gateway", async () => {
    await expect(exportPreviewPng(fileGateway(), successfulPngExporter(), "Gata", cleanPreview())).resolves.toEqual({ filePath: "route.png", ok: true });
  });

  it("exports PNG files at a high-resolution scale", async () => {
    const exporter = successfulPngExporter();
    await exportPreviewPng(fileGateway(), exporter, "Gata", cleanPreview());
    expect(exporter.exportSvg).toHaveBeenCalledWith({ scale: 4, svg: "<svg />" });
  });

  it("passes rasterized PNG bytes and route names to PNG save ports", async () => {
    const gateway = fileGateway();
    await exportPreviewPng(gateway, successfulPngExporter(), "Gata", cleanPreview());
    expect(gateway.savePngFile).toHaveBeenCalledWith({ data: new Uint8Array([1, 2, 3]), defaultPath: "Gata.png" });
  });

  it("creates safe PNG file names from route names", () => {
    expect(pngFileNameForRoute(" Quebrada/Gata:* ")).toBe("Quebrada-Gata.png");
  });

  it("falls back to route PNG file names", () => {
    expect(pngFileNameForRoute(" / ")).toBe("route.png");
  });

  it("replaces control characters in PNG file names", () => {
    expect(pngFileNameForRoute("Gata\u0001Media")).toBe("Gata-Media.png");
  });
});

function blockedPreview(): PreviewResult {
  return {
    canSave: false,
    diagnostics: [{ message: "Invalid", severity: "error" }],
    ok: false,
    svg: ""
  };
}

function cleanPreview(): PreviewResult {
  return {
    canSave: true,
    diagnostics: [],
    ok: true,
    svg: "<svg />"
  };
}

function emptyPreview(): PreviewResult {
  return {
    canSave: true,
    diagnostics: [],
    ok: true,
    svg: ""
  };
}

function fileGateway(): FileGateway {
  return {
    openRouteFile: vi.fn(),
    savePngFile: vi.fn(async () => ({ canceled: false, filePath: "route.png" })),
    saveRouteFile: vi.fn(async () => ({ canceled: false, filePath: "route.vrl" })),
    saveRouteFileAs: vi.fn(async () => ({ canceled: false, filePath: "route-as.vrl" }))
  };
}

function cancelingFileGateway(): FileGateway {
  return {
    openRouteFile: vi.fn(),
    savePngFile: vi.fn(async () => ({ canceled: true as const })),
    saveRouteFile: vi.fn(async () => ({ canceled: false, filePath: "route.vrl" })),
    saveRouteFileAs: vi.fn(async () => ({ canceled: false, filePath: "route-as.vrl" }))
  };
}

function successfulPngExporter(): PngExporter {
  return {
    exportSvg: vi.fn(async () => ({ data: new Uint8Array([1, 2, 3]), ok: true as const }))
  };
}

function failedPngExporter(): PngExporter {
  return {
    exportSvg: vi.fn(async () => ({ ok: false as const, reason: "failed" }))
  };
}

function successfulLoader(): RouteLoader {
  return {
    load: vi.fn(() => ({
      diagnostics: [],
      document: documentWithRappel(),
      ok: true
    }))
  };
}

function serializedRappelDocument(): string {
  return [
    'route "Quebrada Gata" {',
    '  metadata difficulty="V3 A3 II" region=Cartago country="Costa Rica" entrance_elevation=1300m exit_elevation=1100m',
    '  start "Entrance"',
    '  rappel R1 height=20m rope=40m anchor=bolts anchor_count=2 station=center landing=pool inclination=100% shape=ladder flow=low',
    '  exit "Exit"',
    '}',
    ''
  ].join("\n");
}
