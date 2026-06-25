import { compileRoute, type VrlCompileResult } from "@subvertic/vrl-core";
import { renderTopoSvg } from "@subvertic/vrl-render-svg";
import type { RouteDocument } from "../domain/routeTypes";
import type { PreviewRenderer, PreviewResult } from "../ports/previewRenderer";
import { hasBlockingDiagnostic, toPreviewDiagnostic } from "./vrlDiagnosticAdapter";

const layoutOptions = {
  horizontalScale: 1.18,
  marginY: 96,
  minNodeGap: 58,
  pixelsPerMeter: 3.2,
  spineX: 108,
  width: 760
};

const defaultDependencies: VrlPreviewDependencies = {
  compile: compileRoute,
  renderSvg: renderTopoSvg
};

export function createVrlPreviewRenderer(dependencies: VrlPreviewDependencies = defaultDependencies): PreviewRenderer {
  return {
    render: (source, document) => renderPreview(source, document, dependencies)
  };
}

export function renderPreview(
  source: string,
  document: RouteDocument,
  dependencies: VrlPreviewDependencies = defaultDependencies
): PreviewResult {
  const compiled = dependencies.compile(source, { layout: layoutOptions });
  const diagnostics = compiled.diagnostics.map(toPreviewDiagnostic);
  const canSave = compiled.ok && hasBlockingDiagnostic(diagnostics) === false;

  return {
    canSave,
    diagnostics,
    ok: compiled.ok,
    svg: compiled.ok ? renderCompiledSvg(compiled.model, compiled.layout, document, dependencies) : ""
  };
}

function renderCompiledSvg(
  model: unknown,
  layout: unknown,
  document: RouteDocument,
  dependencies: VrlPreviewDependencies
): string {
  return dependencies.renderSvg(model, layout, {
    language: document.metadata.language,
    symbology: document.metadata.symbology
  });
}

export type VrlPreviewDependencies = {
  compile: (source: string, options?: unknown) => VrlCompileResult;
  renderSvg: (route: unknown, layout: unknown, options?: unknown) => string;
};
