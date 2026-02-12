import { useState, useCallback } from "react";
import type { FlowData, FlowNode, Position } from "../types/flow.types";
import flowDataJson from "../assets/flow_data.json";

export const useFlowData = () => {
  const [flowData, setFlowData] = useState<FlowData>(flowDataJson as FlowData);
  const [history, setHistory] = useState<FlowData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const saveToHistory = useCallback(
    (data: FlowData) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(data);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex],
  );

  const updateNodeText = useCallback(
    (nodeId: string, newText: string) => {
      setFlowData((prev) => {
        const updated = {
          ...prev,
          nodes: prev.nodes.map((node) =>
            node.id === nodeId ? { ...node, text: newText } : node,
          ),
        };
        saveToHistory(prev);
        return updated;
      });
    },
    [saveToHistory],
  );

  const updateNodePosition = useCallback(
    (nodeId: string, newPosition: Position) => {
      setFlowData((prev) => {
        const updated = {
          ...prev,
          nodes: prev.nodes.map((node) =>
            node.id === nodeId ? { ...node, position: newPosition } : node,
          ),
        };
        saveToHistory(prev);
        return updated;
      });
    },
    [saveToHistory],
  );

  const addNode = useCallback(
    (node: FlowNode) => {
      setFlowData((prev) => {
        const updated = {
          ...prev,
          nodes: [...prev.nodes, node],
        };
        saveToHistory(prev);
        return updated;
      });
    },
    [saveToHistory],
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setFlowData((prev) => {
        const updated = {
          ...prev,
          nodes: prev.nodes.filter((node) => node.id !== nodeId),
        };
        saveToHistory(prev);
        return updated;
      });
    },
    [saveToHistory],
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setFlowData(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setFlowData(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    flowData,
    updateNodeText,
    updateNodePosition,
    addNode,
    deleteNode,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
