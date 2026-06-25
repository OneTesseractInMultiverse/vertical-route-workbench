import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeProps
} from "@xyflow/react";
import { useMemo } from "react";
import { obstacleDefinition } from "../domain/obstacleCatalog";
import type { ElementType, RouteElement } from "../domain/routeTypes";

type RouteCanvasProps = {
  elements: RouteElement[];
  onAddObstacle: (type: ElementType) => void;
  onSelect: (editorId: null | string) => void;
  selectedId: null | string;
};

type RouteNodeData = {
  element: RouteElement;
};

const nodeTypes = {
  routeNode: RouteNode
};

export function RouteCanvas({ elements, onAddObstacle, onSelect, selectedId }: RouteCanvasProps) {
  const nodes = useMemo(() => toFlowNodes(elements), [elements]);
  const edges = useMemo(() => toFlowEdges(elements), [elements]);

  function handleDrop(event: React.DragEvent): void {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/vrl-obstacle");

    if (type !== "") {
      onAddObstacle(type as ElementType);
    }
  }

  return (
    <section className="glass-panel route-canvas" aria-label="Route work area" onDrop={handleDrop} onDragOver={(event) => event.preventDefault()}>
      <ReactFlowProvider>
        <ReactFlow
          colorMode="light"
          edges={edges}
          fitView
          maxZoom={1.4}
          minZoom={0.35}
          nodes={nodes}
          nodesDraggable
          nodeTypes={nodeTypes}
          onNodeClick={(_event, node) => onSelect(node.id)}
          onPaneClick={() => onSelect(null)}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#c6c6c6" gap={24} />
          <MiniMap pannable zoomable nodeColor={(node) => node.data.color as string} />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
      {selectedId === null ? null : <span className="selection-chip">{selectedId}</span>}
    </section>
  );
}

function toFlowNodes(elements: RouteElement[]): Node[] {
  return elements.map((element, index) => {
    const definition = obstacleDefinition(element.type);

    return {
      data: {
        color: definition.color,
        element
      },
      id: element.editorId,
      position: {
        x: 120 + ((index % 2) * 120),
        y: index * 128
      },
      type: "routeNode"
    };
  });
}

function toFlowEdges(elements: RouteElement[]): Edge[] {
  return elements.slice(1).map((element, index) => ({
    animated: element.type === "rappel" || element.type === "downclimb",
    id: `${elements[index]?.editorId ?? "start"}-${element.editorId}`,
    source: elements[index]?.editorId ?? "",
    style: {
      stroke: "#393939",
      strokeWidth: 2
    },
    target: element.editorId,
    type: "smoothstep"
  }));
}

function RouteNode({ data, selected }: NodeProps) {
  const nodeData = data as RouteNodeData;
  const definition = obstacleDefinition(nodeData.element.type);
  const summary = routeNodeSummary(nodeData.element);

  return (
    <div className={`route-node ${selected ? "is-selected" : ""}`} style={{ "--node-color": definition.color } as React.CSSProperties}>
      <Handle position={Position.Top} type="target" />
      <span className="route-node-symbol">{definition.symbol}</span>
      <div>
        <strong>{nodeTitle(nodeData.element)}</strong>
        <small>{summary}</small>
      </div>
      <Handle position={Position.Bottom} type="source" />
    </div>
  );
}

function nodeTitle(element: RouteElement): string {
  return element.type === "start" || element.type === "exit" ? element.label : obstacleDefinition(element.type).title;
}

function routeNodeSummary(element: RouteElement): string {
  const values = Object.values(element.attributes).filter((value) => value !== "");

  return values.length === 0 ? "Fixed point" : values.slice(0, 3).join(" / ");
}
