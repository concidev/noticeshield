"use client";

const baseStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.04em",
  borderRadius: 9999,
  padding: "4px 10px",
  whiteSpace: "nowrap",
  width: "fit-content",
  flexShrink: 0,
};

export function ModeIndicator({ mode }: { mode: "gemma" | "mock" | "demo" | "cached" }) {
  if (mode === "gemma") {
    return (
      <span style={{ ...baseStyle, color: "var(--secondary)", background: "var(--secondary-container)" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--secondary)", display: "inline-block", flexShrink: 0 }} />
        Gemma 4 · Live
      </span>
    );
  }

  if (mode === "cached") {
    return (
      <span style={{ ...baseStyle, color: "var(--secondary)", background: "var(--secondary-container)" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--secondary)", display: "inline-block", flexShrink: 0 }} />
        Gemma 4 · Instant
      </span>
    );
  }

  if (mode === "mock") {
    return (
      <span style={{ ...baseStyle, color: "var(--warning)", background: "#fef3c7" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--warning)", display: "inline-block", flexShrink: 0 }} />
        Demo Mode
      </span>
    );
  }

  return (
    <span style={{ ...baseStyle, color: "var(--primary-container)", background: "var(--surface-container)" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--primary-container)", display: "inline-block", flexShrink: 0 }} />
      Offline Sample
    </span>
  );
}
