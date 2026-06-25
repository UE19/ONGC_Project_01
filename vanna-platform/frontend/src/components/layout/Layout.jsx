import React, { useState, useRef, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useTheme } from "../../context/ThemeContext";
import { ExternalLink, Sparkles, Send, Bot, User, Table2 } from "lucide-react";
import { queryAPI } from "../../services/api";
import toast from "react-hot-toast";

const PAGE_TITLES = {
  "/dashboard": { title: "Dashboard",      sub: "Platform overview & analytics" },
  "/profiles":  { title: "DB Profiles",    sub: "Manage database connection profiles" },
  "/tokens":    { title: "API Tokens",     sub: "Create and manage access tokens" },
  "/query":     { title: "Query Console",  sub: "Ask questions in natural language" },
  "/schema":    { title: "Schema Manager", sub: "Manage table and column metadata" },
  "/audit":     { title: "Audit Logs",     sub: "System event and access history" },
  "/users":     { title: "Users",          sub: "User accounts and permissions" },
};

/* ── Global Floating Query Assistant ── */
function QuickQueryChat() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! Ask me anything about your ONGC data — I'll query your databases and show results right here." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, loading, open]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    const apiToken = localStorage.getItem("api_token");
    if (!apiToken) {
      toast.error("Set an API token in Query Console first");
      return;
    }
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setInput("");
    setLoading(true);
    try {
      const { data } = await queryAPI.execute(q);
      setMessages((prev) => [...prev, { role: "assistant", content: data.summary, result: data }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: err.response?.data?.detail || "Query failed. Please try again.",
        error: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const unread = !open && messages.length > 1;

  return (
    <>
      {/* Chat popup panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 92, right: 24, zIndex: 1000,
          width: 390,
          background: "var(--card)",
          border: "1px solid rgba(204,0,0,0.2)",
          borderRadius: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "chatSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          {/* Header — gradient banner */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px",
            background: "linear-gradient(135deg, #CC0000 0%, #7a0000 100%)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -18, right: 40, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
            <div style={{ position: "absolute", top: -8, right: 10, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Sparkles size={16} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>Query Assistant</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 4px #22c55e" }} />
                  Powered by Vanna AI
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 8, cursor: "pointer",
                color: "white", fontSize: 16, lineHeight: 1,
                padding: "4px 8px", transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.22)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
            >×</button>
          </div>

          {/* Messages */}
          <div style={{
            height: 320, overflowY: "auto", padding: "14px 14px",
            display: "flex", flexDirection: "column", gap: 12,
            scrollbarWidth: "thin",
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 8, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  background: m.role === "user" ? "rgba(204,0,0,0.12)" : "rgba(34,211,238,0.12)",
                  border: `1px solid ${m.role === "user" ? "rgba(204,0,0,0.25)" : "rgba(34,211,238,0.25)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {m.role === "user" ? <User size={12} color="var(--accent)" /> : <Bot size={12} color="#22d3ee" />}
                </div>

                <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 5, alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    padding: "9px 12px",
                    borderRadius: m.role === "user" ? "12px 3px 12px 12px" : "3px 12px 12px 12px",
                    background: m.role === "user" ? "rgba(204,0,0,0.12)" : m.error ? "rgba(239,68,68,0.1)" : "var(--surface2)",
                    border: m.role === "user" ? "1px solid rgba(204,0,0,0.2)" : m.error ? "1px solid rgba(239,68,68,0.2)" : "1px solid var(--border)",
                    fontSize: 12, color: m.error ? "#f87171" : "var(--text)", lineHeight: 1.6,
                  }}>
                    {m.content}
                  </div>

                  {m.result && m.result.data?.length > 0 && (
                    <div style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", fontSize: 10 }}>
                      <div style={{
                        display: "flex", gap: 6, alignItems: "center",
                        padding: "5px 10px", background: "var(--surface2)",
                        borderBottom: "1px solid var(--border)", color: "var(--text3)",
                      }}>
                        <Table2 size={10} />
                        <span>{m.result.row_count} rows</span>
                        <span>·</span>
                        <span>{m.result.execution_time_ms}ms</span>
                        <span>·</span>
                        <span style={{ fontFamily: "monospace", color: "var(--accent)" }}>{m.result.db_type?.toUpperCase()}</span>
                      </div>
                      <div style={{ overflowX: "auto", maxHeight: 140, overflowY: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr>
                              {m.result.columns.map((c) => (
                                <th key={c} style={{
                                  padding: "5px 8px", textAlign: "left",
                                  background: "var(--surface2)", color: "var(--text3)",
                                  fontWeight: 600, fontSize: 9, letterSpacing: 0.4,
                                  borderBottom: "1px solid var(--border)", whiteSpace: "nowrap",
                                }}>{c}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {m.result.data.slice(0, 5).map((row, ri) => (
                              <tr key={ri} style={{ borderBottom: "1px solid var(--border)" }}>
                                {m.result.columns.map((c) => (
                                  <td key={c} style={{ padding: "4px 8px", color: "var(--text2)", fontSize: 10, whiteSpace: "nowrap" }}>
                                    {row[c] == null ? <span style={{ color: "var(--text3)", fontStyle: "italic" }}>NULL</span> : String(row[c])}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {m.result.row_count > 5 && (
                        <div style={{ padding: "4px 10px", fontSize: 9, color: "var(--text3)", background: "var(--surface2)", borderTop: "1px solid var(--border)" }}>
                          +{m.result.row_count - 5} more rows — visit Query Console for full results
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Bot size={12} color="#22d3ee" />
                </div>
                <div style={{
                  padding: "9px 14px", borderRadius: "3px 12px 12px 12px",
                  background: "var(--surface2)", border: "1px solid var(--border)",
                  display: "flex", gap: 4, alignItems: "center",
                }}>
                  {[0, 1, 2].map((n) => (
                    <div key={n} style={{
                      width: 5, height: 5, borderRadius: "50%", background: "var(--text3)",
                      animation: `chatBounce 1.2s ${n * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            display: "flex", gap: 8, padding: "10px 14px",
            borderTop: "1px solid var(--border)", background: "var(--surface2)",
          }}>
            <input
              ref={inputRef}
              className="ongc-input"
              style={{ flex: 1, margin: 0, fontSize: 12, padding: "8px 12px" }}
              placeholder="Ask about your data…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              disabled={loading}
            />
            <button
              className="ongc-btn-primary"
              onClick={send}
              disabled={loading || !input.trim()}
              style={{ flexShrink: 0, padding: "0 12px", borderRadius: 8 }}
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ── Floating trigger area ── */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1001, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>

        {/* Hover preview popup */}
        {hovered && !open && (
          <div style={{
            position: "absolute", bottom: "calc(100% + 14px)", right: 0,
            width: 220, padding: "12px 14px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
            animation: "previewPop 0.2s cubic-bezier(0.34,1.4,0.64,1)",
            pointerEvents: "none",
          }}>
            {/* Arrow */}
            <div style={{
              position: "absolute", bottom: -6, right: 22,
              width: 12, height: 12,
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderTop: "none", borderLeft: "none",
              transform: "rotate(45deg)",
            }} />
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                background: "linear-gradient(135deg,#CC0000,#7a0000)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Bot size={11} color="white" />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>Query Assistant</span>
            </div>
            <p style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.5, margin: 0 }}>
              Ask anything about your ONGC data in plain English — instant results!
            </p>
            <div style={{ marginTop: 8, fontSize: 10, color: "var(--accent)", fontWeight: 600 }}>Click to open →</div>
          </div>
        )}

        {/* Curved heading label box */}
        {!open && (
          <div style={{
            padding: "5px 14px 5px 10px",
            background: "linear-gradient(135deg,rgba(204,0,0,0.15),rgba(100,0,0,0.1))",
            border: "1px solid rgba(204,0,0,0.3)",
            borderRadius: 20,
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 11, fontWeight: 700, color: "var(--accent)",
            boxShadow: "0 4px 16px rgba(204,0,0,0.2)",
            animation: "labelPop 0.3s cubic-bezier(0.34,1.4,0.64,1)",
            whiteSpace: "nowrap",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 5px #22c55e" }} />
            AI Assistant
          </div>
        )}

        {/* Main bot button */}
        <button
          onClick={() => setOpen((v) => !v)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          title="Open AI Query Assistant"
          style={{
            width: 58, height: 58, borderRadius: "50%",
            background: open
              ? "linear-gradient(135deg,#333,#111)"
              : "linear-gradient(135deg,#e60000 0%,#7a0000 100%)",
            border: "2.5px solid rgba(255,255,255,0.18)",
            boxShadow: open
              ? "0 0 0 4px rgba(204,0,0,0.2), 0 8px 24px rgba(0,0,0,0.4)"
              : "0 6px 0 rgba(100,0,0,0.5), 0 10px 30px rgba(204,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            setHovered(true);
            if (!open) {
              e.currentTarget.style.transform = "scale(1.1) translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 0 rgba(100,0,0,0.5), 0 16px 40px rgba(204,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.25)";
            }
          }}
          onMouseLeave={(e) => {
            setHovered(false);
            e.currentTarget.style.transform = "scale(1) translateY(0)";
            e.currentTarget.style.boxShadow = open
              ? "0 0 0 4px rgba(204,0,0,0.2), 0 8px 24px rgba(0,0,0,0.4)"
              : "0 6px 0 rgba(100,0,0,0.5), 0 10px 30px rgba(204,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)";
          }}
        >
          <div style={{ transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)", transform: open ? "rotate(90deg) scale(0.85)" : "rotate(0deg) scale(1)" }}>
            {open
              ? <span style={{ color: "white", fontSize: 24, lineHeight: 1, fontWeight: 200 }}>×</span>
              : <Bot size={24} color="white" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }} />
            }
          </div>
          {unread && (
            <div style={{
              position: "absolute", top: 2, right: 2,
              width: 14, height: 14, borderRadius: "50%",
              background: "#22c55e", border: "2px solid var(--bg)",
              boxShadow: "0 0 8px rgba(34,197,94,0.7)",
              animation: "pulseDot 2s infinite",
            }} />
          )}
        </button>
      </div>

      <style>{`
        @keyframes chatBounce {
          0%, 60%, 100% { transform: translateY(0); opacity:0.4; }
          30% { transform: translateY(-5px); opacity:1; }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes previewPop {
          from { opacity:0; transform: translateY(8px) scale(0.95); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        @keyframes labelPop {
          from { opacity:0; transform: scale(0.85); }
          to   { opacity:1; transform: scale(1); }
        }
        @keyframes pulseDot {
          0%,100% { transform:scale(1); box-shadow: 0 0 6px rgba(34,197,94,0.7); }
          50%     { transform:scale(1.3); box-shadow: 0 0 12px rgba(34,197,94,0.9); }
        }
      `}</style>
    </>
  );
}

export function Layout() {
  const { theme } = useTheme();
  const location = useLocation();
  const pageInfo = PAGE_TITLES[location.pathname] || { title: "ONGC Platform", sub: "" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* ── Top Header ── */}
        <header style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          height: 56,
          flexShrink: 0,
          background: "var(--header-bg)",
          borderBottom: "1px solid var(--border)",
          boxShadow: theme === "dark"
            ? "0 1px 12px rgba(0,0,0,0.3)"
            : "0 1px 8px rgba(0,0,0,0.06)",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 11, fontWeight: 800,
                color: "var(--accent)",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}>ONGC</span>
              <span style={{ color: "var(--border2)", fontSize: 13 }}>·</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                {pageInfo.title}
              </span>
              {pageInfo.sub && (
                <>
                  <span style={{ color: "var(--border2)", fontSize: 13 }}>·</span>
                  <span style={{ fontSize: 12, color: "var(--text3)" }}>{pageInfo.sub}</span>
                </>
              )}
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 6px rgba(34,197,94,0.6)",
              }} />
              <span style={{ fontSize: 11, color: "var(--text3)" }}>All systems operational</span>
            </div>
            <div style={{
              fontSize: 11,
              color: "rgba(204,0,0,0.7)",
              fontWeight: 600,
              letterSpacing: 0.5,
              padding: "3px 10px",
              background: "rgba(204,0,0,0.08)",
              borderRadius: 20,
              border: "1px solid rgba(204,0,0,0.15)",
            }}>
              Energy: Now AND Next
            </div>
            {/* Pop-out button */}
            <button
              title="Open in floating window — keep working while using the app"
              onClick={() =>
                window.open(
                  window.location.href,
                  "ongc_popup",
                  "width=520,height=760,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no"
                )
              }
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 13px",
                background: "linear-gradient(135deg, rgba(204,0,0,0.12), rgba(204,0,0,0.06))",
                border: "1px solid rgba(204,0,0,0.25)",
                borderRadius: 20,
                color: "var(--accent)",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.18s",
                letterSpacing: 0.3,
                boxShadow: "0 1px 4px rgba(204,0,0,0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(204,0,0,0.22), rgba(204,0,0,0.12))";
                e.currentTarget.style.boxShadow = "0 3px 12px rgba(204,0,0,0.25)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(204,0,0,0.12), rgba(204,0,0,0.06))";
                e.currentTarget.style.boxShadow = "0 1px 4px rgba(204,0,0,0.1)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <ExternalLink size={11} />
              Pop out
            </button>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          <div style={{ padding: "28px 32px", maxWidth: 1280, margin: "0 auto" }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global floating Query Assistant — visible on all pages */}
      <QuickQueryChat />
    </div>
  );
}
