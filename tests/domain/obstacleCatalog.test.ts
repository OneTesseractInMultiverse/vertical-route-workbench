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
    expect(obstacleDefinition("rappel").fields.map((field) => field.name)).toContain("redirections");
  });

  it("creates default field values for a rappel", () => {
    expect(defaultAttributesFor("rappel")).toMatchObject({ height: "20m", rope: "40m" });
  });
});
