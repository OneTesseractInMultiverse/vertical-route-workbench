import type { PreviewDiagnostic } from "../ports/previewRenderer";

type PreviewPanelProps = {
  diagnostics: PreviewDiagnostic[];
  source: string;
  svg: string;
};

export function PreviewPanel({ diagnostics, source, svg }: PreviewPanelProps) {
  return (
    <aside className="glass-panel preview-panel" aria-label="Topo preview">
      <div className="panel-title">
        <p className="eyebrow">Preview</p>
        <h2>Topo SVG</h2>
      </div>
      <div className="preview-frame">
        {svg === "" ? <DiagnosticList diagnostics={diagnostics} /> : <div dangerouslySetInnerHTML={{ __html: svg }} />}
      </div>
      <div className="source-panel">
        <div className="panel-title compact">
          <p className="eyebrow">Generated</p>
          <h2>VRL</h2>
        </div>
        <pre>{source}</pre>
      </div>
      <DiagnosticList diagnostics={diagnostics} />
    </aside>
  );
}

function DiagnosticList({ diagnostics }: { diagnostics: PreviewDiagnostic[] }) {
  if (diagnostics.length === 0) {
    return <p className="diagnostic is-clean">No diagnostics</p>;
  }

  return (
    <ul className="diagnostic-list">
      {diagnostics.map((diagnostic) => (
        <li className={`diagnostic is-${diagnostic.severity}`} key={diagnostic.message}>{diagnostic.message}</li>
      ))}
    </ul>
  );
}
