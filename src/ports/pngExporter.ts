/**
 * Browser-side rasterization port for exporting rendered SVG previews.
 *
 * The application layer depends on this contract instead of direct canvas APIs.
 */
export type PngExportPayload = {
  scale: number;
  svg: string;
};

/** Success or failure result from converting SVG text into PNG bytes. */
export type PngExportResult =
  | { data: Uint8Array; ok: true }
  | { ok: false; reason: string };

/** Converts inline SVG markup into PNG binary data. */
export type PngExporter = {
  exportSvg: (payload: PngExportPayload) => Promise<PngExportResult>;
};
