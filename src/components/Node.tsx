import React, { useState, useRef, useEffect } from "react";
import type { CSSProperties } from "react";
import type {
  FlowNode,
  NodeType,
  NodeStyleConfig,
  Position,
} from "../types/flow.types";

interface NodeProps {
  node: FlowNode;
  onEdit: (nodeId: string, newText: string) => void;
  onPositionChange?: (nodeId: string, position: Position) => void;
  isSelected: boolean;
  onClick: () => void;
  hasValidationIssues?: boolean;
}

const NODE_STYLES: Record<NodeType, NodeStyleConfig> = {
  start: {
    borderColor: "#22c55e",
    shadowColor: "rgba(34, 197, 94, 0.3)",
    backgroundColor: "#1a1a1a",
  },
  question: {
    borderColor: "#3b82f6",
    shadowColor: "rgba(59, 130, 246, 0.3)",
    backgroundColor: "#1a1a1a",
  },
  end: {
    borderColor: "#ef4444",
    shadowColor: "rgba(239, 68, 68, 0.3)",
    backgroundColor: "#1a1a1a",
  },
};

export const Node: React.FC<NodeProps> = ({
  node,
  onEdit,
  onPositionChange,
  isSelected,
  onClick,
  hasValidationIssues = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const styleConfig = NODE_STYLES[node.type];

  const getNodeStyle = (): CSSProperties => {
    return {
      position: "absolute",
      left: `${node.position.x}px`,
      top: `${node.position.y}px`,
      width: "200px", // Fixed width for consistent calculations
      padding: "16px",
      borderRadius: "8px",
      border: `2px solid ${hasValidationIssues ? "#f59e0b" : styleConfig.borderColor}`,
      backgroundColor: styleConfig.backgroundColor,
      boxShadow: isSelected
        ? `0 0 0 3px ${styleConfig.shadowColor}`
        : `0 4px 12px ${styleConfig.shadowColor}`,
      cursor: isDragging ? "grabbing" : "pointer",
      transition: isDragging ? "none" : "all 0.2s ease",
      zIndex: isSelected ? 10 : 1,
      userSelect: "none",
    };
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = () => {
    if (textareaRef.current) {
      const newText = textareaRef.current.value.trim();
      if (newText && newText !== node.text) {
        onEdit(node.id, newText);
      }
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;

    e.stopPropagation();
    onClick();

    if (onPositionChange) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - node.position.x,
        y: e.clientY - node.position.y,
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isEditing) return;

    onClick();

    if (onPositionChange && e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragOffset({
        x: touch.clientX - node.position.x,
        y: touch.clientY - node.position.y,
      });
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (onPositionChange) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        onPositionChange(node.id, { x: newX, y: newY });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (onPositionChange && e.touches.length === 1) {
        const touch = e.touches[0];
        const newX = touch.clientX - dragOffset.x;
        const newY = touch.clientY - dragOffset.y;
        onPositionChange(node.id, { x: newX, y: newY });
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, dragOffset, node.id, onPositionChange]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  return (
    <div
      ref={nodeRef}
      id={`node-${node.id}`}
      className="node"
      style={getNodeStyle()}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={handleDoubleClick}
    >
      {/* Type Badge */}
      <div
        style={{
          fontSize: "10px",
          fontWeight: "bold",
          textTransform: "uppercase",
          marginBottom: "8px",
          opacity: 0.6,
          color: "#e5e5e5",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{node.type}</span>
        {hasValidationIssues && <span style={{ color: "#f59e0b" }}>⚠️</span>}
      </div>

      {/* Question Text */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          defaultValue={node.text}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          style={{
            width: "100%",
            minHeight: "60px",
            padding: "8px",
            fontSize: "14px",
            backgroundColor: "#2a2a2a",
            border: "1px solid #444",
            borderRadius: "4px",
            color: "#fff",
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
      ) : (
        <p
          style={{
            margin: "0 0 12px 0",
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#e5e5e5",
            wordBreak: "break-word",
          }}
        >
          {node.text}
        </p>
      )}

      {/* Options - Each with connection point */}
      {/* Options - Alternating left/right connection points */}
      {node.options.length > 0 && (
        <div style={{ marginTop: "12px" }}>
          {node.options.map((option, idx) => {
            const isRightSide = idx % 2 === 0;
            const dotColor = isRightSide ? "#22c55e" : "#3b82f6";

            return (
              <div
                key={idx}
                id={`option-${node.id}-${idx}`}
                className="node-option"
                style={{
                  fontSize: "12px",
                  padding: "8px 12px",
                  margin: "4px 0",
                  backgroundColor: "#2a2a2a",
                  borderRadius: "6px",
                  borderLeft: isRightSide ? `3px solid ${dotColor}` : "none",
                  borderRight: !isRightSide ? `3px solid ${dotColor}` : "none",
                  color: "#e5e5e5",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  minHeight: "32px",
                  flexDirection: isRightSide ? "row" : "row-reverse",
                }}
              >
                {/* Connection point indicator - LEFT or RIGHT */}
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: dotColor,
                    flexShrink: 0,
                    border: "2px solid #1a1a1a",
                    boxShadow: `0 0 4px ${dotColor}99`,
                  }}
                  title={`${isRightSide ? "Right" : "Left"} → Node ${option.nextId}`}
                />

                <span
                  style={{ flex: 1, textAlign: isRightSide ? "left" : "right" }}
                >
                  {option.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
