import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Database, Key, MessageSquare,
  FileText, Users, BookOpen, LogOut, Sun, Moon,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard",     desc: "Overview & analytics" },
  { to: "/profiles",  icon: Database,         label: "DB Profiles",   desc: "Connection profiles" },
  { to: "/tokens",    icon: Key,              label: "API Tokens",    desc: "Access token management" },
  { to: "/query",     icon: MessageSquare,    label: "Query Console", desc: "Natural language queries" },
  { to: "/schema",    icon: BookOpen,         label: "Schema Manager",desc: "Table & column metadata" },
  { to: "/audit",     icon: FileText,         label: "Audit Logs",    desc: "System event history", adminOnly: true },
  { to: "/users",     icon: Users,            label: "Users",         desc: "User management", adminOnly: true },
];

function AvatarCircle({ name, email }) {
  const initials = (name || email || "?")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      width: 36, height: 36,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #CC0000 0%, #880000 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 700, color: "white",
      flexShrink: 0,
      boxShadow: "0 2px 8px rgba(204,0,0,0.4)",
    }}>
      {initials}
    </div>
  );
}

export function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const filteredNav = navItems.filter((item) => !item.adminOnly || isAdmin());

  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      background: "var(--sidebar-bg)",
      borderRight: "1px solid var(--sidebar-border)",
      position: "relative",
      zIndex: 10,
    }}>

      {/* ── ONGC Brand Header ── */}
      <div style={{
        padding: "20px 18px 16px",
        borderBottom: "1px solid var(--sidebar-border)",
        background: "linear-gradient(160deg, #1a0000 0%, #2d0000 50%, #1a0000 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Glow effect behind logo */}
        <div style={{
          position: "absolute",
          top: -20, right: -20,
          width: 100, height: 100,
          borderRadius: "50%",
          background: "rgba(204,0,0,0.15)",
          filter: "blur(24px)",
          pointerEvents: "none",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
          <img
            src="/ongc-logo.png"
            alt="ONGC"
            style={{
              width: 40, height: 40, borderRadius: 9,
              boxShadow: "0 3px 12px rgba(0,0,0,0.5)",
            }}
          />
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: 1 }}>ONGC</div>
            <div style={{ color: "rgba(255,160,160,0.75)", fontSize: 10, marginTop: 1, letterSpacing: 0.5 }}>AI QUERY PLATFORM</div>
          </div>
        </div>
        <div style={{
          marginTop: 10,
          fontSize: 11,
          color: "rgba(255,200,200,0.5)",
          fontStyle: "italic",
          letterSpacing: 0.3,
        }}>
          Energy: Now AND Next
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, padding: "14px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Section label */}
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", letterSpacing: 1.2, padding: "2px 8px 8px", textTransform: "uppercase" }}>
          Navigation
        </div>

        {filteredNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            <Icon size={16} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{label}</span>
            <ChevronRight size={12} style={{ opacity: 0.4, flexShrink: 0 }} className="nav-chevron" />
          </NavLink>
        ))}
      </nav>

      {/* ── Divider ── */}
      <div style={{
        height: 1,
        margin: "0 16px",
        background: "linear-gradient(90deg, transparent, rgba(204,0,0,0.5), transparent)",
      }} />

      {/* ── Theme Toggle ── */}
      <div style={{ padding: "12px 14px" }}>
        <button
          onClick={toggleTheme}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
            cursor: "pointer",
            color: "rgba(180,200,230,0.75)",
            fontSize: 13,
            fontWeight: 500,
            transition: "background 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(180,200,230,0.75)"; }}
        >
          {theme === "dark"
            ? <><Sun size={15} /> Switch to Light Mode</>
            : <><Moon size={15} /> Switch to Dark Mode</>
          }
        </button>
      </div>

      {/* ── User Section ── */}
      <div style={{
        padding: "14px 14px 18px",
        borderTop: "1px solid var(--sidebar-border)",
        background: "rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <AvatarCircle name={user?.full_name} email={user?.email} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: "#e8eef7",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {user?.full_name || user?.email}
            </div>
            <div style={{
              fontSize: 10, fontWeight: 600,
              color: "#CC0000",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginTop: 2,
            }}>
              {(user?.role || "").replace(/_/g, " ")}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            background: "transparent",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 8,
            cursor: "pointer",
            color: "rgba(239,68,68,0.7)",
            fontSize: 13,
            fontWeight: 500,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.1)";
            e.currentTarget.style.color = "#f87171";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(239,68,68,0.7)";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
          }}
        >
          <LogOut size={14} />
          {loggingOut ? "Signing out…" : "Sign Out"}
        </button>
      </div>

      <style>{`
        .nav-item .nav-chevron { transition: transform 0.15s; }
        .nav-item:hover .nav-chevron { transform: translateX(3px); }
        .nav-item.active .nav-chevron { opacity: 0.6; }
      `}</style>
    </aside>
  );
}
