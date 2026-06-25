import { describe, expect, it } from "vitest";
import {
  allObstacleDefinitions,
  defaultAttributesFor,
  draggableObstacleDefinitions,
  elementPrefix,
  obstacleDefinition
} from "../../src/domain/obstacleCatalog";

describe("obstacle catalog", () => {
  it("lists every VRL grammar element", () => {
    expect(allObstacleDefinitions().map((definition) => definition.type)).toEqual([
      "start",
      "walk",
      "rappel",
      "downclimb",
      "climb",
      "pool",
      "hazard",
      "note",
      "exit"
    ]);
  });

  it("exposes only insertable route obstacles for dragging", () => {
    expect(draggableObstacleDefinitions().map((definition) => definition.type)).toEqual([
      "walk",
      "rappel",
      "downclimb",
      "climb",
      "pool",
      "hazard",
      "note"
    ]);
  });

  it("returns the standardized rappel prefix", () => {
    expect(elementPrefix("rappel")).toBe("R");
  });

  it("returns the rappel field schema", () => {
    expect(obstacleDefinition("rappel").fields.map((field) => [field.name, field.kind, field.defaultValue, field.required])).toEqual([
      ["height", "measurement", "20m", true],
      ["rope", "measurement", "40m", true],
      ["anchor", "select", "bolts", false],
      ["anchor_count", "number", "2", false],
      ["station", "select", "center", false],
      ["landing", "select", "pool", false],
      ["inclination", "percentage", "100%", false],
      ["shape", "select", "ladder", false],
      ["stages", "text", "", false],
      ["redirections", "text", "", false],
      ["flow", "select", "low", false]
    ]);
  });

  it("creates default field values for a rappel", () => {
    expect(defaultAttributesFor("rappel")).toEqual({
      anchor: "bolts",
      anchor_count: "2",
      flow: "low",
      height: "20m",
      inclination: "100%",
      landing: "pool",
      redirections: "",
      rope: "40m",
      shape: "ladder",
      stages: "",
      station: "center"
    });
  });
});
