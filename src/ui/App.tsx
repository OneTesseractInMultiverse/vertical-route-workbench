import { useMemo, useState } from "react";
import {
  addObstacle,
  deleteObstacle,
  editElementAttribute,
  editElementLabel,
  editRouteMetadata,
  editRouteName,
  exportPreviewPng,
  loadRouteSource,
  moveObstacle,
  saveRouteSource,
  saveRouteSourceAs
} from "../application/editorUseCases";
import { createCanvasSvgPngExporter } from "../adapters/canvasSvgPngExporter";
import { createElectronFileGateway } from "../adapters/electronFileGateway";
import { createVrlPreviewRenderer } from "../adapters/vrlPreviewRenderer";
import { createVrlRouteLoader } from "../adapters/vrlRouteLoader";
import { createInitialRouteDocument, selectedElement } from "../domain/routeDocument";
import type { ElementType, RouteMetadata } from "../domain/routeTypes";
import { serializeRouteDocument } from "../domain/vrlSerializer";
import { MetadataEditor } from "./MetadataEditor";
import { ObstacleBox } from "./ObstacleBox";
import { PreviewPanel } from "./PreviewPanel";
import { PropertiesInspector } from "./PropertiesInspector";
import { RouteCanvas } from "./RouteCanvas";

const brandLogoSource = `${import.meta.env.BASE_URL}brand/logo-vrw-navbar.png`;
const appVersionLabel = `v${__APP_VERSION__}`;

/** Coordinates editor state, application use cases, file gateways, and the three-panel UI layout. */
export function App() {
  const fileGateway = useMemo(createElectronFileGateway, []);
  const pngExporter = useMemo(createCanvasSvgPngExporter, []);
  const previewRenderer = useMemo(createVrlPreviewRenderer, []);
  const routeLoader = useMemo(createVrlRouteLoader, []);
  const [document, setDocument] = useState(() => createInitialRouteDocument());
  const [filePath, setFilePath] = useState<null | string>(null);
  const [selectedId, setSelectedId] = useState<null | string>(document.elements[0]?.editorId ?? null);
  const [status, setStatus] = useState("Ready");
  const source = useMemo(() => serializeRouteDocument(document), [document]);
  const preview = useMemo(() => previewRenderer.render(source, document), [document, previewRenderer, source]);
  const selectedRouteElement = selectedElement(document, selectedId);

  /** Inserts a catalog obstacle into the current route document. */
  function handleAddObstacle(type: ElementType): void {
    setDocument((currentDocument) => addObstacle(currentDocument, type));
  }

  /** Applies route name edits from the metadata panel. */
  function handleRouteNameChange(routeName: string): void {
    setDocument((currentDocument) => editRouteName(currentDocument, routeName));
  }

  /** Applies route metadata edits and relies on the domain layer for normalization. */
  function handleMetadataChange(fieldName: keyof RouteMetadata, value: string): void {
    setDocument((currentDocument) => editRouteMetadata(currentDocument, fieldName, value));
  }

  /** Applies label edits from the properties inspector. */
  function handleLabelChange(editorId: string, label: string): void {
    setDocument((currentDocument) => editElementLabel(currentDocument, editorId, label));
  }

  /** Applies attribute edits from the properties inspector. */
  function handleAttributeChange(editorId: string, fieldName: string, value: string): void {
    setDocument((currentDocument) => editElementAttribute(currentDocument, editorId, fieldName, value));
  }

  /** Deletes a selected obstacle and clears selection after the document changes. */
  function handleDelete(editorId: string): void {
    setDocument((currentDocument) => deleteObstacle(currentDocument, editorId));
    setSelectedId(null);
  }

  /** Moves a selected obstacle up or down in the route sequence. */
  function handleMove(editorId: string, direction: -1 | 1): void {
    setDocument((currentDocument) => moveObstacle(currentDocument, editorId, direction));
  }

  /** Opens a `.vrl` file, loads it through the route loader, and replaces editor state on success. */
  async function handleOpen(): Promise<void> {
    const opened = await fileGateway.openRouteFile();

    if (opened.canceled) {
      setStatus("Open canceled");
      return;
    }

    const loaded = loadRouteSource(routeLoader, opened.source);

    if (loaded.ok === false) {
      setStatus(loaded.diagnostics[0]?.message ?? "Invalid VRL file");
      return;
    }

    setDocument(loaded.document);
    setFilePath(opened.filePath);
    setSelectedId(loaded.document.elements[0]?.editorId ?? null);
    setStatus(`Opened ${opened.filePath}`);
  }

  /** Saves the current route to the known file path or prompts for one when needed. */
  async function handleSave(): Promise<void> {
    const saved = await saveRouteSource(fileGateway, document, filePath, preview);

    if (saved.canceled) {
      setStatus(preview.canSave ? "Save canceled" : "Resolve VRL errors before saving");
      return;
    }

    setFilePath(saved.filePath);
    setStatus(`Saved ${saved.filePath}`);
  }

  /** Saves the current route through an explicit save-as flow. */
  async function handleSaveAs(): Promise<void> {
    const saved = await saveRouteSourceAs(fileGateway, document, preview);

    if (saved.canceled) {
      setStatus(preview.canSave ? "Save canceled" : "Resolve VRL errors before saving");
      return;
    }

    setFilePath(saved.filePath);
    setStatus(`Saved ${saved.filePath}`);
  }

  /** Exports the current preview SVG as a high-resolution PNG file. */
  async function handleExportPng(): Promise<void> {
    setStatus("Exporting PNG...");

    const exported = await exportPreviewPng(fileGateway, pngExporter, document.routeName, preview);

    if (exported.ok) {
      setStatus(`Exported ${exported.filePath}`);
      return;
    }

    setStatus(exportPngStatus(exported.reason));
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand-lockup">
          <img className="brand-logo" src={brandLogoSource} alt="Vertical Route Workbench" />
          <span className="version-tag" title={`Version ${__APP_VERSION__}`}>{appVersionLabel}</span>
          <h1 className="visually-hidden">Vertical Route Workbench</h1>
        </div>
        <div className="toolbar-actions">
          <span className="status-line">{status}</span>
          <button type="button" onClick={handleOpen}>Open</button>
          <button type="button" disabled={preview.canSave === false} onClick={handleSave}>Save</button>
          <button type="button" disabled={preview.canSave === false} onClick={handleSaveAs}>Save As</button>
          <button type="button" disabled={preview.canSave === false || preview.svg === ""} onClick={handleExportPng}>Export PNG</button>
        </div>
      </header>
      <main className="workspace-grid">
        <ObstacleBox onAddObstacle={handleAddObstacle} />
        <section className="work-area">
          <MetadataEditor
            document={document}
            onMetadataChange={handleMetadataChange}
            onRouteNameChange={handleRouteNameChange}
          />
          <RouteCanvas
            elements={document.elements}
            selectedId={selectedId}
            onAddObstacle={handleAddObstacle}
            onSelect={setSelectedId}
          />
          <PropertiesInspector
            element={selectedRouteElement}
            onAttributeChange={handleAttributeChange}
            onDelete={handleDelete}
            onLabelChange={handleLabelChange}
            onMove={handleMove}
          />
        </section>
        <PreviewPanel diagnostics={preview.diagnostics} source={source} svg={preview.svg} />
      </main>
      <footer className="app-footer">
        <span>Copyright (c) 2026 Sociedad Técnica de Exploración Vertical</span>
        <span className="footer-origin">
          <span className="costa-rica-flag" aria-label="Costa Rican flag" role="img">
            <span className="flag-stripe is-blue" />
            <span className="flag-stripe is-white" />
            <span className="flag-stripe is-red" />
            <span className="flag-stripe is-white" />
            <span className="flag-stripe is-blue" />
          </span>
          <span>Proudly developed in Costa Rica</span>
        </span>
        <span>Engineered by Pedro Guzmán (pedro@subvertic.com)</span>
      </footer>
    </div>
  );
}

/** Maps application-level PNG export failures into short status-bar messages. */
function exportPngStatus(reason: "blocked" | "canceled" | "render-failed"): string {
  switch (reason) {
    case "blocked":
      return "Resolve VRL errors before exporting";
    case "canceled":
      return "Export canceled";
    case "render-failed":
      return "Unable to export PNG";
  }
}
