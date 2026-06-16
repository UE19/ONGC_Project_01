import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Database, Key, MessageSquare,
  FileText, Users, BookOpen, LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/profiles", icon: Database, label: "DB Profiles" },
  { to: "/tokens", icon: Key, label: "API Tokens" },
  { to: "/query", icon: MessageSquare, label: "Query Console" },
  { to: "/schema", icon: BookOpen, label: "Schema Manager" },
  { to: "/audit", icon: FileText, label: "Audit Logs", adminOnly: true },
  { to: "/users", icon: Users, label: "Users", adminOnly: true },
];

function OngcSidebarLogo() {
  return (
    <img src="/ongc-logo.png" alt="ONGC" style={{ width: "36px", height: "36px", borderRadius: "6px" }} />
  );
}

export function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 flex flex-col min-h-screen" style={{ background: "#0f1520", borderRight: "1px solid #1e2d44" }}>

      {/* ONGC Header */}
      <div className="px-4 py-4" style={{ borderBottom: "1px solid #1e2d44", background: "linear-gradient(135deg, #1a0000 0%, #3a0000 100%)" }}>
        <div className="flex items-center gap-3">
          <OngcSidebarLogo />
          <div>
            <div className="text-white font-bold text-sm leading-tight tracking-wide">ONGC</div>
            <div className="text-xs mt-0.5" style={{ color: "#ff9999" }}>AI Query Intelligence</div>
          </div>
        </div>
        <div className="mt-2 text-xs" style={{ color: "rgba(255,200,200,0.6)" }}>
          Energy: Now AND Next
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin())
          .map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? "text-white font-medium" : "text-gray-400 hover:text-white"
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? "#CC0000" : "transparent",
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains("text-white")) {
                  e.currentTarget.style.background = "#1e2d44";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.style.background.includes("204, 0, 0") &&
                    e.currentTarget.style.background !== "rgb(204, 0, 0)") {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
      </nav>

      {/* Divider with ONGC accent */}
      <div className="mx-4 h-px" style={{ background: "linear-gradient(90deg, transparent, #CC0000, transparent)" }} />

      {/* User footer */}
      <div className="px-4 py-4">
        <div className="text-xs mb-1 uppercase tracking-wide" style={{ color: "#CC0000" }}>
          {user?.role?.replace(/_/g, " ")}
        </div>
        <div className="text-sm text-white font-medium truncate">{user?.full_name || user?.email}</div>
        <div className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</div>
        <button
          onClick={handleLogout}
          className="mt-3 flex items-center gap-2 text-sm transition-colors"
          style={{ color: "#888" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#ff4444"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#888"}
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}
