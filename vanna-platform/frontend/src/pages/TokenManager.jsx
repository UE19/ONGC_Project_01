import React, { useEffect, useState } from "react";
import { tokensAPI, profilesAPI } from "../services/api";
import toast from "react-hot-toast";
import { Plus, Copy, RotateCw, Ban, Eye, EyeOff, Key } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

function TokenModal({ onClose, onSave }) {
  const [profiles, setProfiles] = useState([]);
  const [form, setForm] = useState({
    name: "", description: "", profile_id: "", permissions: ["query"],
    rate_limit_per_minute: 60, expires_at: "",
  });
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null); // {raw_token, ...}

  useEffect(() => {
    profilesAPI.list().then((r) => setProfiles(r.data));
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

  if (created) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg p-6">
          <h2 className="text-white font-semibold mb-2">Token Created!</h2>
          <p className="text-yellow-400 text-xs mb-4">⚠ Copy this token now — it will never be shown again.</p>
          <div className="bg-gray-800 rounded-lg p-3 font-mono text-sm text-green-400 break-all flex items-center gap-2">
            <span className="flex-1">{created.raw_token}</span>
            <button onClick={() => { navigator.clipboard.writeText(created.raw_token); toast.success("Copied!"); }}
              className="text-gray-400 hover:text-white"><Copy size={14} /></button>
          </div>
          <button onClick={() => { onSave(); onClose(); }}
            className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2.5 rounded-lg">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold">Generate API Token</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Token Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              placeholder="HR Assistant Token" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Database Profile</label>
            <select required value={form.profile_id} onChange={(e) => setForm({ ...form, profile_id: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
              <option value="">Select profile…</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.profile_name} ({p.db_type.toUpperCase()})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Rate Limit / min</label>
              <input type="number" value={form.rate_limit_per_minute}
                onChange={(e) => setForm({ ...form, rate_limit_per_minute: +e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Expires At (optional)</label>
              <input type="datetime-local" value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg disabled:opacity-60">
              {saving ? "Generating…" : "Generate Token"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const statusColor = { active: "text-green-400 bg-green-900/30", revoked: "text-red-400 bg-red-900/30", expired: "text-yellow-400 bg-yellow-900/30" };

export default function TokenManager() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = () => tokensAPI.list().then((r) => setTokens(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleRevoke = async (id) => {
    if (!confirm("Revoke this token? Applications using it will lose access immediately.")) return;
    try {
      await tokensAPI.revoke(id);
      toast.success("Token revoked");
      load();
    } catch { toast.error("Failed"); }
  };

  const handleRotate = async (id) => {
    if (!confirm("Rotate token? Old token is revoked and a new one is generated.")) return;
    try {
      const { data } = await tokensAPI.rotate(id);
      navigator.clipboard.writeText(data.raw_token);
      toast.success("Token rotated — new token copied to clipboard!");
      load();
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">API Tokens</h1>
          <p className="text-gray-400 text-sm">Manage tokens for external application access</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg">
          <Plus size={16} /> Generate Token
        </button>
      </div>

      {loading ? <div className="text-gray-400 text-sm py-10 text-center">Loading…</div>
        : tokens.length === 0 ? <div className="text-gray-500 text-sm py-20 text-center">No tokens yet.</div>
        : (
          <div className="space-y-3">
            {tokens.map((t) => (
              <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
                <div className="p-2 bg-gray-800 rounded-lg"><Key size={18} className="text-indigo-400" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{t.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor[t.status] || "text-gray-400 bg-gray-800"}`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {t.total_requests} requests · Rate: {t.rate_limit_per_minute}/min
                    {t.expires_at && ` · Expires: ${dayjs(t.expires_at).format("MMM D, YYYY")}`}
                    {t.last_used_at && ` · Last used: ${dayjs(t.last_used_at).fromNow()}`}
                  </div>
                </div>
                <div className="flex gap-2">
                  {t.status === "active" && (
                    <>
                      <button onClick={() => handleRotate(t.id)} className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-gray-800 rounded-lg" title="Rotate token">
                        <RotateCw size={15} />
                      </button>
                      <button onClick={() => handleRevoke(t.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg" title="Revoke token">
                        <Ban size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      {showModal && <TokenModal onClose={() => setShowModal(false)} onSave={load} />}
    </div>
  );
}
