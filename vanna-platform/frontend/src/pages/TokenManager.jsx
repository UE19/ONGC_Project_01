import React, { useEffect, useState } from "react";
import { tokensAPI, profilesAPI } from "../services/api";
import toast from "react-hot-toast";
import { Plus, Copy, RotateCw, Ban, Key, Trash2, AlertTriangle, X, CheckCircle2, Clock } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

/* ── Confirm Delete Modal ── */
function DeleteModal({ token, onClose, onConfirm, deleting }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 420 }}>
        <div style={{ padding: "24px 24px 20px", textAlign: "center" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Trash2 size={22} color="#f87171" />
          </div>
          <h3 style={{ color: "var(--text)", fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>
            Delete Token?
          </h3>
          <p style={{ color: "var(--text2)", fontSize: 13, margin: "0 0 6px", lineHeight: 1.6 }}>
            Permanently delete <strong style={{ color: "var(--text)" }}>"{token.name}"</strong>?
          </p>
          <div style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 12,
            color: "#f87171",
            display: "flex", alignItems: "flex-start", gap: 8,
            textAlign: "left",
            marginTop: 14,
          }}>
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Any applications using this token will immediately lose access. This cannot be undone.</span>
          </div>
        </div>
        <div style={{
          padding: "16px 24px 20px",
          display: "flex", gap: 10,
          borderTop: "1px solid var(--border)",
        }}>
          <button
            className="ongc-btn-secondary"
            onClick={onClose}
            style={{ flex: 1, justifyContent: "center" }}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{
              flex: 1,
              background: deleting ? "#991111" : "#CC0000",
              color: "white", border: "none",
              borderRadius: 9, padding: "11px",
              fontSize: 14, fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              transition: "background 0.2s",
            }}
          >
            <Trash2 size={14} />
            {deleting ? "Deleting…" : "Delete Token"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Create Token Modal ── */
function TokenModal({ onClose, onSave }) {
  const [profiles, setProfiles] = useState([]);
  const [form, setForm] = useState({
    name: "", description: "", profile_id: "", permissions: ["query"],
    rate_limit_per_minute: 60, expires_at: "",
  });
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    profilesAPI.list().then((r) => setProfiles(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, expires_at: form.expires_at || null };
      const { data } = await tokensAPI.create(payload);
      setCreated(data);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create token");
    } finally {
      setSaving(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(created.raw_token);
    setCopied(true);
    toast.success("Token copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (created) {
    return (
      <div className="modal-overlay">
        <div className="modal-box">
          <div style={{ padding: "28px 28px 24px" }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <CheckCircle2 size={22} color="#4ade80" />
            </div>
            <h2 style={{ color: "var(--text)", fontWeight: 700, fontSize: 18, textAlign: "center", margin: "0 0 8px" }}>
              Token Generated!
            </h2>
            <div style={{
              padding: "10px 14px",
              background: "rgba(234,179,8,0.08)",
              border: "1px solid rgba(234,179,8,0.25)",
              borderRadius: 8,
              fontSize: 12,
              color: "#facc15",
              display: "flex", alignItems: "center", gap: 8,
              marginBottom: 16,
            }}>
              <AlertTriangle size={13} style={{ flexShrink: 0 }} />
              Copy this token now — it will <strong>never</strong> be shown again.
            </div>

            {/* Token display */}
            <div style={{
              background: "var(--card2)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <code style={{
                flex: 1, fontSize: 12,
                color: "#4ade80",
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}>
                {created.raw_token}
              </code>
              <button
                onClick={copyToken}
                style={{
                  padding: "6px 12px",
                  background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.07)",
                  border: "1px solid var(--border2)",
                  borderRadius: 7,
                  color: copied ? "#4ade80" : "var(--text2)",
                  fontSize: 12, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                <Copy size={12} />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <button
              onClick={() => { onSave(); onClose(); }}
              className="ongc-btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 20, padding: "12px" }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: "rgba(204,0,0,0.12)",
              border: "1px solid rgba(204,0,0,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Key size={16} color="var(--accent)" />
            </div>
            <div>
              <h2 style={{ color: "var(--text)", fontWeight: 700, fontSize: 16, margin: 0 }}>Generate API Token</h2>
              <p style={{ color: "var(--text3)", fontSize: 12, margin: "2px 0 0" }}>Create a token for external API access</p>
            </div>
          </div>
          <button className="ongc-btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "22px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="ongc-label">Token Name *</label>
            <input
              required
              className="ongc-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. HR Dashboard Token"
            />
          </div>

          <div>
            <label className="ongc-label">Database Profile *</label>
            <select
              required
              className="ongc-select"
              value={form.profile_id}
              onChange={(e) => setForm({ ...form, profile_id: e.target.value })}
            >
              <option value="">Select a database profile…</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.profile_name} ({p.db_type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label className="ongc-label">Rate Limit / minute</label>
              <input
                type="number"
                className="ongc-input"
                value={form.rate_limit_per_minute}
                min={1} max={1000}
                onChange={(e) => setForm({ ...form, rate_limit_per_minute: +e.target.value })}
              />
            </div>
            <div>
              <label className="ongc-label">Expires At (optional)</label>
              <input
                type="datetime-local"
                className="ongc-input"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 4 }}>
            <button type="button" className="ongc-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="ongc-btn-primary" disabled={saving}>
              <Key size={14} />
              {saving ? "Generating…" : "Generate Token"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Status Badge ── */
function StatusBadge({ status }) {
  const cls = { active: "badge-active", revoked: "badge-revoked", expired: "badge-expired" };
  return <span className={cls[status] || "badge-expired"}>{status}</span>;
}

/* ── Token Card ── */
function TokenCard({ token, onRevoke, onRotate, onDelete }) {
  return (
    <div className="ongc-card-accent" style={{
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      transition: "box-shadow 0.2s",
      animation: "slideUp 0.3s ease",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,0,0,0.2)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
    >
      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 11,
        background: token.status === "active" ? "rgba(204,0,0,0.1)" : "rgba(100,100,100,0.08)",
        border: `1px solid ${token.status === "active" ? "rgba(204,0,0,0.25)" : "var(--border)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Key size={19} color={token.status === "active" ? "var(--accent)" : "var(--text3)"} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ color: "var(--text)", fontWeight: 600, fontSize: 14 }}>{token.name}</span>
          <StatusBadge status={token.status} />
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4, display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <RotateCw size={10} />
            {token.total_requests ?? 0} requests
          </span>
          <span>Rate: {token.rate_limit_per_minute}/min</span>
          {token.expires_at && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={10} />
              Expires {dayjs(token.expires_at).format("MMM D, YYYY")}
            </span>
          )}
          {token.last_used_at && (
            <span>Last used {dayjs(token.last_used_at).fromNow()}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        {token.status === "active" && (
          <>
            <button
              onClick={() => onRotate(token.id)}
              className="ongc-btn-ghost info"
              title="Rotate token — revokes current and issues new"
            >
              <RotateCw size={15} />
            </button>
            <button
              onClick={() => onRevoke(token.id)}
              className="ongc-btn-ghost warn"
              title="Revoke token — disables access without deleting"
            >
              <Ban size={15} />
            </button>
          </>
        )}
        <button
          onClick={() => onDelete(token)}
          className="ongc-btn-ghost danger"
          title="Delete token permanently"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function TokenManager() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    tokensAPI.list().then((r) => setTokens(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleRevoke = async (id) => {
    if (!confirm("Revoke this token? Applications using it will lose access immediately.")) return;
    try {
      await tokensAPI.revoke(id);
      toast.success("Token revoked");
      load();
    } catch { toast.error("Failed to revoke token"); }
  };

  const handleRotate = async (id) => {
    if (!confirm("Rotate token? The old token is revoked and a new one is generated.")) return;
    try {
      const { data } = await tokensAPI.rotate(id);
      navigator.clipboard.writeText(data.raw_token);
      toast.success("Token rotated — new token copied to clipboard!");
      load();
    } catch { toast.error("Failed to rotate token"); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await tokensAPI.delete(deleteTarget.id);
      toast.success(`Token "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete token");
    } finally {
      setDeleting(false);
    }
  };

  const activeTokens = tokens.filter((t) => t.status === "active");
  const inactiveTokens = tokens.filter((t) => t.status !== "active");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1 className="page-title">API Tokens</h1>
          <p className="page-subtitle">Create and manage tokens for external application access</p>
        </div>
        <button className="ongc-btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Generate Token
        </button>
      </div>

      {/* Stats row */}
      {!loading && tokens.length > 0 && (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {[
            { label: "Total Tokens", value: tokens.length, color: "var(--text2)" },
            { label: "Active", value: activeTokens.length, color: "#4ade80" },
            { label: "Revoked / Expired", value: inactiveTokens.length, color: "#f87171" },
          ].map(({ label, value, color }) => (
            <div key={label} className="ongc-card" style={{ padding: "14px 20px", minWidth: 120 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Token list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text3)" }}>
          <div style={{ fontSize: 32, marginBottom: 12, animation: "pulse-glow 1.5s infinite" }}>⟳</div>
          Loading tokens…
        </div>
      ) : tokens.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "var(--card)",
            border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <Key size={28} color="var(--text3)" />
          </div>
          <div style={{ color: "var(--text)", fontWeight: 600, fontSize: 16, marginBottom: 6 }}>No tokens yet</div>
          <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 24 }}>
            Generate your first token to enable external application access
          </div>
          <button className="ongc-btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Generate Your First Token
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Active tokens */}
          {activeTokens.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
                Active Tokens ({activeTokens.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activeTokens.map((t) => (
                  <TokenCard
                    key={t.id}
                    token={t}
                    onRevoke={handleRevoke}
                    onRotate={handleRotate}
                    onDelete={(tok) => setDeleteTarget(tok)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive tokens */}
          {inactiveTokens.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
                Revoked / Expired ({inactiveTokens.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {inactiveTokens.map((t) => (
                  <TokenCard
                    key={t.id}
                    token={t}
                    onRevoke={handleRevoke}
                    onRotate={handleRotate}
                    onDelete={(tok) => setDeleteTarget(tok)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showModal && <TokenModal onClose={() => setShowModal(false)} onSave={load} />}
      {deleteTarget && (
        <DeleteModal
          token={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}
