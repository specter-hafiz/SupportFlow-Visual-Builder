import React, { useMemo } from "react";
import type { FlowNode } from "../types/flow.types";
import {
  calculateConnections,
  getConnectionPath,
  getOptionConnectionPoint,
  getNodeTopCenter,
  getConnectionSide,
} from "../utils/connectionUtils";

interface ConnectionLayerProps {
  nodes: FlowNode[];
  canvasWidth: number;
  canvasHeight: number;
}

export const ConnectionLayer: React.FC<ConnectionLayerProps> = ({
  nodes,
  canvasWidth,
  canvasHeight,
}) => {
  const connections = useMemo(() => calculateConnections(nodes), [nodes]);

  const paths = useMemo(() => {
    return connections.map((conn) => {
      const side = getConnectionSide(conn.optionIndex);

      // Get start point (left or right edge of option)
      const startPos = getOptionConnectionPoint(conn.from, conn.optionIndex);

      // Get end point (top center of target node)
      const endPos = getNodeTopCenter(conn.to);

      // Create the path with side information for proper curve
      const path = getConnectionPath(
        startPos.x,
        startPos.y,
        endPos.x,
        endPos.y,
        side,
      );

      return {
        id: `${conn.from.id}-${conn.optionIndex}-${conn.to.id}`,
        path,
        from: conn.from.id,
        to: conn.to.id,
        label: conn.label,
        side,
      };
    });
  }, [connections]);

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
      width={canvasWidth}
      height={canvasHeight}
    >
      <defs>
        {/* Arrow markers */}
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
        </marker>

        <marker
          id="arrowhead-hover"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
        </marker>

        <marker
          id="arrowhead-left"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#22c55e" />
        </marker>

        <marker
          id="arrowhead-left-hover"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#10b981" />
        </marker>

        {/* Glow filter */}
        <filter
          id="connection-glow"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Render each connection */}
      {paths.map((conn) => {
        const isLeftSide = conn.side === "left";
        const strokeColor = "#666";
        const arrowMarker = isLeftSide
          ? "url(#arrowhead-left)"
          : "url(#arrowhead)";
        const hoverArrowMarker = isLeftSide
          ? "url(#arrowhead-left-hover)"
          : "url(#arrowhead-hover)";

        return (
          <g key={conn.id} className="connection-group" data-side={conn.side}>
            {/* Wide invisible line for easier hover */}
            <path
              d={conn.path}
              stroke="transparent"
              strokeWidth="15"
              fill="none"
              style={{ cursor: "pointer" }}
              className="connection-hover-target"
            />

            {/* Shadow/outline */}
            <path
              d={conn.path}
              stroke="#000"
              strokeWidth="4"
              fill="none"
              opacity="0.4"
              style={{ pointerEvents: "none" }}
            />

            {/* Main connection line */}
            <path
              d={conn.path}
              stroke={strokeColor}
              strokeWidth="2"
              fill="none"
              markerEnd={arrowMarker}
              className="connection-line"
              data-hover-marker={hoverArrowMarker}
              style={{
                transition: "all 0.2s ease",
                pointerEvents: "none",
              }}
            />
          </g>
        );
      })}

      <style>{`
        .connection-group:hover .connection-line {
          stroke-width: 3px !important;
          filter: url(#connection-glow);
        }

        .connection-group[data-side="right"]:hover .connection-line {
          stroke: #3b82f6 !important;
          marker-end: url(#arrowhead-hover) !important;
        }

        .connection-group[data-side="left"]:hover .connection-line {
          stroke: #10b981 !important;
          marker-end: url(#arrowhead-left-hover) !important;
        }
      `}</style>
    </svg>
  );
};
