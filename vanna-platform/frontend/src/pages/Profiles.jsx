import React, { useEffect, useState } from "react";
import { profilesAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  Plus, Trash2, Edit, RefreshCw, CheckCircle, XCircle,
  Database, Lock, Server, X, AlertTriangle, Wifi, WifiOff,
} from "lucide-react";

const DB_TYPES = ["postgresql", "mysql", "mariadb", "mssql", "oracle", "mongodb"];
const SSL_MODES = ["disable", "require", "verify-ca", "verify-full"];
const DEFAULT_PORTS = { postgresql: 5432, mysql: 3306, mariadb: 3306, mssql: 1433, oracle: 1521, mongodb: 27017 };

const DB_ICONS = {
  postgresql: "🐘", mysql: "🐬", mariadb: "🦭", mssql: "🪟", oracle: "🔴", mongodb: "🍃",
};
const DB_COLORS = {
  postgresql: "#336791", mysql: "#4479A1", mariadb: "#003545",
  mssql: "#CC2927", oracle: "#F80000", mongodb: "#47A248",
};

/* ── Profile Modal ── */
function ProfileModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState(profile ? { ...profile } : {
    profile_name: "", description: "", db_type: "postgresql", host: "", port: 5432,
    database_name: "", username: "", password: "", ssl_mode: "disable",
    allowed_schemas: [], allowed_tables: [],
  });
  const [saving, setSaving] = useState(false);
  const isEdit = !!profile;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await profilesAPI.update(profile.id, form);
      } else {
        await profilesAPI.create(form);
      }
      toast.success(isEdit ? "Profile updated" : "Profile created");
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, name, type = "text", required = true, span = 1 }) => (
    <div style={{ gridColumn: span === 2 ? "span 2" : "span 1" }}>
      <label className="ongc-label">{label}{required && " *"}</label>
      <input
        className="ongc-input"
        type={type}
        required={required}
        value={form[name] || ""}
        onChange={(e) => set(name, type === "number" ? +e.target.value : e.target.value)}
      />
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 620, maxHeight: "92vh", overflowY: "auto" }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: `${DB_COLORS[form.db_type] || "#CC0000"}22`,
              border: `1px solid ${DB_COLORS[form.db_type] || "#CC0000"}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>
              {DB_ICONS[form.db_type] || "🗄️"}
            </div>
            <div>
              <h2 style={{ color: "var(--text)", fontWeight: 700, fontSize: 16, margin: 0 }}>
                {isEdit ? "Edit Connection Profile" : "New Connection Profile"}
              </h2>
              <p style={{ color: "var(--text3)", fontSize: 12, margin: "2px 0 0" }}>
                Configure database connection details
              </p>
            </div>
          </div>
          <button className="ongc-btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "22px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            <Field label="Profile Name" name="profile_name" span={2} />

            <div style={{ gridColumn: "span 2" }}>
              <label className="ongc-label">Description</label>
              <textarea
                className="ongc-input"
                rows={2}
                value={form.description || ""}
                onChange={(e) => set("description", e.target.value)}
                style={{ resize: "none" }}
              />
            </div>

            <div>
              <label className="ongc-label">Database Type *</label>
              <select
                className="ongc-select"
                value={form.db_type}
                onChange={(e) => { set("db_type", e.target.value); set("port", DEFAULT_PORTS[e.target.value] || 5432); }}
              >
                {DB_TYPES.map((t) => (
                  <option key={t} value={t}>{DB_ICONS[t]} {t.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="ongc-label">SSL Mode</label>
              <select className="ongc-select" value={form.ssl_mode} onChange={(e) => set("ssl_mode", e.target.value)}>
                {SSL_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <Field label="Host / IP Address" name="host" />
            <Field label="Port" name="port" type="number" />
            <Field label="Database Name" name="database_name" />
            <Field label="Username" name="username" />
            <Field label="Password" name="password" type="password" />
          </div>

          {/* Read-only notice */}
          <div style={{
            marginTop: 18,
            padding: "11px 14px",
            background: "rgba(204,0,0,0.07)",
            border: "1px solid rgba(204,0,0,0.2)",
            borderRadius: 9,
            fontSize: 12,
            color: "var(--text2)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <Lock size={13} color="var(--accent)" style={{ flexShrink: 0 }} />
            Phase-1: All connections are enforced as <strong style={{ color: "var(--accent)" }}>Read-Only</strong>.
            INSERT / UPDATE / DELETE / DROP operations are blocked at the API layer.
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <button type="button" className="ongc-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="ongc-btn-primary" disabled={saving}>
              <Database size={14} />
              {saving ? "Saving…" : isEdit ? "Update Profile" : "Create Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Delete Confirm Modal ── */
function DeleteModal({ profile, onClose, onConfirm, deleting }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 420 }}>
        <div style={{ padding: "28px 24px 20px", textAlign: "center" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <AlertTriangle size={22} color="#f87171" />
          </div>
          <h3 style={{ color: "var(--text)", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>Delete Profile?</h3>
          <p style={{ color: "var(--text2)", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
            This will permanently delete <strong style={{ color: "var(--text)" }}>"{profile.profile_name}"</strong> and revoke all associated API tokens.
          </p>
        </div>
        <div style={{ padding: "14px 24px 22px", display: "flex", gap: 10, borderTop: "1px solid var(--border)" }}>
          <button className="ongc-btn-secondary" onClick={onClose} disabled={deleting} style={{ flex: 1 }}>Cancel</button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{
              flex: 1, background: "#CC0000", color: "white", border: "none",
              borderRadius: 9, padding: "11px", fontSize: 14, fontWeight: 600,
              cursor: deleting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              opacity: deleting ? 0.7 : 1,
            }}
          >
            <Trash2 size={14} />
            {deleting ? "Deleting…" : "Delete Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Profile Card ── */
function ProfileCard({ profile, onTest, onEdit, onDelete, testing }) {
  const color = DB_COLORS[profile.db_type] || "#CC0000";
  const icon = DB_ICONS[profile.db_type] || "🗄️";
  const isTestingThis = testing === profile.id;

  return (
    <div
      className="ongc-card"
      style={{
        padding: "18px 20px",
        borderTop: `3px solid ${color}`,
        transition: "transform 0.18s, box-shadow 0.18s",
        animation: "slideUp 0.3s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.22)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* DB Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: `${color}18`,
          border: `1px solid ${color}35`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, flexShrink: 0,
        }}>
          {icon}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ color: "var(--text)", fontWeight: 700, fontSize: 15 }}>{profile.profile_name}</span>
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 20,
              background: `${color}18`, color: color,
              fontWeight: 700, letterSpacing: 0.5,
              border: `1px solid ${color}35`,
            }}>
              {profile.db_type.toUpperCase()}
            </span>
            {profile.read_only && (
              <span style={{
                fontSize: 10, padding: "2px 8px", borderRadius: 20,
                background: "rgba(234,179,8,0.12)", color: "#facc15",
                fontWeight: 600, border: "1px solid rgba(234,179,8,0.25)",
              }}>
                READ-ONLY
              </span>
            )}
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 20,
              background: profile.is_active ? "var(--badge-active)" : "var(--badge-revoked)",
              color: profile.is_active ? "var(--badge-active-text)" : "var(--badge-revoked-text)",
              fontWeight: 600,
            }}>
              {profile.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, fontSize: 12, color: "var(--text3)" }}>
            <Server size={11} />
            <span style={{ fontFamily: "monospace" }}>
              {profile.username}@{profile.host}:{profile.port}/{profile.database_name}
            </span>
          </div>

          {profile.description && (
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4, fontStyle: "italic" }}>
              {profile.description}
            </div>
          )}

          {profile.last_tested_at && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, fontSize: 11 }}>
              {profile.last_test_success ? (
                <><Wifi size={11} color="var(--badge-active-text)" /><span style={{ color: "var(--badge-active-text)" }}>Connection verified</span></>
              ) : (
                <><WifiOff size={11} color="var(--badge-revoked-text)" /><span style={{ color: "var(--badge-revoked-text)" }}>Last test failed</span></>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button
            onClick={() => onTest(profile)}
            disabled={isTestingThis}
            className="ongc-btn-ghost info"
            title="Test connection"
          >
            {isTestingThis
              ? <RefreshCw size={15} style={{ animation: "spin 0.8s linear infinite" }} />
              : <Wifi size={15} />
            }
          </button>
          <button onClick={() => onEdit(profile)} className="ongc-btn-ghost" title="Edit profile">
            <Edit size={15} />
          </button>
          <button onClick={() => onDelete(profile)} className="ongc-btn-ghost danger" title="Delete profile">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [testing, setTesting] = useState(null);

  const load = () => {
    setLoading(true);
    profilesAPI.list().then((r) => setProfiles(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleTest = async (profile) => {
    setTesting(profile.id);
    try {
      const { data } = await profilesAPI.test(profile.id);
      toast[data.success ? "success" : "error"](
        data.message + (data.latency_ms ? ` (${data.latency_ms}ms)` : "")
      );
      load();
    } catch {
      toast.error("Connection test failed");
    } finally {
      setTesting(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await profilesAPI.delete(deleteTarget.id);
      toast.success(`Profile "${deleteTarget.profile_name}" deleted`);
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const activeProfiles = profiles.filter((p) => p.is_active);
  const inactiveProfiles = profiles.filter((p) => !p.is_active);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeIn 0.4s ease" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1 className="page-title">Connection Profiles</h1>
          <p className="page-subtitle">Manage database connections for AI-powered queries</p>
        </div>
        <button className="ongc-btn-primary" onClick={() => setModal("new")}>
          <Plus size={16} /> New Profile
        </button>
      </div>

      {/* Stats */}
      {!loading && profiles.length > 0 && (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {[
            { label: "Total Profiles", value: profiles.length, color: "var(--text2)" },
            { label: "Active", value: activeProfiles.length, color: "var(--badge-active-text)" },
            { label: "Database Types", value: new Set(profiles.map(p => p.db_type)).size, color: "#22d3ee" },
          ].map(({ label, value, color }) => (
            <div key={label} className="ongc-card" style={{ padding: "14px 20px", minWidth: 120 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* DB type legend */}
      {!loading && profiles.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {Object.entries(DB_ICONS).map(([type, icon]) => {
            const count = profiles.filter(p => p.db_type === type).length;
            if (!count) return null;
            return (
              <div key={type} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 12px",
                background: `${DB_COLORS[type]}14`,
                border: `1px solid ${DB_COLORS[type]}35`,
                borderRadius: 20, fontSize: 12,
                color: DB_COLORS[type],
                fontWeight: 600,
              }}>
                {icon} {type.toUpperCase()} <span style={{ opacity: 0.7 }}>×{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Profile list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text3)" }}>
          <div style={{ fontSize: 32, marginBottom: 14 }}>⟳</div>
          Loading profiles…
        </div>
      ) : profiles.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "var(--card)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px", fontSize: 28,
          }}>
            🗄️
          </div>
          <div style={{ color: "var(--text)", fontWeight: 600, fontSize: 16, marginBottom: 8 }}>No profiles yet</div>
          <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 24 }}>
            Create your first database connection profile to start querying
          </div>
          <button className="ongc-btn-primary" onClick={() => setModal("new")}>
            <Plus size={15} /> Create First Profile
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {activeProfiles.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--badge-active-text)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>
                Active ({activeProfiles.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activeProfiles.map((p) => (
                  <ProfileCard
                    key={p.id}
                    profile={p}
                    onTest={handleTest}
                    onEdit={(prof) => setModal(prof)}
                    onDelete={(prof) => setDeleteTarget(prof)}
                    testing={testing}
                  />
                ))}
              </div>
            </div>
          )}
          {inactiveProfiles.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>
                Inactive ({inactiveProfiles.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {inactiveProfiles.map((p) => (
                  <ProfileCard
                    key={p.id}
                    profile={p}
                    onTest={handleTest}
                    onEdit={(prof) => setModal(prof)}
                    onDelete={(prof) => setDeleteTarget(prof)}
                    testing={testing}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {modal && (
        <ProfileModal
          profile={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          profile={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
