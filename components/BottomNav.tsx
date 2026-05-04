"use client";

export type NavTab = "home" | "upload" | "history" | "help";

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

const TABS = [
  { id: "home" as NavTab, label: "Home", icon: "home" },
  { id: "upload" as NavTab, label: "Upload", icon: "cloud_upload" },
  { id: "history" as NavTab, label: "History", icon: "history" },
  { id: "help" as NavTab, label: "Help", icon: "help" },
];

export function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <nav className="bottom-nav" style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: "#ffffff",
      borderTop: "1px solid var(--outline-variant)",
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      height: 64,
      padding: "0 8px",
    }}>
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              padding: "6px 16px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              background: active ? "#eff4ff" : "transparent",
              color: active ? "var(--primary)" : "var(--on-surface-variant)",
              transition: "all 0.2s",
              minWidth: 56,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 24,
                fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {tab.icon}
            </span>
            <span style={{ fontSize: 11, fontWeight: 500, lineHeight: 1, marginTop: 2 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
