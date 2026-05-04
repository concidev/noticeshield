"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { icon: "document_scanner", text: "Reading your notice…" },
  { icon: "schedule",         text: "Identifying deadlines and key dates…" },
  { icon: "warning",          text: "Assessing urgency and risk…" },
  { icon: "checklist",        text: "Building your action plan…" },
  { icon: "location_on",      text: "Finding local resources…" },
  { icon: "auto_awesome",     text: "Almost done…" },
];

export function AnalyzingOverlay({ streamText }: { streamText?: string }) {
  const [step, setStep] = useState(0);
  const isStreaming = !!streamText;

  useEffect(() => {
    if (isStreaming) return;
    const id = setInterval(() => setStep((prev) => (prev + 1) % STEPS.length), 2200);
    return () => clearInterval(id);
  }, [isStreaming]);

  const current = isStreaming
    ? { icon: "auto_awesome", text: "Receiving analysis from Gemma…" }
    : STEPS[step];

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 32,
      paddingTop: 48, paddingBottom: 48,
      minHeight: 400, textAlign: "center",
    }}>

      {/* Pulsing shield */}
      <div style={{
        width: 88, height: 88, borderRadius: "50%",
        background: "var(--primary)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "shieldPulse 2s ease-in-out infinite",
      }}>
        <span className="material-symbols-outlined" style={{
          fontSize: 44, color: "#ffffff",
          fontVariationSettings: "'FILL' 1",
        }}>
          shield
        </span>
      </div>

      {/* Title */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h2 className="text-h1" style={{ color: "var(--primary)", margin: 0 }}>
          Analyzing Notice
        </h2>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "var(--secondary-container)", color: "var(--on-secondary-container)",
          borderRadius: 9999, padding: "4px 12px",
          fontSize: 12, fontWeight: 700, alignSelf: "center",
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          Powered by Gemma 4
        </span>
      </div>

      {/* Current step card */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--outline-variant)",
        borderRadius: 12, padding: "16px 24px",
        display: "flex", alignItems: "center", gap: 12,
        width: "100%", maxWidth: 360,
        boxShadow: "0 4px 16px rgba(0,53,95,0.08)",
        transition: "all 0.3s ease",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
          background: "var(--primary-fixed)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span className="material-symbols-outlined" style={{
            color: "var(--primary)", fontSize: 20,
            fontVariationSettings: "'FILL' 1",
          }}>
            {current.icon}
          </span>
        </div>
        <span className="text-body-md" style={{ color: "var(--on-surface)", textAlign: "left" }}>
          {current.text}
        </span>
      </div>

      {/* Live streaming output */}
      {isStreaming && streamText && (
        <div style={{
          width: "100%", maxWidth: 360,
          background: "#0f172a", borderRadius: 10,
          padding: "12px 14px", overflow: "hidden",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%", background: "#22c55e",
              animation: "pulse 1.5s ease-in-out infinite", flexShrink: 0,
            }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", letterSpacing: "0.08em", fontFamily: "monospace" }}>
              LIVE · GEMMA 4
            </span>
          </div>
          <p style={{
            margin: 0, fontSize: 11, lineHeight: 1.6,
            fontFamily: "monospace", color: "#cbd5e1",
            wordBreak: "break-all", whiteSpace: "pre-wrap",
          }}>
            {streamText.length > 140 ? "…" + streamText.slice(-140) : streamText}
          </p>
        </div>
      )}

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            height: 8, borderRadius: 9999,
            width: isStreaming ? 24 : (i === step ? 24 : 8),
            background: isStreaming ? "var(--secondary)" : (i === step ? "var(--primary)" : "var(--outline-variant)"),
            opacity: isStreaming ? (i % 2 === 0 ? 1 : 0.5) : 1,
            transition: "all 0.35s ease",
          }} />
        ))}
      </div>

    </div>
  );
}
