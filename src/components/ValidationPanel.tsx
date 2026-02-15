import React, { useState } from "react";
import type { ValidationIssue } from "../types/flow.types";

interface ValidationPanelProps {
  issues: ValidationIssue[];
  onNodeClick: (nodeId: string) => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  issues,
  onNodeClick,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768); // Auto-collapse on mobile

  if (issues.length === 0) return null;

  const getIssueIcon = (type: ValidationIssue["type"]) => {
    switch (type) {
      case "orphaned":
        return "🔗";
      case "circular":
        return "🔄";
      case "missing-target":
        return "❌";
      default:
        return "⚠️";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: window.innerWidth < 768 ? "70px" : "80px",
        right: window.innerWidth < 768 ? "10px" : "20px",
        width: isCollapsed ? "auto" : "min(300px, calc(100vw - 40px))",
        maxHeight: isCollapsed
          ? "auto"
          : window.innerWidth < 768
            ? "200px"
            : "400px",
        overflowY: "auto",
        // dont show on mobile and smaller devices
        display: window.innerWidth < 500 ? "none" : "block",

        backgroundColor: "#1a1a1a",
        border: "2px solid #f59e0b",
        borderRadius: "8px",
        padding: isCollapsed ? "8px 12px" : "16px",
        zIndex: 50,
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: isCollapsed ? 0 : "12px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: window.innerWidth < 768 ? "12px" : "14px",
            color: "#f59e0b",
            whiteSpace: "nowrap",
          }}
        >
          {isCollapsed ? `⚠️ ${issues.length}` : "Validation Issues"}
        </h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: "none",
            border: "none",
            color: "#f59e0b",
            cursor: "pointer",
            fontSize: "16px",
            padding: "4px",
            minWidth: "auto",
            minHeight: "auto",
          }}
        >
          {isCollapsed ? "▼" : "▲"}
        </button>
      </div>

      {!isCollapsed && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {issues.map((issue, idx) => (
            <div
              key={idx}
              onClick={() => issue.nodeId && onNodeClick(issue.nodeId)}
              style={{
                padding: "8px",
                backgroundColor: "#2a2a2a",
                borderRadius: "4px",
                fontSize: window.innerWidth < 768 ? "11px" : "12px",
                color: "#e5e5e5",
                cursor: issue.nodeId ? "pointer" : "default",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) =>
                issue.nodeId && (e.currentTarget.style.backgroundColor = "#333")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#2a2a2a")
              }
            >
              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                {getIssueIcon(issue.type)} {issue.type.toUpperCase()}
              </div>
              <div style={{ opacity: 0.8, wordBreak: "break-word" }}>
                {issue.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
