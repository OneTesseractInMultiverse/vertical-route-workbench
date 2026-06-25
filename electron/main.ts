import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const developmentServerUrl = "http://127.0.0.1:5173";

function createMainWindow(): void {
  const developmentIcon = app.isPackaged ? undefined : join(currentDirectory, "../build/icon.png");
  const mainWindow = new BrowserWindow({
    backgroundColor: "#161616",
    height: 920,
    ...(developmentIcon === undefined ? {} : { icon: developmentIcon }),
    minHeight: 760,
    minWidth: 1024,
    title: "Vertical Route Workbench",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(currentDirectory, "preload.cjs"),
      sandbox: false
    },
    width: 1480
  });

  if (app.isPackaged) {
    void mainWindow.loadFile(join(currentDirectory, "../dist/index.html"));
    return;
  }

  void mainWindow.loadURL(developmentServerUrl);
}

function registerFileHandlers(): void {
  ipcMain.handle("vrl:open", openRouteFile);
  ipcMain.handle("vrl:save", saveRouteFile);
  ipcMain.handle("vrl:save-as", saveRouteFileAs);
}

async function openRouteFile(): Promise<FileOpenResult> {
  const result = await dialog.showOpenDialog({
    filters: [{ extensions: ["vrl"], name: "VRL route" }],
    properties: ["openFile"]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  const filePath = result.filePaths[0];
  const source = await readFile(filePath, "utf8");

  return { canceled: false, filePath, source };
}

async function saveRouteFile(_event: unknown, payload: FileSavePayload): Promise<FileSaveResult> {
  const targetPath = payload.filePath ?? await selectSavePath();

  if (targetPath === null) {
    return { canceled: true };
  }

  await writeFile(targetPath, payload.source, "utf8");

  return { canceled: false, filePath: targetPath };
}

async function saveRouteFileAs(_event: unknown, payload: FileSavePayload): Promise<FileSaveResult> {
  const targetPath = await selectSavePath();

  if (targetPath === null) {
    return { canceled: true };
  }

  await writeFile(targetPath, payload.source, "utf8");

  return { canceled: false, filePath: targetPath };
}

async function selectSavePath(): Promise<null | string> {
  const result = await dialog.showSaveDialog({
    defaultPath: "route.vrl",
    filters: [{ extensions: ["vrl"], name: "VRL route" }]
  });

  return result.canceled ? null : result.filePath;
}

void app.whenReady().then(() => {
  registerFileHandlers();
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

type FileOpenResult =
  | { canceled: true }
  | { canceled: false; filePath: string; source: string };

type FileSavePayload = {
  filePath?: null | string;
  source: string;
};

type FileSaveResult =
  | { canceled: true }
  | { canceled: false; filePath: string };
