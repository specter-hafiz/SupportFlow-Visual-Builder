import { useMemo } from "react";
import type { FlowData, ValidationIssue } from "../types/flow.types";
import { validateFlow } from "../utils/flowValidation";

export const useFlowValidation = (flowData: FlowData) => {
  const issues = useMemo<ValidationIssue[]>(() => {
    return validateFlow(flowData);
  }, [flowData]);

  const hasIssues = issues.length > 0;

  const getNodeIssues = (nodeId: string): ValidationIssue[] => {
    return issues.filter((issue) => issue.nodeId === nodeId);
  };

  return {
    issues,
    hasIssues,
    getNodeIssues,
  };
};
