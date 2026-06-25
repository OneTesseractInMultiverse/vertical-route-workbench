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

export type FieldKind = "measurement" | "multiline" | "number" | "percentage" | "select" | "text";

export type FieldDefinition = {
  defaultValue: string;
  kind: FieldKind;
  label: string;
  name: string;
  options?: readonly string[];
  required: boolean;
};

export type ObstacleDefinition = {
  color: string;
  defaultLabel: string;
  description: string;
  fields: readonly FieldDefinition[];
  symbol: string;
  title: string;
  type: ElementType;
};

export type RouteElement = {
  attributes: Record<string, string>;
  editorId: string;
  label: string;
  type: ElementType;
  vrlId: string;
};

export type RouteMetadata = {
  country: string;
  difficulty: string;
  entrance_elevation: string;
  exit_elevation: string;
  language: "en" | "es";
  region: string;
  symbology: "federation" | "french" | "spanish";
};

export type RouteDocument = {
  elements: RouteElement[];
  metadata: RouteMetadata;
  routeName: string;
};

export type IdFactory = () => string;
