/** Local declaration shim for the published VRL core package until bundled package types are available. */
declare module "@subvertic/vrl-core" {
  /** Compiler diagnostic shape consumed by the editor adapters. */
  export type VrlDiagnostic = {
    kind: string;
    location: {
      column: number;
      line: number;
    };
    message: string;
    severity: "error" | "warning";
    suggestion: string;
  };

  /** Compiler result shape consumed by route loading and preview rendering. */
  export type VrlCompileResult = {
    diagnostics: VrlDiagnostic[];
    layout: unknown;
    model: unknown;
    ok: boolean;
  };

  /** Compiles VRL source into a route model, layout, and diagnostics. */
  export function compileRoute(source: string, options?: unknown): VrlCompileResult;

  /** Formats one compiler diagnostic into human-readable text. */
  export function formatDiagnostic(diagnostic: VrlDiagnostic): string;
}

/** Local declaration shim for the published SVG renderer package until bundled package types are available. */
declare module "@subvertic/vrl-render-svg" {
  /** Renders a compiled route model and layout into inline SVG markup. */
  export function renderTopoSvg(route: unknown, layout: unknown, options?: unknown): string;
}
