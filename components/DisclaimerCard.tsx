"use client";

export function DisclaimerCard({ text }: { text: string }) {
  return (
    <div style={{
      background: "var(--surface-container)",
      border: "1px solid var(--outline-variant)",
      borderRadius: 8,
      padding: "14px 16px",
      display: "flex", gap: 12, alignItems: "flex-start",
    }}>
      <span style={{ color: "var(--outline)", fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚖️</span>
      <p className="text-label-sm" style={{ color: "var(--on-surface-variant)", margin: 0, lineHeight: 1.6, letterSpacing: "0.02em" }}>
        {text}
      </p>
    </div>
  );
}
