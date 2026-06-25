import { createInitialRouteDocument, insertElementBeforeExit } from "../../src/domain/routeDocument";
import type { RouteDocument } from "../../src/domain/routeTypes";

export function deterministicIds(...ids: string[]) {
  let index = 0;

  return () => ids[index++] ?? `id-${index}`;
}

export function documentWithRappel(): RouteDocument {
  return insertElementBeforeExit(createInitialRouteDocument(deterministicIds("start", "exit")), "rappel", deterministicIds("rappel"));
}

export function validVrlSource(): string {
  return [
    'route "Loaded Canyon" {',
    '  metadata difficulty="V4 A3 III" region=Cartago country="Costa Rica" entrance_elevation=1300m exit_elevation=1100m',
    '  start "Entrance"',
    '  walk W1 distance=120m',
    '  rappel R9 height=35m rope=70m anchor=bolts anchor_count=2 station=center landing=pool inclination=80% stages=20m+15m redirections=12m:left,27m:right flow=medium',
    '  pool P1 type=deep flow=low',
    '  hazard H1 type=snake severity=high note="Snake area"',
    '  note "Scout exit before rain"',
    '  exit "Exit"',
    '}',
    ''
  ].join("\n");
}
