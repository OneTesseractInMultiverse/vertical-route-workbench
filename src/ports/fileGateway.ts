/**
 * File I/O port for route source and exported images.
 *
 * Implementations can use Electron dialogs, browser downloads, or test doubles
 * without changing application use cases.
 */
export type FileOpenResult =
  | { canceled: true }
  | { canceled: false; filePath: string; source: string };

/** Result shared by all save-style file operations. */
export type FileSaveResult =
  | { canceled: true }
  | { canceled: false; filePath: string };

/** Abstracts file operations away from application use cases. */
export type FileGateway = {
  openRouteFile: () => Promise<FileOpenResult>;
  savePngFile: (payload: PngSavePayload) => Promise<FileSaveResult>;
  saveRouteFile: (payload: FileSavePayload) => Promise<FileSaveResult>;
  saveRouteFileAs: (payload: FileSavePayload) => Promise<FileSaveResult>;
};

/** Text payload used when saving `.vrl` route files. */
export type FileSavePayload = {
  filePath: null | string;
  source: string;
};

/** Binary payload used when saving exported PNG topo previews. */
export type PngSavePayload = {
  data: Uint8Array;
  defaultPath: string;
};
