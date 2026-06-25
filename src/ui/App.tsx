import { useMemo, useState } from "react";
import {
  addObstacle,
  deleteObstacle,
  editElementAttribute,
  editElementLabel,
  editRouteMetadata,
  editRouteName,
  loadRouteSource,
  moveObstacle,
  saveRouteSource,
  saveRouteSourceAs
} from "../application/editorUseCases";
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

export function App() {
  const fileGateway = useMemo(createElectronFileGateway, []);
  const previewRenderer = useMemo(createVrlPreviewRenderer, []);
  const routeLoader = useMemo(createVrlRouteLoader, []);
  const [document, setDocument] = useState(() => createInitialRouteDocument());
  const [filePath, setFilePath] = useState<null | string>(null);
  const [selectedId, setSelectedId] = useState<null | string>(document.elements[0]?.editorId ?? null);
  const [status, setStatus] = useState("Ready");
  const source = useMemo(() => serializeRouteDocument(document), [document]);
  const preview = useMemo(() => previewRenderer.render(source, document), [document, previewRenderer, source]);
  const selectedRouteElement = selectedElement(document, selectedId);

  function handleAddObstacle(type: ElementType): void {
    setDocument((currentDocument) => addObstacle(currentDocument, type));
  }

  function handleRouteNameChange(routeName: string): void {
    setDocument((currentDocument) => editRouteName(currentDocument, routeName));
  }

  function handleMetadataChange(fieldName: keyof RouteMetadata, value: string): void {
    setDocument((currentDocument) => editRouteMetadata(currentDocument, fieldName, value));
  }

  function handleLabelChange(editorId: string, label: string): void {
    setDocument((currentDocument) => editElementLabel(currentDocument, editorId, label));
  }

  function handleAttributeChange(editorId: string, fieldName: string, value: string): void {
    setDocument((currentDocument) => editElementAttribute(currentDocument, editorId, fieldName, value));
  }

  function handleDelete(editorId: string): void {
    setDocument((currentDocument) => deleteObstacle(currentDocument, editorId));
    setSelectedId(null);
  }

  function handleMove(editorId: string, direction: -1 | 1): void {
    setDocument((currentDocument) => moveObstacle(currentDocument, editorId, direction));
  }

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

  async function handleSave(): Promise<void> {
    const saved = await saveRouteSource(fileGateway, document, filePath, preview);

    if (saved.canceled) {
      setStatus(preview.canSave ? "Save canceled" : "Resolve VRL errors before saving");
      return;
    }

    setFilePath(saved.filePath);
    setStatus(`Saved ${saved.filePath}`);
  }

  async function handleSaveAs(): Promise<void> {
    const saved = await saveRouteSourceAs(fileGateway, document, preview);

    if (saved.canceled) {
      setStatus(preview.canSave ? "Save canceled" : "Resolve VRL errors before saving");
      return;
    }

    setFilePath(saved.filePath);
    setStatus(`Saved ${saved.filePath}`);
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand-lockup">
          <img className="brand-logo" src={brandLogoSource} alt="Vertical Route Workbench" />
          <h1 className="visually-hidden">Vertical Route Workbench</h1>
        </div>
        <div className="toolbar-actions">
          <span className="status-line">{status}</span>
          <button type="button" onClick={handleOpen}>Open</button>
          <button type="button" disabled={preview.canSave === false} onClick={handleSave}>Save</button>
          <button type="button" disabled={preview.canSave === false} onClick={handleSaveAs}>Save As</button>
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
