import React from "react";
import { dashboardAPI } from "../services/api";
import { Users, Database, Zap, Key, CheckCircle, AlertTriangle, Clock } from "lucide-react";

// ── Error Boundary ────────────────────────────────────────────────────────────
class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(err) {
    return { error: err };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ color: "#9ca3af", padding: "60px 0", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
          <div style={{ color: "white", marginBottom: 8 }}>Dashboard render error</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{String(this.state.error.message)}</div>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ marginTop: 16, background: "#CC0000", color: "white", border: "none", padding: "8px 20px", borderRadius: 8, cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = "indigo" }) {
  const colors = {
    indigo: "bg-indigo-500/10 text-indigo-400",
    green:  "bg-green-500/10 text-green-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
    red:    "bg-red-500/10 text-red-400",
    cyan:   "bg-cyan-500/10 text-cyan-400",
  };
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm">{label}</span>
        <div className={`p-2 rounded-lg ${colors[color] || colors.indigo}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value ?? "—"}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

// ── Simple CSS bar chart (no recharts library) ────────────────────────────────
function SimpleBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ color: "#6b7280", textAlign: "center", padding: "60px 0", fontSize: 13 }}>
        No query data yet
      </div>
    );
  }
  const maxCount = Math.max(...data.map(d => d.count || 0), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 160, padding: "0 4px" }}>
      {data.map((d, i) => {
        const pct = Math.round(((d.count || 0) / maxCount) * 100);
        const label = String(d.date || "").slice(5); // "MM-DD"
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 10, color: "#9ca3af" }}>{d.count || 0}</div>
            <div
              style={{
                width: "100%",
                height: pct === 0 ? 2 : `${Math.max(pct, 4)}%`,
                background: pct === 0 ? "#374151" : "#CC0000",
                borderRadius: "4px 4px 0 0",
                transition: "height 0.3s",
                minHeight: 2,
              }}
            />
            <div style={{ fontSize: 10, color: "#6b7280", whiteSpace: "nowrap" }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Simple horizontal bar for DB breakdown ────────────────────────────────────
function DbBreakdown({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ color: "#6b7280", textAlign: "center", padding: "60px 0", fontSize: 13 }}>
        No query data yet
      </div>
    );
  }
  const total = data.reduce((s, d) => s + (d.count || 0), 0) || 1;
  const COLORS = ["#CC0000", "#22d3ee", "#f59e0b", "#10b981", "#f43f5e"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
            <span>{d.db_type}</span>
            <span>{d.count}</span>
          </div>
          <div style={{ height: 8, background: "#1f2937", borderRadius: 4, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${Math.round(((d.count || 0) / total) * 100)}%`,
                background: COLORS[i % COLORS.length],
                borderRadius: 4,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Dashboard page ────────────────────────────────────────────────────────────
class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { stats: null, loading: true, error: false, errorMsg: "" };
  }

  componentDidMount() {
    dashboardAPI
      .getStats()
      .then((r) => {
        const data = r && r.data ? r.data : {};
        this.setState({ stats: data, loading: false });
      })
      .catch((err) => {
        const detail = err?.response?.data?.detail || err?.message || "Network error";
        const status = err?.response?.status || "ERR";
        this.setState({ error: true, errorMsg: `[${status}] ${String(detail)}`, loading: false });
      });
  }

  render() {
    const { stats, loading, error, errorMsg } = this.state;

    if (loading) {
      return (
        <div style={{ color: "#9ca3af", padding: "80px 0", textAlign: "center" }}>
          Loading dashboard…
        </div>
      );
    }

    if (error || !stats) {
      return (
        <div style={{ color: "#9ca3af", padding: "80px 0", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <div style={{ color: "white", marginBottom: 8 }}>Unable to load dashboard stats</div>
          {errorMsg && (
            <div style={{ fontSize: 12, color: "#f87171", maxWidth: 480, margin: "0 auto", fontFamily: "monospace", background: "#1f2937", padding: "8px 12px", borderRadius: 6 }}>
              {errorMsg}
            </div>
          )}
          <button
            onClick={() => { this.setState({ loading: true, error: false, errorMsg: "" }); this.componentDidMount(); }}
            style={{ marginTop: 16, background: "#CC0000", color: "white", border: "none", padding: "8px 20px", borderRadius: 8, cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      );
    }

    const queryVolume = Array.isArray(stats.query_volume_last_7_days)
      ? stats.query_volume_last_7_days
      : [];
    const topDatabases = Array.isArray(stats.most_queried_databases)
      ? stats.most_queried_databases
      : [];

    return (
      <DashboardErrorBoundary>
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-0.5">Platform overview &amp; analytics</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users}        label="Active Users (30d)"  value={stats.active_users ?? 0}          sub={`${stats.total_users ?? 0} total`}   color="indigo" />
            <StatCard icon={Database}     label="DB Profiles"         value={stats.database_profile_count ?? 0}                                           color="cyan"   />
            <StatCard icon={Zap}          label="Queries Today"       value={stats.queries_today ?? 0}         sub={`${stats.total_queries ?? 0} total`}  color="green"  />
            <StatCard icon={Key}          label="Active Tokens"       value={stats.active_tokens ?? 0}         sub={`${stats.total_tokens ?? 0} total`}   color="yellow" />
            <StatCard icon={CheckCircle}  label="Success Rate"        value={`${stats.success_rate ?? 0}%`}                                               color="green"  />
            <StatCard icon={AlertTriangle}label="Failed Queries"      value={stats.failed_queries ?? 0}                                                   color="red"    />
            <StatCard icon={Clock}        label="Avg Response"        value={`${stats.avg_response_time_ms ?? 0}ms`} sub="last 30 days"                   color="indigo" />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Query Volume (Last 7 Days)</h2>
              <SimpleBarChart data={queryVolume} />
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Most Queried Databases</h2>
              <DbBreakdown data={topDatabases} />
            </div>
          </div>
        </div>
      </DashboardErrorBoundary>
    );
  }
}

export default Dashboard;
