"use client";

import type { UrgencyLevel } from "@/lib/types";

const config: Record<UrgencyLevel, { label: string; bg: string; color: string; icon: string }> = {
  critical: { label: "CRITICAL",       bg: "var(--urgent)",   color: "#fff", icon: "🚨" },
  high:     { label: "HIGH PRIORITY",  bg: "var(--warning)",  color: "#fff", icon: "⚠️" },
  medium:   { label: "MEDIUM PRIORITY",bg: "var(--notice)",   color: "#fff", icon: "📋" },
  low:      { label: "LOW PRIORITY",   bg: "var(--safe)",     color: "#fff", icon: "ℹ️" },
};

export function UrgencyBadge({ urgency }: { urgency: UrgencyLevel }) {
  const c = config[urgency];
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 12px",
      borderRadius: 9999,
      background: c.bg,
      color: c.color,
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.06em",
      lineHeight: "16px",
    }}>
      <span style={{ fontSize: 13 }}>{c.icon}</span>
      {c.label}
    </span>
  );
}
