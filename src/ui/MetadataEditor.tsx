import { countryOptions } from "../domain/countries";
import { elevationInputValue, maximumElevationMeters, minimumElevationMeters } from "../domain/elevation";
import type { RouteDocument, RouteMetadata } from "../domain/routeTypes";

type MetadataEditorProps = {
  document: RouteDocument;
  onMetadataChange: (fieldName: keyof RouteMetadata, value: string) => void;
  onRouteNameChange: (routeName: string) => void;
};

const languageOptions = [
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" }
] as const;

const symbologyOptions = [
  { label: "Federation", value: "federation" },
  { label: "French", value: "french" },
  { label: "Spanish", value: "spanish" }
] as const;

export function MetadataEditor({ document, onMetadataChange, onRouteNameChange }: MetadataEditorProps) {
  return (
    <section className="glass-panel metadata-panel" aria-label="Route metadata">
      <label>
        Route
        <input value={document.routeName} onChange={(event) => onRouteNameChange(event.currentTarget.value)} />
      </label>
      <label>
        Grade
        <input
          value={document.metadata.difficulty}
          onChange={(event) => onMetadataChange("difficulty", event.currentTarget.value)}
        />
      </label>
      <label>
        Entrance
        <input
          inputMode="numeric"
          max={maximumElevationMeters}
          min={minimumElevationMeters}
          step="1"
          type="number"
          value={elevationInputValue(document.metadata.entrance_elevation)}
          onChange={(event) => onMetadataChange("entrance_elevation", event.currentTarget.value)}
        />
      </label>
      <label>
        Exit
        <input
          inputMode="numeric"
          max={maximumElevationMeters}
          min={minimumElevationMeters}
          step="1"
          type="number"
          value={elevationInputValue(document.metadata.exit_elevation)}
          onChange={(event) => onMetadataChange("exit_elevation", event.currentTarget.value)}
        />
      </label>
      <label>
        Region
        <input
          value={document.metadata.region}
          onChange={(event) => onMetadataChange("region", event.currentTarget.value)}
        />
      </label>
      <label>
        Country
        <select
          value={document.metadata.country}
          onChange={(event) => onMetadataChange("country", event.currentTarget.value)}
        >
          {countryOptions.map((option) => <option key={option.code} value={option.name}>{option.name}</option>)}
        </select>
      </label>
      <label>
        Language
        <select
          value={document.metadata.language}
          onChange={(event) => onMetadataChange("language", event.currentTarget.value)}
        >
          {languageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <label>
        Symbols
        <select
          value={document.metadata.symbology}
          onChange={(event) => onMetadataChange("symbology", event.currentTarget.value)}
        >
          {symbologyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
    </section>
  );
}
