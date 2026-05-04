"use client";

import { useEffect, useState } from "react";
import { NoticeUploader } from "@/components/NoticeUploader";
import { ResultDashboard } from "@/components/ResultDashboard";
import { BottomNav, type NavTab } from "@/components/BottomNav";
import { LocationSelector } from "@/components/LocationSelector";
import { AnalyzingOverlay } from "@/components/AnalyzingOverlay";
import { buildLocalResources } from "@/lib/localResources";
import { buildLocation, locationGroups } from "@/lib/locations";
import { getDemoAnalysis } from "@/lib/sampleCache";
import type { NoticeAnalysis, UserLocation } from "@/lib/types";

type View = "home" | "upload" | "result" | "history" | "help";

interface HistoryItem {
  id: string;
  createdAt: string;
  analysis: NoticeAnalysis;
}

const HISTORY_STORAGE_KEY = "noticeshield.history.v1";
const MAX_HISTORY_ITEMS = 12;

function getViewForTab(tab: NavTab): View {
  if (tab === "history") return "history";
  if (tab === "help") return "help";
  return tab;
}

export default function HomePage() {
  const [view, setView] = useState<View>("home");
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [analysis, setAnalysis] = useState<NoticeAnalysis | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [helpRegionIndex, setHelpRegionIndex] = useState(0);
  const [helpLocality, setHelpLocality] = useState(locationGroups[0].areas[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamText, setStreamText] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const helpLocation = buildLocation(helpRegionIndex, helpLocality);
  const helpResources = buildLocalResources("general", helpLocation);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) setHistory(JSON.parse(saved) as HistoryItem[]);
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    const fade = setTimeout(() => setSplashFading(true), 1500);
    const hide = setTimeout(() => setShowSplash(false), 2000);
    return () => { clearTimeout(fade); clearTimeout(hide); };
  }, []);

  const saveHistory = (nextAnalysis: NoticeAnalysis) => {
    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      analysis: nextAnalysis,
    };

    setHistory((previous) => {
      const next = [item, ...previous].slice(0, MAX_HISTORY_ITEMS);
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    window.localStorage.removeItem(HISTORY_STORAGE_KEY);
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    setView(getViewForTab(tab));
    if (tab === "upload") setError(null);
  };

  const handleSubmit = async (data: {
    noticeText: string;
    targetLanguage: string;
    location: UserLocation;
    imageBase64?: string;
    imageMimeType?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setStreamText("");

    try {
      const res = await fetch("/api/analyze-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json() as { success: boolean; error?: string };
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (!res.body) {
        setError("No response from server. Please try again.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          let evt: { type: string; text?: string; analysis?: NoticeAnalysis; error?: string };
          try { evt = JSON.parse(raw); } catch { continue; }
          if (evt.type === "token" && evt.text) {
            setStreamText((prev) => prev + evt.text);
          } else if (evt.type === "result" && evt.analysis) {
            setAnalysis(evt.analysis);
            saveHistory(evt.analysis);
            setView("result");
            setActiveTab("upload");
            window.scrollTo({ top: 0, behavior: "smooth" });
            break outer;
          } else if (evt.type === "error") {
            setError(evt.error ?? "Analysis failed.");
            break outer;
          }
        }
      }
    } catch {
      setError("Could not connect to the analyzer. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
      setStreamText("");
    }
  };

  return (
    <div className="app-shell" style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 56, paddingBottom: 80 }}>

      {/* Splash screen */}
      {showSplash && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "linear-gradient(160deg, #00355f 0%, #002040 100%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 20,
          opacity: splashFading ? 0 : 1,
          transition: "opacity 0.5s ease",
          pointerEvents: splashFading ? "none" : "auto",
        }}>
          <div style={{
            width: 96, height: 96, borderRadius: "50%",
            background: "rgba(152,241,250,0.1)",
            border: "1.5px solid rgba(152,241,250,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "shieldPulse 2s ease-in-out infinite",
          }}>
            <span className="material-symbols-outlined" style={{
              fontSize: 52, color: "#98f1fa", fontVariationSettings: "'FILL' 1",
            }}>shield</span>
          </div>

          <div style={{ textAlign: "center", animation: "splashFadeIn 0.4s ease 0.1s both" }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>
              NoticeShield
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 6, fontWeight: 500 }}>
              Know the deadline. Know the risk.
            </div>
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(0,105,113,0.3)", border: "1px solid rgba(152,241,250,0.2)",
            borderRadius: 9999, padding: "6px 14px",
            fontSize: 11, fontWeight: 700, color: "#98f1fa",
            letterSpacing: "0.06em", textTransform: "uppercase",
            animation: "splashFadeIn 0.4s ease 0.2s both",
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            Gemma 4 Good
          </div>
        </div>
      )}

      <a
        href="#main-content"
        style={{
          position: "absolute", top: -40, left: 0, zIndex: 100,
          background: "var(--primary)", color: "#fff",
          padding: "8px 16px", fontWeight: 600, fontSize: 14,
          textDecoration: "none", borderRadius: "0 0 8px 0",
          transition: "top 0.15s",
        }}
        onFocus={(e) => { e.currentTarget.style.top = "0"; }}
        onBlur={(e) => { e.currentTarget.style.top = "-40px"; }}
      >
        Skip to content
      </a>

      {/* Sticky top header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
        background: "#ffffff",
        borderBottom: "1px solid var(--outline-variant)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 20px", height: 56,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="material-symbols-outlined" style={{ color: "#1e40af", fontVariationSettings: "'FILL' 1" }}>shield</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: "#1e3a5f", letterSpacing: "-0.02em" }}>NoticeShield</span>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" className="app-main" style={{ margin: "0 auto", padding: "24px 20px 16px" }}>

        {/* ── HOME VIEW ── */}
        {view === "home" && (
          <div className="home-view" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Hero card */}
            <section style={{
              background: "var(--surface-low)",
              border: "1px solid var(--outline-variant)",
              borderRadius: 12, padding: 32,
              display: "flex", flexDirection: "column", alignItems: "center",
              textAlign: "center", gap: 16,
              boxShadow: "0 4px 24px rgba(0,53,95,0.05)",
            }}>
              <h1 className="text-display" style={{ color: "var(--primary)", margin: 0, maxWidth: 440 }}>
                Instant clarity on any official notice.
              </h1>
              <p className="text-body-lg" style={{ color: "var(--on-surface-variant)", margin: 0, maxWidth: 400 }}>
                Upload any official document and get the deadline, the risk, and a plain-language action plan — in seconds.
              </p>

              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#ffffff", border: "1px solid var(--outline-variant)",
                color: "var(--secondary)", borderRadius: 9999,
                padding: "7px 12px", fontSize: 13, fontWeight: 700,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                Powered by Gemma 4 for civic impact
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
                <button
                  onClick={() => { setView("upload"); setActiveTab("upload"); }}
                  style={{
                    height: 48, background: "var(--primary)", color: "var(--on-primary)",
                    border: "none", borderRadius: 8,
                    fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "0 28px", cursor: "pointer",
                    boxShadow: "0 8px 16px rgba(0,53,95,0.15)",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>document_scanner</span>
                  Scan or Upload Notice
                </button>
                <button
                  onClick={() => {
                    const demo = getDemoAnalysis();
                    setAnalysis(demo);
                    saveHistory(demo);
                    setView("result");
                    setActiveTab("upload");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  style={{
                    height: 48, background: "transparent", color: "var(--primary)",
                    border: "1.5px solid var(--primary)", borderRadius: 8,
                    fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "0 20px", cursor: "pointer",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span>
                  See Live Example
                </button>
              </div>

              {/* Notice type chips */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
                {["Eviction", "Utility Shutoff", "Benefits Appeal", "Court Summons", "Immigration", "Insurance Denial"].map((label) => (
                  <span key={label} style={{
                    fontSize: 11, fontWeight: 600,
                    background: "var(--surface-variant)", color: "var(--on-surface-variant)",
                    borderRadius: 9999, padding: "4px 10px",
                  }}>{label}</span>
                ))}
              </div>
            </section>

            {/* How it works */}
            <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 className="text-h2" style={{ color: "var(--primary)", margin: 0 }}>How it works</h2>
              <div className="home-steps-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                {[
                  {
                    step: "Step 1", title: "Upload Notice", icon: "cloud_upload",
                    iconBg: "var(--primary-container)", iconColor: "var(--on-primary-container)",
                    accentBg: "var(--primary-fixed)",
                    desc: "Take a photo or upload any official document — letter, bill, notice, or form — that you need help understanding.",
                  },
                  {
                    step: "Step 2", title: "AI Analysis", icon: "memory",
                    iconBg: "var(--secondary-container)", iconColor: "var(--on-secondary-container)",
                    accentBg: "var(--secondary-fixed)",
                    desc: "Gemma reads the notice and identifies what it asks you to do, by when, and what may happen if you ignore it.",
                  },
                  {
                    step: "Step 3", title: "Action Plan", icon: "task_alt",
                    iconBg: "var(--primary)", iconColor: "var(--on-primary)",
                    accentBg: "var(--error-container)",
                    desc: "Get a plain-language summary, a step-by-step action plan, and resources for free help — in your language.",
                  },
                ].map((card) => (
                  <div key={card.step} style={{
                    background: "var(--surface)", border: "1px solid var(--outline-variant)",
                    borderRadius: 12, padding: 24,
                    display: "flex", flexDirection: "column", gap: 16,
                    position: "relative", overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,53,95,0.04)",
                  }}>
                    <div style={{
                      position: "absolute", top: 0, right: 0,
                      width: 80, height: 80,
                      background: card.accentBg, opacity: 0.4,
                      borderBottomLeftRadius: "100%",
                      marginRight: -16, marginTop: -16,
                    }} />
                    <div style={{
                      width: 48, height: 48, borderRadius: 10,
                      background: card.iconBg, color: card.iconColor,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      position: "relative", zIndex: 1,
                      boxShadow: "0 4px 12px rgba(0,53,95,0.15)",
                    }}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
                    </div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <span className="text-label-sm" style={{ color: "var(--primary)", display: "block", marginBottom: 4 }}>{card.step}</span>
                      <h3 className="text-h2" style={{ margin: "0 0 6px", color: "var(--on-surface)" }}>{card.title}</h3>
                      <p className="text-body-md" style={{ margin: 0, color: "var(--on-surface-variant)" }}>{card.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Impact stats */}
            <div style={{
              display: "flex",
              background: "#ffffff",
              border: "1px solid var(--outline-variant)",
              borderRadius: 14, overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,53,95,0.06)",
            }}>
              {[
                { stat: "77M+", label: "need plain-language help", icon: "groups",            accent: "var(--primary)" },
                { stat: "12",   label: "languages supported",      icon: "translate",          accent: "var(--secondary)" },
                { stat: "Free", label: "always, for everyone",     icon: "volunteer_activism", accent: "#16a34a" },
              ].map((item, i) => (
                <div key={i} style={{
                  flex: 1, padding: "18px 8px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  borderRight: i < 2 ? "1px solid var(--outline-variant)" : "none",
                  borderTop: `3px solid ${item.accent}`,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: item.accent, fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                  <span style={{ fontSize: 24, fontWeight: 900, color: "var(--on-surface)", lineHeight: 1 }}>{item.stat}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "var(--on-surface-variant)", lineHeight: 1.3, textAlign: "center" }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Mode status card — sits at the bottom as a technical footnote */}
            {(() => {
              const isLive = process.env.NEXT_PUBLIC_GEMMA_LIVE === "true";
              return (
                <section style={{
                  background: "var(--surface)", border: "1px solid var(--outline-variant)",
                  borderLeft: isLive ? "4px solid var(--secondary)" : "4px solid var(--outline)",
                  borderRadius: 8, padding: 20,
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                      background: isLive ? "var(--secondary-container)" : "var(--surface-container-high)",
                      color: isLive ? "var(--on-secondary-container)" : "var(--on-surface-variant)",
                      width: 48, height: 48, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isLive ? "cloud_done" : "shield_lock"}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-h2" style={{ margin: "0 0 2px", color: "var(--on-surface)" }}>
                        {isLive ? "Gemma 4 Live Mode" : "Demo Mode"}
                      </h2>
                      <p className="text-body-md" style={{ margin: 0, color: "var(--on-surface-variant)" }}>
                        {isLive
                          ? "Connected to Gemma 4 via Google AI Studio. Your notices are analyzed in real time."
                          : "Running with sample responses. Add a Gemma API key to enable live analysis."}
                      </p>
                    </div>
                  </div>
                  <span className="text-label-sm" style={{
                    background: isLive ? "var(--secondary-container)" : "var(--surface-container-high)",
                    color: isLive ? "var(--on-secondary-container)" : "var(--on-surface-variant)",
                    padding: "4px 10px", borderRadius: 9999, whiteSpace: "nowrap", flexShrink: 0,
                    textTransform: "uppercase",
                  }}>
                    {isLive ? "Live" : "Demo"}
                  </span>
                </section>
              );
            })()}
          </div>
        )}

        {/* ── UPLOAD VIEW ── */}
        {view === "upload" && (
          <div className="upload-view" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {isLoading ? (
              <AnalyzingOverlay streamText={streamText} />
            ) : (
              <>
                <div>
                  <h1 className="text-h1" style={{ color: "var(--on-surface)", margin: "0 0 4px" }}>Upload a Document</h1>
                  <p className="text-body-md" style={{ color: "var(--on-surface-variant)", margin: 0 }}>
                    Any official notice, bill, or letter — Gemma can turn it into a deadline, risk, and action plan.
                  </p>
                </div>

                {error && (
                  <div style={{
                    background: "var(--error-container)", border: "1px solid var(--error)",
                    borderRadius: 8, padding: "14px 16px",
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}>
                    <span className="material-symbols-outlined" style={{ color: "var(--error)", fontSize: 20, flexShrink: 0 }}>error</span>
                    <p className="text-body-md" style={{ color: "var(--on-error-container)", margin: 0 }}>{error}</p>
                  </div>
                )}

                <NoticeUploader onSubmit={handleSubmit} isLoading={isLoading} />
              </>
            )}
          </div>
        )}

        {/* ── RESULT VIEW ── */}
        {view === "result" && analysis && (
          <div role="region" aria-label="Analysis results" aria-live="polite">
          <ResultDashboard
            analysis={analysis}
            onReset={() => {
              setAnalysis(null);
              setError(null);
              setView("upload");
              setActiveTab("upload");
            }}
          />
          </div>
        )}

        {/* ── HISTORY VIEW ── */}
        {view === "history" && (
          <div className="history-view" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <h1 className="text-h1" style={{ color: "var(--on-surface)", margin: "0 0 4px" }}>Saved Analyses</h1>
                <p className="text-body-md" style={{ color: "var(--on-surface-variant)", margin: 0 }}>
                  Recent results are stored on this device for offline reference.
                </p>
              </div>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-label-md"
                  style={{ border: "none", background: "transparent", color: "var(--error)", cursor: "pointer", fontFamily: "inherit", padding: 4 }}
                >
                  Clear
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 32 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "var(--surface-container-high)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--on-surface-variant)" }}>history</span>
                </div>
                <h2 className="text-h2" style={{ color: "var(--on-surface)", margin: 0 }}>No history yet</h2>
                <p className="text-body-md" style={{ color: "var(--on-surface-variant)", margin: 0, textAlign: "center" }}>
                  Analyze a sample notice to create your first saved result.
                </p>
              </div>
            ) : (
              <div className="history-grid" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setAnalysis(item.analysis);
                      setView("result");
                      setActiveTab("history");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    style={{
                      textAlign: "left",
                      background: "var(--surface)",
                      border: "1px solid var(--outline-variant)",
                      borderLeft: `4px solid ${item.analysis.urgency === "critical" ? "var(--urgent)" : item.analysis.urgency === "high" ? "var(--warning)" : item.analysis.urgency === "medium" ? "var(--notice)" : "var(--safe)"}`,
                      borderRadius: 8,
                      padding: 16,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      boxShadow: "0 1px 4px rgba(0,53,95,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <span className="text-label-md" style={{ color: "var(--primary)" }}>{item.analysis.noticeTypeLabel}</span>
                      <span className="text-label-sm" style={{ color: "var(--outline)", whiteSpace: "nowrap" }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-body-md" style={{ color: "var(--on-surface-variant)", margin: 0 }}>
                      {item.analysis.summary}
                    </p>
                    <span className="text-label-sm" style={{ color: "var(--error)", textTransform: "uppercase" }}>
                      {item.analysis.deadline ?? "Review deadline in notice"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HELP VIEW ── */}
        {view === "help" && (
          <div className="help-view" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h1 className="text-h1" style={{ margin: "0 0 4px" }}>Help & Resources</h1>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)", margin: 0 }}>
                Free legal, housing, utility, benefits, and healthcare support near you.
              </p>
            </div>

            <LocationSelector
              regionIndex={helpRegionIndex}
              locality={helpLocality}
              description="Used to show resource categories and directories serving your area."
              onChange={(nextRegionIndex, nextLocality) => {
                setHelpRegionIndex(nextRegionIndex);
                setHelpLocality(nextLocality);
              }}
            />

            <div style={{
              background: "var(--surface-low)",
              border: "1px solid var(--outline-variant)",
              borderRadius: 8,
              padding: 16,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}>
              <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 22, flexShrink: 0 }}>info</span>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)", margin: 0 }}>
                Resources are tailored for {helpLocation.label}. Always verify phone numbers, office hours, eligibility, and deadlines with the official agency or organization.
              </p>
            </div>

            {helpResources.map((r) => (
              <div key={`${r.category}-${r.label}`} style={{
                background: "var(--surface)", border: "1px solid var(--outline-variant)",
                borderRadius: 8, padding: "16px 20px",
                display: "flex", gap: 16, alignItems: "center",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "var(--surface-container-high)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontVariationSettings: "'FILL' 1" }}>
                    {r.category === "legal" ? "gavel" : r.category === "housing" ? "home" : r.category === "utility" ? "bolt" : r.category === "benefits" ? "paid" : r.category === "healthcare" ? "medical_services" : "support_agent"}
                  </span>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span className="text-label-md" style={{ color: "var(--primary)", display: "block" }}>{r.label}</span>
                    <span className="text-label-sm" style={{
                      color: "var(--on-surface-variant)",
                      background: "var(--surface-low)",
                      borderRadius: 9999,
                      padding: "1px 7px",
                      textTransform: "uppercase",
                    }}>
                      {r.category}
                    </span>
                  </div>
                  <span className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>{r.detail}</span>
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-label-sm" style={{
                      color: "var(--secondary)", display: "inline-flex", alignItems: "center", gap: 4,
                      textDecoration: "none", marginTop: 4,
                    }}>
                      Visit site
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>open_in_new</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer (home only) */}
      {view === "home" && (
        <footer style={{
          background: "#f8fafc", borderTop: "1px solid var(--outline-variant)",
          padding: "24px 20px", textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          marginBottom: 64,
        }}>
          <p className="text-label-sm" style={{ color: "#64748b", margin: 0 }}>
            NoticeShield provides general information only — not legal advice. Verify all deadlines and instructions with the original notice or issuing agency.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            {["Terms", "Privacy"].map((l) => (
              <a key={l} href="#" className="text-label-sm" style={{ color: "#94a3b8", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </footer>
      )}

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
