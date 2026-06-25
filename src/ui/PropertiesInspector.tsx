import { obstacleDefinition } from "../domain/obstacleCatalog";
import { isFixedEndpoint } from "../domain/routeDocument";
import type { FieldDefinition, RouteElement } from "../domain/routeTypes";

type PropertiesInspectorProps = {
  element: null | RouteElement;
  onAttributeChange: (editorId: string, fieldName: string, value: string) => void;
  onDelete: (editorId: string) => void;
  onLabelChange: (editorId: string, label: string) => void;
  onMove: (editorId: string, direction: -1 | 1) => void;
};

/** Renders editable fields for the selected route element and exposes move/delete commands. */
export function PropertiesInspector({
  element,
  onAttributeChange,
  onDelete,
  onLabelChange,
  onMove
}: PropertiesInspectorProps) {
  if (element === null) {
    return (
      <section className="glass-panel inspector-panel" aria-label="Properties">
        <div className="panel-title">
          <p className="eyebrow">Inspector</p>
          <h2>No selection</h2>
        </div>
      </section>
    );
  }

  const definition = obstacleDefinition(element.type);

  return (
    <section className="glass-panel inspector-panel" aria-label="Properties">
      <div className="panel-title">
        <p className="eyebrow">Inspector</p>
        <h2>{definition.title}</h2>
      </div>
      <div className="inspector-grid">
        <label>
          Label
          <input value={element.label} onChange={(event) => onLabelChange(element.editorId, event.currentTarget.value)} />
        </label>
        {definition.fields.map((fieldDefinition) => (
          <FieldControl
            fieldDefinition={fieldDefinition}
            key={fieldDefinition.name}
            value={element.attributes[fieldDefinition.name] ?? ""}
            onChange={(value) => onAttributeChange(element.editorId, fieldDefinition.name, value)}
          />
        ))}
      </div>
      <div className="inspector-actions">
        <button type="button" onClick={() => onMove(element.editorId, -1)}>Move Up</button>
        <button type="button" onClick={() => onMove(element.editorId, 1)}>Move Down</button>
        <button type="button" disabled={isFixedEndpoint(element)} onClick={() => onDelete(element.editorId)}>Delete</button>
      </div>
    </section>
  );
}

/** Renders the correct form control for one catalog field definition. */
function FieldControl({
  fieldDefinition,
  onChange,
  value
}: {
  fieldDefinition: FieldDefinition;
  onChange: (value: string) => void;
  value: string;
}) {
  if (fieldDefinition.kind === "select") {
    return (
      <label>
        {fieldDefinition.label}
        <select value={value} onChange={(event) => onChange(event.currentTarget.value)}>
          {(fieldDefinition.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
    );
  }

  if (fieldDefinition.kind === "multiline") {
    return (
      <label>
        {fieldDefinition.label}
        <textarea value={value} onChange={(event) => onChange(event.currentTarget.value)} />
      </label>
    );
  }

  return (
    <label>
      {fieldDefinition.label}
      <input inputMode={inputModeFor(fieldDefinition)} value={value} onChange={(event) => onChange(event.currentTarget.value)} />
    </label>
  );
}

/** Chooses mobile/desktop keyboard hints for numeric inspector fields. */
function inputModeFor(fieldDefinition: FieldDefinition): React.HTMLAttributes<HTMLInputElement>["inputMode"] {
  return fieldDefinition.kind === "number" ? "numeric" : "text";
}
