import React from "react";
import { dashboardAPI } from "../services/api";
import { Users, Database, Zap, Key, CheckCircle, AlertTriangle, Clock, TrendingUp } from "lucide-react";

class DashboardErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(err) { return { error: err }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ color: "var(--text3)", padding: "60px 0", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
          <div style={{ color: "var(--text)", marginBottom: 8, fontSize: 16, fontWeight: 600 }}>Dashboard render error</div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>{String(this.state.error.message)}</div>
          <button
            onClick={() => this.setState({ error: null })}
            className="ongc-btn-primary"
            style={{ marginTop: 16 }}
          >Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function StatCard({ icon: Icon, label, value, sub, accentColor = "#CC0000" }) {
  return (
    <div
      className="ongc-card"
      style={{
        padding: "18px 20px",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.18s, box-shadow 0.18s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.25)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
    >
      {/* Subtle top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${accentColor}, transparent)`, borderRadius: "14px 14px 0 0" }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 500 }}>{label}</span>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: `${accentColor}18`,
          border: `1px solid ${accentColor}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={15} color={accentColor} />
        </div>
      </div>
      <div className="stat-value" style={{ color: "var(--text)" }}>{value ?? "—"}</div>
      {sub && <div className="stat-label">{sub}</div>}
    </div>
  );
}

function SimpleBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ color: "var(--text3)", textAlign: "center", padding: "60px 0", fontSize: 13 }}>
        No query data yet
      </div>
    );
  }
  const maxCount = Math.max(...data.map((d) => d.count || 0), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 160, padding: "0 4px" }}>
      {data.map((d, i) => {
        const pct = Math.round(((d.count || 0) / maxCount) * 100);
        const label = String(d.date || "").slice(5);
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 10, color: "var(--text3)" }}>{d.count || 0}</div>
            <div
              title={`${d.date}: ${d.count} queries`}
              style={{
                width: "100%",
                height: pct === 0 ? 3 : `${Math.max(pct, 5)}%`,
                background: pct === 0
                  ? "var(--border)"
                  : "linear-gradient(to top, #CC0000, #ff3333)",
                borderRadius: "4px 4px 0 0",
                transition: "height 0.5s ease",
                minHeight: 3,
                cursor: "default",
              }}
            />
            <div style={{ fontSize: 9, color: "var(--text3)", whiteSpace: "nowrap" }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

function DbBreakdown({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ color: "var(--text3)", textAlign: "center", padding: "60px 0", fontSize: 13 }}>
        No query data yet
      </div>
    );
  }
  const total = data.reduce((s, d) => s + (d.count || 0), 0) || 1;
  const COLORS = ["#CC0000", "#22d3ee", "#f59e0b", "#10b981", "#f43f5e", "#a78bfa"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text2)", marginBottom: 5 }}>
            <span style={{ fontWeight: 500 }}>{d.db_type}</span>
            <span style={{ fontWeight: 600, color: COLORS[i % COLORS.length] }}>{d.count}</span>
          </div>
          <div style={{ height: 7, background: "var(--surface2)", borderRadius: 4, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${Math.round(((d.count || 0) / total) * 100)}%`,
                background: COLORS[i % COLORS.length],
                borderRadius: 4,
                transition: "width 0.8s ease",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { stats: null, loading: true, error: false, errorMsg: "" };
  }

  componentDidMount() {
    dashboardAPI.getStats()
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
        <div style={{ color: "var(--text3)", padding: "80px 0", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 14, animation: "shimmer 1.5s infinite" }}>📊</div>
          Loading dashboard…
        </div>
      );
    }

    if (error || !stats) {
      return (
        <div style={{ color: "var(--text3)", padding: "80px 0", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>⚠️</div>
          <div style={{ color: "var(--text)", marginBottom: 10, fontSize: 17, fontWeight: 600 }}>Unable to load dashboard stats</div>
          {errorMsg && (
            <div style={{
              fontSize: 12, color: "#f87171",
              maxWidth: 520, margin: "0 auto",
              fontFamily: "monospace",
              background: "rgba(239,68,68,0.08)",
              padding: "10px 16px", borderRadius: 8,
              border: "1px solid rgba(239,68,68,0.2)",
            }}>
              {errorMsg}
            </div>
          )}
          <button
            onClick={() => { this.setState({ loading: true, error: false }); this.componentDidMount(); }}
            className="ongc-btn-primary"
            style={{ marginTop: 20 }}
          >
            Retry
          </button>
        </div>
      );
    }

    const queryVolume = Array.isArray(stats.query_volume_last_7_days) ? stats.query_volume_last_7_days : [];
    const topDatabases = Array.isArray(stats.most_queried_databases) ? stats.most_queried_databases : [];

    return (
      <DashboardErrorBoundary>
        <div style={{ display: "flex", flexDirection: "column", gap: 26, animation: "fadeIn 0.4s ease" }}>

          {/* Welcome banner */}
          <div className="ongc-card" style={{
            padding: "22px 26px",
            background: "linear-gradient(120deg, var(--card) 0%, var(--card2) 100%)",
            borderLeft: "4px solid var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          }}>
            <div>
              <h1 style={{ color: "var(--text)", fontSize: 20, fontWeight: 700, margin: 0 }}>
                Welcome to ONGC AI Query Platform
              </h1>
              <p style={{ color: "var(--text3)", fontSize: 13, margin: "6px 0 0" }}>
                Real-time platform overview and analytics dashboard
              </p>
            </div>
            <div style={{
              padding: "6px 16px",
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: 20,
              fontSize: 12, color: "#4ade80",
              fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #22c55e" }} />
              All 8 profiles operational
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 14 }}>
            <StatCard icon={Users}         label="Active Users (30d)"  value={stats.active_users ?? 0}           sub={`of ${stats.total_users ?? 0} total`}   accentColor="#a78bfa" />
            <StatCard icon={Database}      label="DB Profiles"         value={stats.database_profile_count ?? 0}                                              accentColor="#22d3ee" />
            <StatCard icon={Zap}           label="Queries Today"       value={stats.queries_today ?? 0}          sub={`${stats.total_queries ?? 0} total`}   accentColor="#22c55e" />
            <StatCard icon={Key}           label="Active Tokens"       value={stats.active_tokens ?? 0}          sub={`${stats.total_tokens ?? 0} total`}    accentColor="#f59e0b" />
            <StatCard icon={CheckCircle}   label="Success Rate"        value={`${stats.success_rate ?? 0}%`}                                                  accentColor="#22c55e" />
            <StatCard icon={AlertTriangle} label="Failed Queries"      value={stats.failed_queries ?? 0}                                                       accentColor="#f43f5e" />
            <StatCard icon={Clock}         label="Avg Response"        value={`${stats.avg_response_time_ms ?? 0}ms`} sub="last 30 days"                      accentColor="#CC0000" />
            <StatCard icon={TrendingUp}    label="Total Queries"       value={stats.total_queries ?? 0}          sub="all time"                               accentColor="#CC0000" />
          </div>

          {/* Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 18 }}>
            <div className="ongc-card" style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: "rgba(204,0,0,0.1)", border: "1px solid rgba(204,0,0,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <TrendingUp size={14} color="var(--accent)" />
                </div>
                <h2 style={{ color: "var(--text)", fontSize: 14, fontWeight: 600, margin: 0 }}>
                  Query Volume — Last 7 Days
                </h2>
              </div>
              <SimpleBarChart data={queryVolume} />
            </div>

            <div className="ongc-card" style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Database size={14} color="#22d3ee" />
                </div>
                <h2 style={{ color: "var(--text)", fontSize: 14, fontWeight: 600, margin: 0 }}>
                  Most Queried Databases
                </h2>
              </div>
              <DbBreakdown data={topDatabases} />
            </div>
          </div>
        </div>
      </DashboardErrorBoundary>
    );
  }
}

export default Dashboard;
