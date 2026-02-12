export type NodeType = "start" | "question" | "end";

export interface Position {
  x: number;
  y: number;
}

export interface CanvasSize {
  w: number;
  h: number;
}

export interface Option {
  label: string;
  nextId: string;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  text: string;
  position: Position;
  options: Option[];
}

export interface FlowMeta {
  theme: "light" | "dark";
  canvas_size: CanvasSize;
}

export interface FlowData {
  meta: FlowMeta;
  nodes: FlowNode[];
}

export interface Connection {
  from: FlowNode;
  to: FlowNode;
  optionIndex: number;
  label: string;
}

export interface ChatMessage {
  type: "bot" | "user";
  text: string;
  timestamp: number;
}

export interface ValidationIssue {
  type: "orphaned" | "circular" | "missing-target";
  nodeId: string;
  message: string;
}

export interface NodeStyleConfig {
  borderColor: string;
  shadowColor: string;
  backgroundColor: string;
}
