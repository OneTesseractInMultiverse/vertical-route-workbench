import { describe, expect, it, vi } from "vitest";
import {
  createInitialRouteDocument,
  createRouteElement,
  generatedVrlId,
  insertElementBeforeExit,
  isFixedEndpoint,
  moveRouteElement,
  removeRouteElement,
  selectedElement,
  updateElementAttribute,
  updateElementLabel,
  updateRouteMetadata,
  updateRouteName
} from "../../src/domain/routeDocument";
import { deterministicIds, documentWithRappel } from "../helpers/fixtures";

describe("route document", () => {
  it("creates a route with fixed endpoints", () => {
    expect(createInitialRouteDocument(deterministicIds("a", "b")).elements.map((element) => element.type)).toEqual(["start", "exit"]);
  });

  it("creates deterministic editor ids when an id factory is provided", () => {
    expect(createRouteElement("pool", deterministicIds("pool")).editorId).toBe("pool-pool");
  });

  it("creates fallback random ids when web crypto is unavailable", () => {
    const originalCrypto = globalThis.crypto;
    const random = vi.spyOn(Math, "random").mockReturnValue(0.123456789);
    let editorId = "";
    vi.stubGlobal("crypto", undefined);

    try {
      editorId = createRouteElement("pool").editorId;
    } finally {
      random.mockRestore();
      vi.stubGlobal("crypto", originalCrypto);
    }

    expect(editorId).toBe("pool-4fzzzxjylrx");
  });

  it("inserts new obstacles before the exit endpoint", () => {
    expect(documentWithRappel().elements.map((element) => element.type)).toEqual(["start", "rappel", "exit"]);
  });

  it("updates the route name immutably", () => {
    expect(updateRouteName(createInitialRouteDocument(), "Rio Azul").routeName).toBe("Rio Azul");
  });

  it("keeps the original route name when updating immutably", () => {
    const document = createInitialRouteDocument();
    updateRouteName(document, "Rio Azul");
    expect(document.routeName).toBe("Quebrada Gata");
  });

  it("updates metadata fields immutably", () => {
    expect(updateRouteMetadata(createInitialRouteDocument(), "language", "es").metadata.language).toBe("es");
  });

  it("normalizes country metadata names", () => {
    expect(updateRouteMetadata(createInitialRouteDocument(), "country", "spain").metadata.country).toBe("Spain");
  });

  it("keeps the previous country for unknown country metadata", () => {
    expect(updateRouteMetadata(createInitialRouteDocument(), "country", "Atlantis").metadata.country).toBe("Costa Rica");
  });

  it("normalizes entrance elevation metadata", () => {
    expect(updateRouteMetadata(createInitialRouteDocument(), "entrance_elevation", "9000").metadata.entrance_elevation).toBe("9000m");
  });

  it("normalizes exit elevation metadata", () => {
    expect(updateRouteMetadata(createInitialRouteDocument(), "exit_elevation", "0").metadata.exit_elevation).toBe("0m");
  });

  it("keeps the previous elevation when metadata is above the maximum", () => {
    expect(updateRouteMetadata(createInitialRouteDocument(), "entrance_elevation", "9001").metadata.entrance_elevation).toBe("1300m");
  });

  it("keeps the previous elevation when metadata is below sea level", () => {
    expect(updateRouteMetadata(createInitialRouteDocument(), "exit_elevation", "-1").metadata.exit_elevation).toBe("1100m");
  });

  it("updates an element label", () => {
    const document = createInitialRouteDocument(deterministicIds("start", "exit"));
    expect(updateElementLabel(document, "start-start", "Trailhead").elements[0]?.label).toBe("Trailhead");
  });

  it("keeps labels unchanged for unknown elements", () => {
    expect(updateElementLabel(documentWithRappel(), "missing", "Trailhead")).toEqual(documentWithRappel());
  });

  it("updates an element attribute", () => {
    const document = documentWithRappel();
    expect(updateElementAttribute(document, "rappel-rappel", "height", "42m").elements[1]?.attributes.height).toBe("42m");
  });

  it("keeps attributes unchanged for unknown elements", () => {
    expect(updateElementAttribute(documentWithRappel(), "missing", "height", "42m")).toEqual(documentWithRappel());
  });

  it("removes non-fixed obstacles", () => {
    expect(removeRouteElement(documentWithRappel(), "rappel-rappel").elements.map((element) => element.type)).toEqual(["start", "exit"]);
  });

  it("keeps fixed endpoints when removal is requested", () => {
    expect(removeRouteElement(documentWithRappel(), "start-start").elements.map((element) => element.type)).toEqual(["start", "rappel", "exit"]);
  });

  it("moves a middle obstacle down", () => {
    const document = insertElementBeforeExit(documentWithRappel(), "pool", deterministicIds("pool"));
    expect(moveRouteElement(document, "rappel-rappel", 1).elements.map((element) => element.type)).toEqual(["start", "pool", "rappel", "exit"]);
  });

  it("does not move obstacles before the start endpoint", () => {
    const document = insertElementBeforeExit(documentWithRappel(), "pool", deterministicIds("pool"));
    expect(moveRouteElement(document, "rappel-rappel", -1)).toEqual(document);
  });

  it("does not move obstacles after the exit endpoint", () => {
    const document = insertElementBeforeExit(documentWithRappel(), "pool", deterministicIds("pool"));
    expect(moveRouteElement(document, "pool-pool", 1)).toEqual(document);
  });

  it("does not move the start endpoint", () => {
    expect(moveRouteElement(documentWithRappel(), "start-start", 1)).toEqual(documentWithRappel());
  });

  it("does not move the exit endpoint", () => {
    expect(moveRouteElement(documentWithRappel(), "exit-exit", -1)).toEqual(documentWithRappel());
  });

  it("does not move an unknown element", () => {
    expect(moveRouteElement(documentWithRappel(), "missing", 1)).toEqual(documentWithRappel());
  });

  it("returns the selected element", () => {
    expect(selectedElement(documentWithRappel(), "rappel-rappel")?.type).toBe("rappel");
  });

  it("returns null when no element is selected", () => {
    expect(selectedElement(documentWithRappel(), null)).toBeNull();
  });

  it("generates empty VRL ids for endpoints", () => {
    expect(generatedVrlId("start", 1)).toBe("");
  });

  it("generates sequence VRL ids for obstacles", () => {
    expect(generatedVrlId("downclimb", 3)).toBe("D3");
  });

  it("identifies fixed endpoints", () => {
    expect(isFixedEndpoint(createRouteElement("exit", deterministicIds("exit")))).toBe(true);
  });
});
