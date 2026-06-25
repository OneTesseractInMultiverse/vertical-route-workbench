import type { ElementType, FieldDefinition, ObstacleDefinition } from "./routeTypes";

const anchorOptions = ["bolts", "natural", "tree", "thread", "removable", "fixed", "unknown", "mixed"] as const;
const exposureOptions = ["low", "medium", "high"] as const;
const flowOptions = ["dry", "low", "medium", "high"] as const;
const landingOptions = ["pool", "ledge", "dry", "chaos", "gallery", "trail", "unknown"] as const;
const poolOptions = ["deep", "shallow", "swimmer", "dry", "unknown"] as const;
const severityOptions = ["low", "medium", "high", "critical"] as const;
const shapeOptions = ["ladder", "direct", "slab"] as const;
const stationOptions = ["left", "right", "center", "floor", "tree", "natural", "unknown"] as const;

const obstacleDefinitions = {
  start: definition("start", "IN", "Start", "Route entrance", "#24a148", "Entrance", []),
  walk: definition("walk", "M", "Walk", "Approach or transition", "#8a3ffc", "Walk", [
    field("distance", "Distance", "measurement", "120m", true),
    field("note", "Note", "text", "", false)
  ]),
  rappel: definition("rappel", "R", "Rappel", "Roped descent", "#da1e28", "Rappel", [
    field("height", "Height", "measurement", "20m", true),
    field("rope", "Rope", "measurement", "40m", true),
    field("anchor", "Anchor", "select", "bolts", false, anchorOptions),
    field("anchor_count", "Anchors", "number", "2", false),
    field("station", "Station", "select", "center", false, stationOptions),
    field("landing", "Landing", "select", "pool", false, landingOptions),
    field("inclination", "Inclination", "percentage", "100%", false),
    field("shape", "Shape", "select", "ladder", false, shapeOptions),
    field("stages", "Stages", "text", "", false),
    field("redirections", "Redirections", "text", "", false),
    field("flow", "Flow", "select", "low", false, flowOptions)
  ]),
  downclimb: definition("downclimb", "D", "Downclimb", "Unroped descent", "#fa4d56", "Downclimb", [
    field("height", "Height", "measurement", "4m", true),
    field("exposure", "Exposure", "select", "medium", false, exposureOptions),
    field("landing", "Landing", "select", "ledge", false, landingOptions),
    field("inclination", "Inclination", "percentage", "65%", false),
    field("shape", "Shape", "select", "ladder", false, shapeOptions),
    field("flow", "Flow", "select", "low", false, flowOptions)
  ]),
  climb: definition("climb", "C", "Climb", "Upward obstacle", "#0f62fe", "Climb", [
    field("height", "Height", "measurement", "3m", true),
    field("exposure", "Exposure", "select", "low", false, exposureOptions),
    field("landing", "Landing", "select", "ledge", false, landingOptions),
    field("inclination", "Inclination", "percentage", "75%", false),
    field("shape", "Shape", "select", "direct", false, shapeOptions)
  ]),
  pool: definition("pool", "V", "Pool", "Water feature", "#0072c3", "Pool", [
    field("type", "Type", "select", "deep", false, poolOptions),
    field("flow", "Flow", "select", "low", false, flowOptions)
  ]),
  hazard: definition("hazard", "!", "Hazard", "Route warning", "#f1c21b", "Hazard", [
    field("type", "Type", "text", "snake", false),
    field("severity", "Severity", "select", "medium", false, severityOptions),
    field("note", "Note", "text", "Check conditions", false)
  ]),
  note: definition("note", "N", "Note", "Route annotation", "#525252", "Note", [
    field("text", "Text", "multiline", "Route note", true)
  ]),
  exit: definition("exit", "OUT", "Exit", "Route exit", "#198038", "Exit", [])
} satisfies Record<ElementType, ObstacleDefinition>;

/** Returns every grammar element the editor knows how to display or serialize. */
export function allObstacleDefinitions(): ObstacleDefinition[] {
  return Object.values(obstacleDefinitions);
}

/** Returns only the obstacle types that users can insert between start and exit. */
export function draggableObstacleDefinitions(): ObstacleDefinition[] {
  return allObstacleDefinitions().filter((definitionItem) => definitionItem.type !== "start" && definitionItem.type !== "exit");
}

/** Maps an element type to the standard compact VRL/topo prefix used for generated IDs. */
export function elementPrefix(type: ElementType): string {
  const prefixes = {
    climb: "C",
    downclimb: "D",
    exit: "OUT",
    hazard: "H",
    note: "N",
    pool: "P",
    rappel: "R",
    start: "IN",
    walk: "W"
  } satisfies Record<ElementType, string>;

  return prefixes[type];
}

/** Looks up the full catalog definition for a route element type. */
export function obstacleDefinition(type: ElementType): ObstacleDefinition {
  return obstacleDefinitions[type];
}

/** Creates a fresh attribute record populated with the catalog defaults for the element type. */
export function defaultAttributesFor(type: ElementType): Record<string, string> {
  return Object.fromEntries(obstacleDefinition(type).fields.map((fieldDefinition) => [fieldDefinition.name, fieldDefinition.defaultValue]));
}

/** Builds immutable catalog entries with the shared field shape used by UI and domain code. */
function definition(
  type: ElementType,
  symbol: string,
  title: string,
  description: string,
  color: string,
  defaultLabel: string,
  fields: readonly FieldDefinition[]
): ObstacleDefinition {
  return {
    color,
    defaultLabel,
    description,
    fields,
    symbol,
    title,
    type
  };
}

/** Builds one editable field declaration for an obstacle definition. */
function field(
  name: string,
  label: string,
  kind: FieldDefinition["kind"],
  defaultValue: string,
  required: boolean,
  options?: readonly string[]
): FieldDefinition {
  return {
    defaultValue,
    kind,
    label,
    name,
    options,
    required
  };
}
