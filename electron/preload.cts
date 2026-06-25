import { contextBridge, ipcRenderer } from "electron";

/**
 * Exposes the narrow file gateway used by the renderer while preserving
 * Electron context isolation.
 */
contextBridge.exposeInMainWorld("vrlEditor", {
  openRouteFile: () => ipcRenderer.invoke("vrl:open"),
  savePngFile: (payload: PngSavePayload) => ipcRenderer.invoke("vrl:save-png", payload),
  saveRouteFile: (payload: FileSavePayload) => ipcRenderer.invoke("vrl:save", payload),
  saveRouteFileAs: (payload: FileSavePayload) => ipcRenderer.invoke("vrl:save-as", payload)
});

/** Payload passed from the renderer when saving route source. */
type FileSavePayload = {
  filePath?: null | string;
  source: string;
};

/** Payload passed from the renderer when saving rasterized PNG bytes. */
type PngSavePayload = {
  data: Uint8Array;
  defaultPath: string;
};
