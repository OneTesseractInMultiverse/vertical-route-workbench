import { describe, expect, it, vi } from "vitest";
import {
  addObstacle,
  deleteObstacle,
  editElementAttribute,
  editElementLabel,
  editRouteMetadata,
  editRouteName,
  loadRouteSource,
  moveObstacle,
  saveRouteSource,
  saveRouteSourceAs
} from "../../src/application/editorUseCases";
import { createInitialRouteDocument } from "../../src/domain/routeDocument";
import type { FileGateway } from "../../src/ports/fileGateway";
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
    expect(loadRouteSource(successfulLoader(), "source").ok).toBe(true);
  });

  it("returns canceled when save is blocked by preview diagnostics", async () => {
    await expect(saveRouteSource(fileGateway(), documentWithRappel(), null, blockedPreview())).resolves.toEqual({ canceled: true });
  });

  it("returns canceled when save as is blocked by preview diagnostics", async () => {
    await expect(saveRouteSourceAs(fileGateway(), documentWithRappel(), blockedPreview())).resolves.toEqual({ canceled: true });
  });

  it("saves through the file gateway", async () => {
    await expect(saveRouteSource(fileGateway(), documentWithRappel(), null, cleanPreview())).resolves.toEqual({ canceled: false, filePath: "route.vrl" });
  });

  it("saves as through the file gateway", async () => {
    await expect(saveRouteSourceAs(fileGateway(), documentWithRappel(), cleanPreview())).resolves.toEqual({ canceled: false, filePath: "route-as.vrl" });
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

function fileGateway(): FileGateway {
  return {
    openRouteFile: vi.fn(),
    saveRouteFile: vi.fn(async () => ({ canceled: false, filePath: "route.vrl" })),
    saveRouteFileAs: vi.fn(async () => ({ canceled: false, filePath: "route-as.vrl" }))
  };
}

function successfulLoader(): RouteLoader {
  return {
    load: () => ({
      diagnostics: [],
      document: documentWithRappel(),
      ok: true
    })
  };
}
