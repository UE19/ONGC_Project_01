import React, { useEffect, useState } from "react";
import { usersAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  UserCog, UserX, ShieldCheck, Users as UsersIcon,
  Crown, Shield, User, Bot, RefreshCw, Search,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

/* ── Role config ── */
const ROLES = {
  super_admin:  { label: "Super Admin",   color: "#CC0000",  bg: "rgba(204,0,0,0.12)",    border: "rgba(204,0,0,0.25)",    Icon: Crown     },
  admin:        { label: "Admin",         color: "#a78bfa",  bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.25)", Icon: Shield    },
  user:         { label: "User",          color: "#22d3ee",  bg: "rgba(34,211,238,0.12)",  border: "rgba(34,211,238,0.25)",  Icon: User      },
  api_consumer: { label: "API Consumer",  color: "#94a3b8",  bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.25)", Icon: Bot       },
};

/* ── Avatar Circle ── */
function AvatarCircle({ name, size = 36 }) {
  const initials = (name || "U")
    .split(" ")
    .map((w) => w[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #7a0000 0%, #CC0000 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontSize: size * 0.36, fontWeight: 700,
      flexShrink: 0, userSelect: "none",
      boxShadow: "0 2px 8px rgba(204,0,0,0.3)",
    }}>
      {initials}
    </div>
  );
}

/* ── Role Badge ── */
function RoleBadge({ role }) {
  const cfg = ROLES[role] || ROLES.user;
  return (
    <span style={{
      fontSize: 11, padding: "2px 9px", borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      <cfg.Icon size={9} />
      {cfg.label}
    </span>
  );
}

/* ── User Row ── */
function UserRow({ u, isSuperAdmin, onRoleChange, onDeactivate, currentUserId }) {
  const isMe = u.id === currentUserId;
  const fmt = (v) => v ? dayjs(v).fromNow() : "—";
  const [changing, setChanging] = useState(false);

  const handleRole = async (e) => {
    const role = e.target.value;
    setChanging(true);
    try {
      await usersAPI.update(u.id, { role });
      toast.success(`Role updated to ${ROLES[role]?.label || role}`);
      onRoleChange();
    } catch {
      toast.error("Failed to update role");
    } finally {
      setChanging(false);
    }
  };

  return (
    <tr style={{ opacity: u.is_active ? 1 : 0.55 }}>
      {/* User */}
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AvatarCircle name={u.name || u.email} size={34} />
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "var(--text)", fontWeight: 600, fontSize: 13 }}>
              {u.name || "—"}
              {isMe && (
                <span style={{
                  marginLeft: 6, fontSize: 9, color: "var(--accent)",
                  border: "1px solid var(--accent)", padding: "0 5px",
                  borderRadius: 4, fontWeight: 700,
                }}>YOU</span>
              )}
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {u.email}
            </div>
          </div>
        </div>
      </td>

      {/* Role */}
      <td>
        {isSuperAdmin && !isMe ? (
          <select
            className="ongc-select"
            value={u.role}
            onChange={handleRole}
            disabled={changing}
            style={{ fontSize: 11, padding: "4px 8px", minWidth: 130 }}
          >
            {Object.entries(ROLES).map(([k, { label }]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        ) : (
          <RoleBadge role={u.role} />
        )}
      </td>

      {/* Status */}
      <td>
        <span style={{
          fontSize: 10, padding: "2px 9px", borderRadius: 20, fontWeight: 700,
          background: u.is_active ? "var(--badge-active)" : "var(--badge-revoked)",
          color: u.is_active ? "var(--badge-active-text)" : "var(--badge-revoked-text)",
        }}>
          {u.is_active ? "Active" : "Inactive"}
        </span>
      </td>

      {/* Last Login */}
      <td style={{ color: "var(--text3)", fontSize: 12, whiteSpace: "nowrap" }}>
        {fmt(u.last_login_at)}
      </td>

      {/* Joined */}
      <td style={{ color: "var(--text3)", fontSize: 12, whiteSpace: "nowrap" }}>
        {u.created_at ? dayjs(u.created_at).format("DD MMM YYYY") : "—"}
      </td>

      {/* Actions */}
      <td>
        {!isMe && u.is_active ? (
          <button
            className="ongc-btn-ghost danger"
            onClick={() => onDeactivate(u.id)}
            title="Deactivate user"
            style={{ fontSize: 12, gap: 5 }}
          >
            <UserX size={13} /> Deactivate
          </button>
        ) : (
          <span style={{ color: "var(--text3)", fontSize: 12 }}>—</span>
        )}
      </td>
    </tr>
  );
}

/* ── RBAC Legend Card ── */
function RbacCard({ roleKey }) {
  const cfg = ROLES[roleKey];
  const descriptions = {
    super_admin:  ["Full platform control", "Create & manage all users", "All CRUD on profiles & tokens", "Can change any user's role"],
    admin:        ["Manage DB profiles & tokens", "View audit logs & users", "Cannot change super_admin role", "Access to schema manager"],
    user:         ["Run natural-language queries", "View own query history", "Manage own API tokens", "Read-only schema access"],
    api_consumer: ["API-only access via token", "Submit queries programmatically", "No web UI access", "Token usage tracked"],
  };
  return (
    <div className="ongc-card" style={{
      padding: "16px 18px",
      borderTop: `3px solid ${cfg.color}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <cfg.Icon size={14} color={cfg.color} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{cfg.label}</span>
      </div>
      <ul style={{ margin: 0, padding: "0 0 0 16px", listStyle: "disc" }}>
        {descriptions[roleKey].map((d) => (
          <li key={d} style={{ color: "var(--text3)", fontSize: 12, lineHeight: 1.8 }}>{d}</li>
        ))}
      </ul>
    </div>
  );
}

/* ── Main Page ── */
export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user: me, isSuperAdmin } = useAuth();

  const load = () => {
    setLoading(true);
    usersAPI.list().then((r) => setUsers(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleDeactivate = async (userId) => {
    try {
      await usersAPI.deactivate(userId);
      toast.success("User deactivated");
      load();
    } catch {
      toast.error("Deactivate failed");
    }
  };

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q)
    );
  });

  const roleCounts = Object.fromEntries(
    Object.keys(ROLES).map((k) => [k, users.filter((u) => u.role === k).length])
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, animation: "fadeIn 0.4s ease" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage platform users, roles, and access control</p>
        </div>
        <button className="ongc-btn-ghost" onClick={load} disabled={loading} style={{ gap: 6 }}>
          <RefreshCw size={14} style={loading ? { animation: "spin 0.8s linear infinite" } : {}} />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      {!loading && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="ongc-card" style={{ padding: "12px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <UsersIcon size={12} color="var(--accent)" />
              <span style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 0.8 }}>Total</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{users.length}</div>
          </div>
          {Object.entries(ROLES).map(([k, { label, color, bg, border, Icon }]) => (
            roleCounts[k] > 0 && (
              <div key={k} className="ongc-card" style={{ padding: "12px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                  <Icon size={11} color={color} />
                  <span style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color }}>{roleCounts[k]}</div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 380 }}>
        <Search size={14} style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          color: "var(--text3)", pointerEvents: "none",
        }} />
        <input
          className="ongc-input"
          placeholder="Search by name, email, or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
      </div>

      {/* Table */}
      <div className="ongc-card" style={{ overflow: "hidden", padding: 0 }}>
        <div style={{
          padding: "14px 18px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "rgba(204,0,0,0.1)", border: "1px solid rgba(204,0,0,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <UsersIcon size={13} color="var(--accent)" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
            Platform Users
          </span>
          <span style={{ fontSize: 12, color: "var(--text3)", marginLeft: "auto" }}>
            {filtered.length} of {users.length}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: "var(--text3)" }}>
            <div style={{ fontSize: 24, marginBottom: 10, display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</div>
            <div style={{ fontSize: 13 }}>Loading users…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: "var(--text3)" }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>👤</div>
            <div style={{ fontSize: 13 }}>{search ? "No users match your search" : "No users found"}</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="ongc-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <UserRow
                    key={u.id}
                    u={u}
                    isSuperAdmin={isSuperAdmin?.()}
                    onRoleChange={load}
                    onDeactivate={handleDeactivate}
                    currentUserId={me?.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RBAC Legend */}
      <div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          marginBottom: 14,
        }}>
          <ShieldCheck size={15} color="var(--accent)" />
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Role-Based Access Control</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {Object.keys(ROLES).map((k) => <RbacCard key={k} roleKey={k} />)}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
