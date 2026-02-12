import type { FlowData, ValidationIssue } from "../types/flow.types";

export const validateFlow = (flowData: FlowData): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const { nodes } = flowData;

  // Find start node
  const startNode = nodes.find((n) => n.type === "start");
  if (!startNode) {
    return [
      {
        type: "missing-target",
        nodeId: "",
        message: "No start node found",
      },
    ];
  }

  // Find all reachable nodes from start
  const reachableIds = new Set<string>();
  const queue: string[] = [startNode.id];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (visited.has(currentId)) {
      issues.push({
        type: "circular",
        nodeId: currentId,
        message: `Circular reference detected at node ${currentId}`,
      });
      continue;
    }

    visited.add(currentId);
    reachableIds.add(currentId);

    const currentNode = nodes.find((n) => n.id === currentId);
    if (currentNode) {
      currentNode.options.forEach((option) => {
        const targetExists = nodes.some((n) => n.id === option.nextId);
        if (!targetExists) {
          issues.push({
            type: "missing-target",
            nodeId: currentNode.id,
            message: `Option "${option.label}" points to non-existent node "${option.nextId}"`,
          });
        } else {
          queue.push(option.nextId);
        }
      });
    }
  }

  // Find orphaned nodes
  nodes.forEach((node) => {
    if (!reachableIds.has(node.id)) {
      issues.push({
        type: "orphaned",
        nodeId: node.id,
        message: `Node "${node.id}" is not reachable from start`,
      });
    }
  });

  return issues;
};

export const exportFlowAsJSON = (flowData: FlowData): string => {
  return JSON.stringify(flowData, null, 2);
};

export const downloadJSON = (
  data: string,
  filename: string = "flow_export.json",
) => {
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
