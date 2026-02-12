import React, { useState, useEffect, useRef } from "react";
import { Node } from "./Node";
import { ConnectionLayer } from "./ConnectionLayer";
import { Toolbar } from "./Toolbar";
import { PreviewRunner } from "./PreviewRunner";
import { ValidationPanel } from "./ValidationPanel";
import { useFlowData } from "../hooks/useFlowData";
import { useFlowValidation } from "../hooks/useFlowValidation";
import { exportFlowAsJSON, downloadJSON } from "../utils/flowValidation";

export const Canvas: React.FC = () => {
  const {
    flowData,
    updateNodeText,
    updateNodePosition,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useFlowData();

  const { issues, getNodeIssues } = useFlowValidation(flowData);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Zoom and Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive scale for mobile
  const [responsiveScale, setResponsiveScale] = useState(1);

  // Calculate responsive scale on mount and resize
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const canvasWidth = flowData.meta.canvas_size.w;
        const padding = 40; // Total horizontal padding

        // If canvas is wider than container, scale it down
        if (canvasWidth + padding > containerWidth) {
          const scale = (containerWidth - padding) / canvasWidth;
          setResponsiveScale(Math.max(scale, 0.3)); // Minimum 30% scale
        } else {
          setResponsiveScale(1);
        }
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [flowData.meta.canvas_size.w]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        handleZoomOut();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        handleResetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // Mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom((prev) => Math.min(Math.max(prev + delta, 0.25), 2));
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
      return () => canvas.removeEventListener("wheel", handleWheel);
    }
  }, []);

  // Add this after the existing useEffect hooks

  // Touch zoom support (pinch to zoom)
  useEffect(() => {
    let initialDistance = 0;
    let initialZoom = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY,
        );
        initialZoom = zoom;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY,
        );

        const scale = distance / initialDistance;
        const newZoom = initialZoom * scale;
        setZoom(Math.min(Math.max(newZoom, 0.25), 2));
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      canvas.addEventListener("touchmove", handleTouchMove, { passive: false });

      return () => {
        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("touchmove", handleTouchMove);
      };
    }
  }, [zoom]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.25));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleExport = () => {
    const json = exportFlowAsJSON(flowData);
    downloadJSON(json);
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  if (isPreviewMode) {
    return (
      <PreviewRunner
        flowData={flowData}
        onClose={() => setIsPreviewMode(false)}
      />
    );
  }

  // Combined scale (responsive + user zoom)
  const totalScale = responsiveScale * zoom;

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#fff" }}
    >
      <Toolbar
        onPreview={() => setIsPreviewMode(true)}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onExport={handleExport}
        validationIssuesCount={issues.length}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        currentZoom={totalScale}
      />

      <div
        ref={containerRef}
        style={{
          position: "relative",
          minHeight: "calc(100vh - 70px)",
          overflow: "auto",
          padding: "20px",
        }}
      >
        <ValidationPanel issues={issues} onNodeClick={handleNodeClick} />

        {/* Canvas Wrapper */}
        <div
          style={{
            position: "relative",
            width: "100%",
            minHeight: "800px",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            paddingTop: "40px",
            paddingBottom: "100px",
          }}
        >
          {/* Scrollable Canvas Container */}
          <div
            ref={canvasRef}
            style={{
              position: "relative",
              width: `${flowData.meta.canvas_size.w * totalScale}px`,
              height: `${flowData.meta.canvas_size.h * totalScale}px`,
              maxWidth: "100%",
              cursor: isPanning ? "grabbing" : "default",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Canvas with Transform */}
            <div
              id="flow-canvas"
              style={{
                position: "relative",
                width: `${flowData.meta.canvas_size.w}px`,
                height: `${flowData.meta.canvas_size.h}px`,
                backgroundColor: "#121212",
                borderRadius: "8px",
                overflow: "visible",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.5)",
                transform: `scale(${totalScale}) translate(${pan.x / totalScale}px, ${pan.y / totalScale}px)`,
                transformOrigin: "top left",
                transition: isPanning ? "none" : "transform 0.1s ease-out",
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setSelectedNodeId(null);
                }
              }}
            >
              <ConnectionLayer
                nodes={flowData.nodes}
                canvasWidth={flowData.meta.canvas_size.w}
                canvasHeight={flowData.meta.canvas_size.h}
              />

              {flowData.nodes.map((node) => (
                <Node
                  key={node.id}
                  node={node}
                  onEdit={updateNodeText}
                  onPositionChange={updateNodePosition}
                  isSelected={selectedNodeId === node.id}
                  onClick={() => handleNodeClick(node.id)}
                  hasValidationIssues={getNodeIssues(node.id).length > 0}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div
          style={{
            textAlign: "center",
            opacity: 0.6,
            fontSize: "12px",
            marginTop: "20px",
            padding: "0 16px",
          }}
        >
          {window.innerWidth > 768 ? (
            <>
              Double-click to edit • Drag to move • Alt+Click to pan •
              Ctrl+Scroll to zoom
            </>
          ) : (
            <>Tap to select • Double-tap to edit • Pinch to zoom</>
          )}
        </div>
      </div>
    </div>
  );
};
