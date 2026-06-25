import { describe, expect, it } from "vitest";
import { createInitialRouteDocument, createRouteElement } from "../../src/domain/routeDocument";
import {
  quoteAttributeValue,
  quoteValue,
  serializeAttribute,
  serializeAttributeRecord,
  serializeElement,
  serializeElements,
  serializeMetadata,
  serializeRouteDocument
} from "../../src/domain/vrlSerializer";
import type { RouteMetadata } from "../../src/domain/routeTypes";
import { deterministicIds, documentWithRappel } from "../helpers/fixtures";

describe("VRL serializer", () => {
  it("quotes route values", () => {
    expect(quoteValue("Quebrada Gata")).toBe('"Quebrada Gata"');
  });

  it("escapes quotes and backslashes", () => {
    expect(quoteValue('A "quoted" \\ value')).toBe('"A \\"quoted\\" \\\\ value"');
  });

  it("leaves compact attribute values unquoted", () => {
    expect(quoteAttributeValue("35m")).toBe("35m");
  });

  it("quotes attribute values that contain spaces", () => {
    expect(quoteAttributeValue("Costa Rica")).toBe('"Costa Rica"');
  });

  it("quotes attribute values that contain comments", () => {
    expect(quoteAttributeValue("tag#1")).toBe('"tag#1"');
  });

  it("omits empty attributes", () => {
    expect(serializeAttribute("note", "")).toBe("");
  });

  it("serializes non-empty attributes", () => {
    expect(serializeAttribute("height", "35m")).toBe("height=35m");
  });

  it("serializes attribute records without empty values", () => {
    expect(serializeAttributeRecord({ height: "35m", note: "" })).toBe("height=35m");
  });

  it("omits metadata when publishable fields are empty", () => {
    expect(serializeMetadata(emptyMetadata())).toBe("");
  });

  it("serializes route metadata", () => {
    expect(serializeMetadata(createInitialRouteDocument().metadata)).toContain('country="Costa Rica"');
  });

  it("serializes note elements through note syntax", () => {
    expect(serializeElement(createRouteElement("note", deterministicIds("note")), "N1")).toBe('note "Route note"');
  });

  it("serializes note elements with missing text as an empty quoted string", () => {
    expect(serializeElement({ ...createRouteElement("note"), attributes: {} }, "N1")).toBe('note ""');
  });

  it("serializes endpoint labels", () => {
    expect(serializeElement(createRouteElement("start", deterministicIds("start")), "")).toBe('start "Entrance"');
  });

  it("serializes obstacle ids and attributes", () => {
    expect(serializeElement(createRouteElement("rappel", deterministicIds("rappel")), "R1")).toContain("rappel R1 height=20m");
  });

  it("uses preserved VRL ids when serializing imported elements", () => {
    const element = { ...createRouteElement("rappel", deterministicIds("rappel")), vrlId: "R9" };
    expect(serializeElements([element])).toEqual(["  rappel R9 height=20m rope=40m anchor=bolts anchor_count=2 station=center landing=pool inclination=100% shape=ladder flow=low"]);
  });

  it("generates VRL ids when elements do not have imported ids", () => {
    expect(serializeElements([createRouteElement("pool", deterministicIds("pool"))])).toEqual(["  pool P1 type=deep flow=low"]);
  });

  it("serializes a full document", () => {
    expect(serializeRouteDocument(documentWithRappel())).toContain("rappel R1 height=20m rope=40m");
  });
});

function emptyMetadata(): RouteMetadata {
  return {
    country: "",
    difficulty: "",
    entrance_elevation: "",
    exit_elevation: "",
    language: "en",
    region: "",
    symbology: "federation"
  };
}
