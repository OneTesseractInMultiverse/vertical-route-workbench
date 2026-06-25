declare module "@subvertic/vrl-core" {
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

  export type VrlCompileResult = {
    diagnostics: VrlDiagnostic[];
    layout: unknown;
    model: unknown;
    ok: boolean;
  };

  export function compileRoute(source: string, options?: unknown): VrlCompileResult;
  export function formatDiagnostic(diagnostic: VrlDiagnostic): string;
}

declare module "@subvertic/vrl-render-svg" {
  export function renderTopoSvg(route: unknown, layout: unknown, options?: unknown): string;
}
