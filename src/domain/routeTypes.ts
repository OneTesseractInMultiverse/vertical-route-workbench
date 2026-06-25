/** VRL element kinds supported by the editor and serializer. */
export type ElementType =
  | "start"
  | "walk"
  | "rappel"
  | "downclimb"
  | "climb"
  | "pool"
  | "hazard"
  | "note"
  | "exit";

/** Input control families used by the inspector to edit field values. */
export type FieldKind = "measurement" | "multiline" | "number" | "percentage" | "select" | "text";

/** Schema entry describing one editable attribute for an obstacle type. */
export type FieldDefinition = {
  defaultValue: string;
  kind: FieldKind;
  label: string;
  name: string;
  options?: readonly string[];
  required: boolean;
};

/** Catalog metadata for one route element or obstacle kind. */
export type ObstacleDefinition = {
  color: string;
  defaultLabel: string;
  description: string;
  fields: readonly FieldDefinition[];
  symbol: string;
  title: string;
  type: ElementType;
};

/** Editable route element kept in the workbench document model. */
export type RouteElement = {
  attributes: Record<string, string>;
  editorId: string;
  label: string;
  type: ElementType;
  vrlId: string;
};

/** Route-level metadata fields serialized into the VRL metadata statement. */
export type RouteMetadata = {
  country: string;
  difficulty: string;
  entrance_elevation: string;
  exit_elevation: string;
  language: "en" | "es";
  region: string;
  symbology: "federation" | "french" | "spanish";
};

/** Complete editable document state used by the React workbench. */
export type RouteDocument = {
  elements: RouteElement[];
  metadata: RouteMetadata;
  routeName: string;
};

/** Testable factory used to create deterministic editor IDs. */
export type IdFactory = () => string;
