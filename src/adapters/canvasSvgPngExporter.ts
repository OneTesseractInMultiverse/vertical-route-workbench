import type { PngExporter, PngExportPayload, PngExportResult } from "../ports/pngExporter";

type SvgDimensions = {
  height: number;
  width: number;
};

const fallbackDimensions: SvgDimensions = {
  height: 1000,
  width: 1600
};

/** Creates the browser-backed PNG exporter that rasterizes inline SVG through a canvas. */
export function createCanvasSvgPngExporter(): PngExporter {
  return {
    exportSvg: exportSvgToPng
  };
}

/** Converts SVG markup into PNG bytes at the requested scale. */
async function exportSvgToPng(payload: PngExportPayload): Promise<PngExportResult> {
  try {
    const dimensions = svgDimensions(payload.svg);
    const image = await loadSvgImage(payload.svg);
    const canvas = rasterCanvas(dimensions, payload.scale);
    const context = canvas.getContext("2d");

    if (context === null) {
      return { ok: false, reason: "Canvas context is unavailable" };
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await canvasPngBlob(canvas);

    if (blob === null) {
      return { ok: false, reason: "PNG encoding failed" };
    }

    return { data: new Uint8Array(await blob.arrayBuffer()), ok: true };
  } catch (error) {
    return { ok: false, reason: errorMessage(error) };
  }
}

/** Reads SVG dimensions from `viewBox`, explicit attributes, or a stable fallback. */
function svgDimensions(svg: string): SvgDimensions {
  const document = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = document.documentElement;

  if (root.nodeName.toLowerCase() !== "svg") {
    throw new Error("Expected an SVG document");
  }

  return viewBoxDimensions(root.getAttribute("viewBox")) ?? attributeDimensions(root) ?? fallbackDimensions;
}

/** Extracts width and height from an SVG `viewBox` attribute. */
function viewBoxDimensions(viewBox: null | string): null | SvgDimensions {
  if (viewBox === null) {
    return null;
  }

  const values = viewBox
    .trim()
    .split(/[\s,]+/)
    .map((value) => Number.parseFloat(value));

  if (values.length !== 4) {
    return null;
  }

  return dimensionsFromNumbers(values[2], values[3]);
}

/** Extracts width and height from SVG element attributes. */
function attributeDimensions(root: Element): null | SvgDimensions {
  return dimensionsFromNumbers(
    numericAttribute(root.getAttribute("width")),
    numericAttribute(root.getAttribute("height"))
  );
}

/** Validates parsed dimensions before they are used to allocate a canvas. */
function dimensionsFromNumbers(width: number | undefined, height: number | undefined): null | SvgDimensions {
  if (
    width === undefined ||
    height === undefined ||
    Number.isFinite(width) === false ||
    Number.isFinite(height) === false ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }

  return { height, width };
}

/** Parses numeric SVG attributes while tolerating units such as `px`. */
function numericAttribute(value: null | string): number | undefined {
  if (value === null) {
    return undefined;
  }

  const number = Number.parseFloat(value);

  return Number.isFinite(number) ? number : undefined;
}

/** Creates a canvas sized to the SVG dimensions multiplied by the export scale. */
function rasterCanvas(dimensions: SvgDimensions, scale: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const rasterScale = positiveScale(scale);

  canvas.width = Math.max(1, Math.round(dimensions.width * rasterScale));
  canvas.height = Math.max(1, Math.round(dimensions.height * rasterScale));

  return canvas;
}

/** Ensures invalid scale inputs fall back to a 1x raster. */
function positiveScale(scale: number): number {
  return Number.isFinite(scale) && scale > 0 ? scale : 1;
}

/** Loads SVG text into an image element so it can be drawn onto a canvas. */
function loadSvgImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to load SVG image"));
    };

    image.src = url;
  });
}

/** Encodes a canvas as a PNG blob. */
function canvasPngBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
}

/** Converts unknown thrown values into a readable export failure reason. */
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to export PNG";
}
