import React, { useEffect, useState } from "react";
import { usersAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { UserCog, UserX, ShieldCheck } from "lucide-react";
import dayjs from "dayjs";

const ROLE_COLOR = {
  super_admin: "bg-red-900/40 text-red-400",
  admin: "bg-purple-900/40 text-purple-400",
  user: "bg-blue-900/40 text-blue-400",
  api_consumer: "bg-gray-800 text-gray-400",
};

const ROLES = ["super_admin", "admin", "user", "api_consumer"];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: me, isSuperAdmin } = useAuth();

  const load = () => usersAPI.list().then((r) => setUsers(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await usersAPI.update(userId, { role });
      toast.success("Role updated");
      load();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const handleDeactivate = async (userId) => {
    if (!confirm("Deactivate this user?")) return;
    try {
      await usersAPI.deactivate(userId);
      toast.success("User deactivated");
      load();
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">User Management</h1>
        <p className="text-gray-400 text-sm">Manage users and role-based access control</p>
      </div>

      {loading ? <div className="text-gray-400 text-sm py-10 text-center">Loading…</div> : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800">
                {["User", "Role", "Status", "Last Login", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-800 hover:bg-gray-800/40">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{u.full_name || u.username}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {isSuperAdmin() && u.id !== me?.id ? (
                      <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-indigo-500">
                        {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded ${ROLE_COLOR[u.role]}`}>{u.role.replace("_", " ")}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${u.is_active ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{u.last_login ? dayjs(u.last_login).format("MMM D, HH:mm") : "Never"}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{dayjs(u.created_at).format("MMM D, YYYY")}</td>
                  <td className="px-4 py-3">
                    {u.id !== me?.id && u.is_active && (
                      <button onClick={() => handleDeactivate(u.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg" title="Deactivate">
                        <UserX size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* RBAC legend */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2"><ShieldCheck size={16} className="text-indigo-400" /> Role Access Matrix</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {[
            { role: "super_admin", desc: "Full platform control — all features, all users, all profiles" },
            { role: "admin", desc: "Manage users & profiles — see all data, cannot change super_admin" },
            { role: "user", desc: "Create & query own profiles — limited to own resources" },
            { role: "api_consumer", desc: "Token-based API access only — no portal access" },
          ].map(({ role, desc }) => (
            <div key={role} className="bg-gray-800 rounded-lg p-3">
              <span className={`text-xs px-2 py-0.5 rounded mb-2 inline-block ${ROLE_COLOR[role]}`}>{role.replace("_", " ")}</span>
              <div className="text-gray-400">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
