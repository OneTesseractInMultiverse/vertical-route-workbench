import type { FileGateway, FileOpenResult, FileSavePayload, FileSaveResult, PngSavePayload } from "../ports/fileGateway";

/** Selects the Electron IPC gateway when available and falls back to browser downloads in web previews. */
export function createElectronFileGateway(): FileGateway {
  return window.vrlEditor === undefined ? createDownloadGateway() : window.vrlEditor;
}

/** Creates a browser-only gateway for development contexts without the Electron preload bridge. */
function createDownloadGateway(): FileGateway {
  return {
    openRouteFile: async () => ({ canceled: true }),
    savePngFile: savePngByDownload,
    saveRouteFile: saveByDownload,
    saveRouteFileAs: saveByDownload
  };
}

/** Saves VRL source by triggering a browser text-file download. */
async function saveByDownload(payload: FileSavePayload): Promise<FileSaveResult> {
  const targetPath = payload.filePath ?? "route.vrl";
  const anchor = document.createElement("a");
  const blob = new Blob([payload.source], { type: "text/plain" });

  anchor.href = URL.createObjectURL(blob);
  anchor.download = targetPath.split("/").at(-1) ?? "route.vrl";
  anchor.click();
  URL.revokeObjectURL(anchor.href);

  return {
    canceled: false,
    filePath: targetPath
  };
}

/** Saves PNG bytes by triggering a browser image-file download. */
async function savePngByDownload(payload: PngSavePayload): Promise<FileSaveResult> {
  const anchor = document.createElement("a");
  const blob = new Blob([arrayBufferFromBytes(payload.data)], { type: "image/png" });

  anchor.href = URL.createObjectURL(blob);
  anchor.download = payload.defaultPath.split("/").at(-1) ?? "route.png";
  anchor.click();
  URL.revokeObjectURL(anchor.href);

  return {
    canceled: false,
    filePath: payload.defaultPath
  };
}

/** Copies bytes into a plain ArrayBuffer accepted by the DOM Blob constructor. */
function arrayBufferFromBytes(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);

  new Uint8Array(buffer).set(bytes);

  return buffer;
}

declare global {
  interface Window {
    vrlEditor?: {
      openRouteFile: () => Promise<FileOpenResult>;
      savePngFile: (payload: PngSavePayload) => Promise<FileSaveResult>;
      saveRouteFile: (payload: FileSavePayload) => Promise<FileSaveResult>;
      saveRouteFileAs: (payload: FileSavePayload) => Promise<FileSaveResult>;
    };
  }
}
