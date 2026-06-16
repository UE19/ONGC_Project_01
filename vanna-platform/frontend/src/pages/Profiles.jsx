import React, { useEffect, useState } from "react";
import { profilesAPI } from "../services/api";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit, TestTube, RefreshCw, CheckCircle, XCircle } from "lucide-react";

const DB_TYPES = ["postgresql", "mysql", "mariadb", "mssql", "oracle", "mongodb"];
const SSL_MODES = ["disable", "require", "verify-ca", "verify-full"];
const DEFAULT_PORTS = { postgresql: 5432, mysql: 3306, mariadb: 3306, mssql: 1433, oracle: 1521, mongodb: 27017 };

function ProfileModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState(profile || {
    profile_name: "", description: "", db_type: "postgresql", host: "", port: 5432,
    database_name: "", username: "", password: "", ssl_mode: "disable",
    allowed_schemas: [], allowed_tables: [],
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (profile) {
        await profilesAPI.update(profile.id, form);
      } else {
        await profilesAPI.create(form);
      }
      toast.success(profile ? "Profile updated" : "Profile created");
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const inp = (label, key, type = "text", required = true) => (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type={type} required={required} value={form[key] || ""}
        onChange={(e) => set(key, type === "number" ? +e.target.value : e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold">{profile ? "Edit Profile" : "New Connection Profile"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">{inp("Profile Name", "profile_name")}</div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea rows={2} value={form.description || ""} onChange={(e) => set("description", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Database Type</label>
            <select value={form.db_type} onChange={(e) => { set("db_type", e.target.value); set("port", DEFAULT_PORTS[e.target.value] || 5432); }}
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
              {DB_TYPES.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">SSL Mode</label>
            <select value={form.ssl_mode} onChange={(e) => set("ssl_mode", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
              {SSL_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {inp("Host / IP", "host")}
          {inp("Port", "port", "number")}
          {inp("Database Name", "database_name")}
          {inp("Username", "username")}
          {inp("Password", "password", "password")}
          <div className="col-span-2 bg-indigo-900/20 border border-indigo-800 rounded-lg p-3 text-xs text-indigo-300">
            🔒 Phase-1: All connections are enforced as Read-Only. INSERT/UPDATE/DELETE/DROP operations are blocked.
          </div>
          <div className="col-span-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg disabled:opacity-60">
              {saving ? "Saving…" : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "new" | profile_obj
  const [testing, setTesting] = useState(null);

  const load = () => profilesAPI.list().then((r) => setProfiles(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleTest = async (profile) => {
    setTesting(profile.id);
    try {
      const { data } = await profilesAPI.test(profile.id);
      toast[data.success ? "success" : "error"](data.message + (data.latency_ms ? ` (${data.latency_ms}ms)` : ""));
      load();
    } catch (err) {
      toast.error("Test failed");
    } finally {
      setTesting(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this profile? All associated tokens will also be removed.")) return;
    try {
      await profilesAPI.delete(id);
      toast.success("Profile deleted");
      load();
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Connection Profiles</h1>
          <p className="text-gray-400 text-sm">Manage database connection configurations</p>
        </div>
        <button onClick={() => setModal("new")}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg">
          <Plus size={16} /> New Profile
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm py-10 text-center">Loading…</div>
      ) : profiles.length === 0 ? (
        <div className="text-gray-500 text-sm py-20 text-center">No profiles yet. Create one to get started.</div>
      ) : (
        <div className="grid gap-3">
          {profiles.map((p) => (
            <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{p.profile_name}</span>
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{p.db_type.toUpperCase()}</span>
                  {p.read_only && <span className="text-xs bg-yellow-900/40 text-yellow-400 px-2 py-0.5 rounded">READ-ONLY</span>}
                  {p.is_active ? (
                    <span className="text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded">Active</span>
                  ) : (
                    <span className="text-xs bg-red-900/40 text-red-400 px-2 py-0.5 rounded">Inactive</span>
                  )}
                </div>
                <div className="text-gray-400 text-xs mt-1">{p.username}@{p.host}:{p.port}/{p.database_name}</div>
                {p.last_tested_at && (
                  <div className="flex items-center gap-1 text-xs mt-1">
                    {p.last_test_success
                      ? <><CheckCircle size={11} className="text-green-400" /><span className="text-green-400">Connected</span></>
                      : <><XCircle size={11} className="text-red-400" /><span className="text-red-400">Failed</span></>}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleTest(p)} disabled={testing === p.id}
                  className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-gray-800 rounded-lg transition-colors" title="Test connection">
                  {testing === p.id ? <RefreshCw size={15} className="animate-spin" /> : <TestTube size={15} />}
                </button>
                <button onClick={() => setModal(p)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
                  <Edit size={15} />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ProfileModal
          profile={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
