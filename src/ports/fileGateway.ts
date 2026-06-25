export type FileOpenResult =
  | { canceled: true }
  | { canceled: false; filePath: string; source: string };

export type FileSaveResult =
  | { canceled: true }
  | { canceled: false; filePath: string };

export type FileGateway = {
  openRouteFile: () => Promise<FileOpenResult>;
  saveRouteFile: (payload: FileSavePayload) => Promise<FileSaveResult>;
  saveRouteFileAs: (payload: FileSavePayload) => Promise<FileSaveResult>;
};

export type FileSavePayload = {
  filePath: null | string;
  source: string;
};
