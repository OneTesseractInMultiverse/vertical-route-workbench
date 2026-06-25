import { draggableObstacleDefinitions } from "../domain/obstacleCatalog";
import type { ElementType } from "../domain/routeTypes";

type ObstacleBoxProps = {
  onAddObstacle: (type: ElementType) => void;
};

/** Renders the draggable/clickable catalog of route obstacles that can be inserted into the route. */
export function ObstacleBox({ onAddObstacle }: ObstacleBoxProps) {
  return (
    <aside className="glass-panel obstacle-box" aria-label="Obstacle box">
      <div className="panel-title">
        <p className="eyebrow">Obstacle Box</p>
        <h2>Elements</h2>
      </div>
      <div className="obstacle-list">
        {draggableObstacleDefinitions().map((definition) => (
          <button
            className="obstacle-button"
            draggable
            key={definition.type}
            style={{ "--node-color": definition.color } as React.CSSProperties}
            type="button"
            onClick={() => onAddObstacle(definition.type)}
            onDragStart={(event) => event.dataTransfer.setData("application/vrl-obstacle", definition.type)}
          >
            <span>{definition.symbol}</span>
            <strong>{definition.title}</strong>
            <small>{definition.description}</small>
          </button>
        ))}
      </div>
    </aside>
  );
}
