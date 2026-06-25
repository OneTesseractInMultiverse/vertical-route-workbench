# Internal Architecture

Vertical Route Workbench follows a hexagonal structure so domain behavior, application use cases, UI adapters, and Electron I/O stay independently testable.

## Layers

### Domain

`src/domain` contains pure route-editing policies and VRL serialization rules. These modules do not know about React, Electron, browser APIs, files, or the npm VRL compiler. Domain functions return new route documents instead of mutating existing objects.

### Application

`src/application/editorUseCases.ts` coordinates domain operations with ports. Use cases validate whether an operation is allowed, serialize route documents when needed, and call gateways or exporters. They should not render UI and should not perform direct filesystem or browser work.

### Ports

`src/ports` defines contracts for external capabilities:

- `FileGateway` opens and saves route or PNG files.
- `PreviewRenderer` compiles and renders preview SVG.
- `RouteLoader` parses existing `.vrl` source into an editable document.
- `PngExporter` rasterizes SVG into PNG bytes.

### Adapters

`src/adapters` implements the ports with concrete infrastructure. Browser and Electron concerns belong here, including IPC, downloads, SVG rasterization, npm VRL compiler calls, and diagnostic translation.

### UI

`src/ui` contains React components. Components should delegate route changes to application use cases through callbacks and should not encode domain policy directly.

### Electron

`electron/main.ts` owns native windows, file dialogs, and filesystem writes. `electron/preload.cts` exposes a minimal IPC bridge to the renderer while keeping context isolation enabled.

## Testing Expectations

Unit tests should prove behavior, not only execute lines for coverage. Prefer exact outputs, failure payloads, and port call assertions over broad checks such as `ok === true`, partial string containment, or type checks. A blocked path should assert both the returned failure and that the external port was not called.
