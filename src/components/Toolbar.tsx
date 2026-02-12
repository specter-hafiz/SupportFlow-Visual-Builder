import React, { useState } from "react";

interface ToolbarProps {
  onPreview: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExport: () => void;
  validationIssuesCount: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  currentZoom?: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onPreview,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExport,
  validationIssuesCount,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  currentZoom = 1,
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      {/* Desktop Toolbar */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #333",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#0a0a0a",
          flexWrap: "wrap",
          gap: "12px",
          //   position should be sticky only on desktop, on mobile it should scroll with content
          //   how do we conditionally apply position: sticky based on screen size? We can use a media query in CSS for that
          //
          position: window.innerWidth < 768 ? "relative" : "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img
            src="/logo.png"
            alt="SupportFlow Logo"
            style={{ width: "32px", height: "32px", marginRight: "8px" }}
          />
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(16px, 4vw, 20px)",
              color: "#fff",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            SupportFlow Visual Builder
          </h1>
        </div>

        {/* Desktop Controls */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
          className="desktop-controls"
        >
          {/* Validation Badge */}
          {validationIssuesCount > 0 && (
            <div
              style={{
                padding: "6px 12px",
                backgroundColor: "#f59e0b",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "500",
                color: "#000",
                whiteSpace: "nowrap",
              }}
            >
              ⚠️ {validationIssuesCount}
            </div>
          )}

          {/* Zoom Controls */}
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <button
              onClick={onZoomOut}
              style={{
                padding: "8px 12px",
                backgroundColor: "#333",
                border: "none",
                borderRadius: "4px",
                color: "#fff",
                cursor: "pointer",
                fontSize: "16px",
              }}
              title="Zoom Out"
            >
              −
            </button>
            <span
              style={{
                padding: "0 8px",
                fontSize: "12px",
                color: "#999",
                minWidth: "50px",
                textAlign: "center",
              }}
            >
              {Math.round(currentZoom * 100)}%
            </span>
            <button
              onClick={onZoomIn}
              style={{
                padding: "8px 12px",
                backgroundColor: "#333",
                border: "none",
                borderRadius: "4px",
                color: "#fff",
                cursor: "pointer",
                fontSize: "16px",
              }}
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={onResetZoom}
              style={{
                padding: "8px 12px",
                backgroundColor: "#333",
                border: "none",
                borderRadius: "4px",
                color: "#fff",
                cursor: "pointer",
                fontSize: "12px",
              }}
              title="Reset Zoom"
            >
              100%
            </button>
          </div>

          {/* Undo/Redo */}
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={onUndo}
              disabled={!canUndo}
              style={{
                padding: "8px 12px",
                backgroundColor: canUndo ? "#333" : "#1a1a1a",
                border: "none",
                borderRadius: "4px",
                color: canUndo ? "#fff" : "#666",
                cursor: canUndo ? "pointer" : "not-allowed",
                fontSize: "14px",
              }}
              title="Undo (Ctrl+Z)"
            >
              ↶
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              style={{
                padding: "8px 12px",
                backgroundColor: canRedo ? "#333" : "#1a1a1a",
                border: "none",
                borderRadius: "4px",
                color: canRedo ? "#fff" : "#666",
                cursor: canRedo ? "pointer" : "not-allowed",
                fontSize: "14px",
              }}
              title="Redo (Ctrl+Y)"
            >
              ↷
            </button>
          </div>

          {/* Export */}
          <button
            onClick={onExport}
            style={{
              padding: "10px 16px",
              backgroundColor: "#22c55e",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              whiteSpace: "nowrap",
            }}
          >
            💾 Export
          </button>

          {/* Preview */}
          <button
            onClick={onPreview}
            style={{
              padding: "10px 16px",
              backgroundColor: "#3b82f6",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              whiteSpace: "nowrap",
            }}
          >
            ▶ Preview
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            style={{
              display: "none",
              padding: "8px 12px",
              backgroundColor: "#333",
              border: "none",
              borderRadius: "4px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "18px",
            }}
            className="mobile-menu-toggle"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#1a1a1a",
            borderBottom: "1px solid #333",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
          className="mobile-menu"
        >
          <button
            onClick={() => {
              onPreview();
              setShowMobileMenu(false);
            }}
            style={{
              padding: "12px",
              backgroundColor: "#3b82f6",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ▶ Preview Mode
          </button>
          <button
            onClick={() => {
              onExport();
              setShowMobileMenu(false);
            }}
            style={{
              padding: "12px",
              backgroundColor: "#22c55e",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            💾 Export Flow
          </button>
        </div>
      )}

      {/* Mobile-specific styles */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-controls > div:not(:first-child) {
            display: none !important;
          }
          .desktop-controls > button:not(.mobile-menu-toggle) {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};
