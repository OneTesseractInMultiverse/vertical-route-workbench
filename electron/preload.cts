import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("vrlEditor", {
  openRouteFile: () => ipcRenderer.invoke("vrl:open"),
  saveRouteFile: (payload: FileSavePayload) => ipcRenderer.invoke("vrl:save", payload),
  saveRouteFileAs: (payload: FileSavePayload) => ipcRenderer.invoke("vrl:save-as", payload)
});

type FileSavePayload = {
  filePath?: null | string;
  source: string;
};
