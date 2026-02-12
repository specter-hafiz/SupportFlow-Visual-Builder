import type { FlowNode, Connection, Position } from "../types/flow.types";

export const calculateConnections = (nodes: FlowNode[]): Connection[] => {
  const connections: Connection[] = [];

  nodes.forEach((node) => {
    node.options.forEach((option, index) => {
      const targetNode = nodes.find((n) => n.id === option.nextId);
      if (targetNode) {
        connections.push({
          from: node,
          to: targetNode,
          optionIndex: index,
          label: option.label,
        });
      }
    });
  });

  return connections;
};

/**
 * Determine if an option should connect from the left or right
 * Even indices (0, 2, 4...) = RIGHT
 * Odd indices (1, 3, 5...) = LEFT
 */
export const getConnectionSide = (optionIndex: number): "left" | "right" => {
  return optionIndex % 2 === 1 ? "right" : "left";
};

/**
 * Get the connection point for an option (LEFT or RIGHT edge)
 */
export const getOptionConnectionPoint = (
  node: FlowNode,
  optionIndex: number,
  nodeWidth: number = 200,
): Position => {
  const side = getConnectionSide(optionIndex);

  // Calculate Y position of the option
  const headerHeight = 30;
  const questionHeight = 60;
  const marginTop = 12;
  const optionHeight = 32;

  const optionY =
    node.position.y +
    headerHeight +
    questionHeight +
    marginTop +
    optionIndex * optionHeight +
    optionHeight / 2;

  // X position depends on side
  const optionX =
    side === "right"
      ? node.position.x + nodeWidth // Right edge
      : node.position.x; // Left edge

  return { x: optionX, y: optionY };
};

/**
 * Get the TOP CENTER position of a node
 */
export const getNodeTopCenter = (
  node: FlowNode,
  nodeWidth: number = 200,
): Position => {
  return {
    x: node.position.x + nodeWidth / 2,
    y: node.position.y,
  };
};

/**
 * Create a smooth curved path between two points
 * Direction matters - left-side connections curve differently than right-side
 */
export const getConnectionPath = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  side: "left" | "right",
): string => {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // Control point distance based on distance between nodes
  const controlPointDistance = Math.min(Math.max(distance * 0.4, 50), 150);

  if (side === "right") {
    // For right-side connections: curve goes right then down
    const cp1X = startX + controlPointDistance;
    const cp1Y = startY;
    const cp2X = endX;
    const cp2Y = endY - controlPointDistance;

    return `M ${startX},${startY} C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${endX},${endY}`;
  } else {
    // For left-side connections: curve goes left then down
    const cp1X = startX - controlPointDistance;
    const cp1Y = startY;
    const cp2X = endX;
    const cp2Y = endY - controlPointDistance;

    return `M ${startX},${startY} C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${endX},${endY}`;
  }
};

export const calculateNodeBounds = (
  position: Position,
  width: number = 200,
  height: number = 120,
): DOMRect => {
  return new DOMRect(position.x, position.y, width, height);
};

export const isPointInNode = (
  point: Position,
  node: FlowNode,
  nodeWidth: number = 200,
  nodeHeight: number = 120,
): boolean => {
  return (
    point.x >= node.position.x &&
    point.x <= node.position.x + nodeWidth &&
    point.y >= node.position.y &&
    point.y <= node.position.y + nodeHeight
  );
};
