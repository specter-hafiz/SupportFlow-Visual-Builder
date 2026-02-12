import React, { useState, useRef, useEffect } from "react";
import type { FlowData, ChatMessage } from "../types/flow.types";

interface PreviewRunnerProps {
  flowData: FlowData;
  onClose: () => void;
}

export const PreviewRunner: React.FC<PreviewRunnerProps> = ({
  flowData,
  onClose,
}) => {
  const [currentNodeId, setCurrentNodeId] = useState<string>("1");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentNode = flowData.nodes.find((n) => n.id === currentNodeId);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, currentNodeId]);

  if (!currentNode) {
    return (
      <div style={{ padding: "20px", color: "#fff" }}>
        Error: Node not found
      </div>
    );
  }

  const isEndNode =
    currentNode.type === "end" || currentNode.options.length === 0;

  const handleOptionClick = (nextId: string, label: string) => {
    setChatHistory((prev) => [
      ...prev,
      { type: "bot", text: currentNode.text, timestamp: Date.now() },
      { type: "user", text: label, timestamp: Date.now() },
    ]);
    setCurrentNodeId(nextId);
  };

  const handleRestart = () => {
    setCurrentNodeId("1");
    setChatHistory([]);
  };

  const handleExport = () => {
    const exportData = {
      startTime: chatHistory[0]?.timestamp || Date.now(),
      endTime: Date.now(),
      conversation: chatHistory,
    };
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `conversation_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#0a0a0a",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #333",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(16px, 4vw, 18px)",
            color: "#fff",
          }}
        >
          Preview Mode
        </h2>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {chatHistory.length > 0 && (
            <button
              onClick={handleExport}
              style={{
                padding: "8px 12px",
                backgroundColor: "#22c55e",
                border: "none",
                borderRadius: "4px",
                color: "#fff",
                cursor: "pointer",
                fontSize: "12px",
                whiteSpace: "nowrap",
              }}
            >
              💾 Export
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: "8px 12px",
              backgroundColor: "#333",
              border: "none",
              borderRadius: "4px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "12px",
              whiteSpace: "nowrap",
            }}
          >
            ✕ Exit
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          maxWidth: "100%",
          width: "100%",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          {/* Chat History */}
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "12px",
                display: "flex",
                justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  backgroundColor: msg.type === "user" ? "#3b82f6" : "#2a2a2a",
                  maxWidth: "85%",
                  color: "#fff",
                  fontSize: "14px",
                  wordBreak: "break-word",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Current Question */}
          <div
            style={{
              marginBottom: "16px",
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                backgroundColor: "#2a2a2a",
                maxWidth: "85%",
                color: "#fff",
                fontSize: "14px",
                wordBreak: "break-word",
              }}
            >
              {currentNode.text}
            </div>
          </div>

          {/* Options or Restart */}
          {isEndNode ? (
            <button
              onClick={handleRestart}
              style={{
                padding: "12px 24px",
                backgroundColor: "#22c55e",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                width: "100%",
              }}
            >
              🔄 Restart Conversation
            </button>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {currentNode.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option.nextId, option.label)}
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#1a1a1a",
                    border: "2px solid #3b82f6",
                    borderRadius: "8px",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "14px",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    wordBreak: "break-word",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#2a2a2a")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#1a1a1a")
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>
    </div>
  );
};
