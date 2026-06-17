import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useTheme } from "../../context/ThemeContext";

const PAGE_TITLES = {
  "/dashboard": { title: "Dashboard",      sub: "Platform overview & analytics" },
  "/profiles":  { title: "DB Profiles",    sub: "Manage database connection profiles" },
  "/tokens":    { title: "API Tokens",     sub: "Create and manage access tokens" },
  "/query":     { title: "Query Console",  sub: "Ask questions in natural language" },
  "/schema":    { title: "Schema Manager", sub: "Manage table and column metadata" },
  "/audit":     { title: "Audit Logs",     sub: "System event and access history" },
  "/users":     { title: "Users",          sub: "User accounts and permissions" },
};

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

          {/* Right side — ONGC tagline + status dot */}
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
          </div>
        </header>

        {/* ── Page Content ── */}
        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          <div style={{ padding: "28px 32px", maxWidth: 1280, margin: "0 auto" }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
