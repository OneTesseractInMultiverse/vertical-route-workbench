import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      all: true,
      include: [
        "src/application/**/*.ts",
        "src/domain/**/*.ts",
        "src/adapters/vrl*.ts"
      ],
      exclude: [
        "src/domain/routeTypes.ts",
        "src/generated/countryData.ts"
      ],
      reporter: ["text", "lcov"],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100
      }
    },
    environment: "node",
    globals: true
  }
});
