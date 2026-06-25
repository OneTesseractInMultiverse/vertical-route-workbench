# Vertical Route Workbench

Desktop editor for creating, opening, previewing, and saving `.vrl` canyon route files.

The app is built with Electron, React, React Flow, TypeScript, and the local VRL packages:

- `@subvertic/vrl-core`
- `@subvertic/vrl-render-svg`

## Architecture

The code follows a hexagonal structure:

- `src/domain`: route document model, obstacle catalog, and VRL serialization.
- `src/application`: editor use cases that coordinate domain operations and ports.
- `src/ports`: file, preview, and route-loader contracts.
- `src/adapters`: Electron file access and VRL compiler/SVG renderer adapters.
- `src/ui`: React and React Flow presentation layer.

The UI never owns VRL syntax rules. It delegates route operations to the application layer and preview/parsing to adapters.

## Development

```sh
make install
make electron
```

`make electron`, `make run`, and `make start` all start the Vite renderer and then launch the Electron desktop shell.

Useful targets:

```sh
make dev
make electron
make run
make typecheck
make lint
make coverage
make build
make package
make package-current
make package-all
make audit
make check
make clean
```

`make check` runs TypeScript, ESLint, unit tests with 100% executable core coverage, production build, and `npm audit`.

## Desktop Packages

Local package targets use Electron Builder:

```sh
make package-dir      # unpacked app for the current platform
make package-current  # installer/archive for the current platform
make package-mac      # macOS DMG and ZIP artifacts
make package-win      # Windows NSIS installer and ZIP artifacts
```

Artifacts are written to `release/`.

macOS builds are unsigned unless a Developer ID certificate is available. Unsigned builds can run locally but may require a Gatekeeper override on another Mac.

Windows builds should be produced on Windows for the most reliable installer output. The GitHub Actions workflow in `.github/workflows/build-desktop.yml` builds macOS artifacts on a macOS runner and Windows artifacts on a Windows runner.

## Editor Model

The obstacle box exposes the current VRL grammar elements:

- start and exit are fixed endpoints.
- walk, rappel, downclimb, climb, pool, hazard, and note can be inserted into the route.
- Generated `.vrl` text is validated through `@subvertic/vrl-core`.
- Save is blocked while the generated VRL has blocking diagnostics.

The renderer preview uses `@subvertic/vrl-render-svg` to turn generated VRL into the topo SVG.
