import type { FileGateway, FileOpenResult, FileSavePayload, FileSaveResult } from "../ports/fileGateway";

export function createElectronFileGateway(): FileGateway {
  return window.vrlEditor === undefined ? createDownloadGateway() : window.vrlEditor;
}

function createDownloadGateway(): FileGateway {
  return {
    openRouteFile: async () => ({ canceled: true }),
    saveRouteFile: saveByDownload,
    saveRouteFileAs: saveByDownload
  };
}

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

declare global {
  interface Window {
    vrlEditor?: {
      openRouteFile: () => Promise<FileOpenResult>;
      saveRouteFile: (payload: FileSavePayload) => Promise<FileSaveResult>;
      saveRouteFileAs: (payload: FileSavePayload) => Promise<FileSaveResult>;
    };
  }
}
