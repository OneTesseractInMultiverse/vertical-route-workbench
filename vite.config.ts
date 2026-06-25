import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

const packageJson = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as { version: string };

export default defineConfig({
  base: "./",
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version)
  },
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true
  }
});
