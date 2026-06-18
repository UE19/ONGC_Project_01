import React, { useEffect, useState } from "react";
import { auditAPI } from "../services/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Shield, Clock, XCircle, Key, RefreshCw,
  ChevronLeft, ChevronRight,
} from "lucide-react";

dayjs.extend(relativeTime);

/* ── Tab config ── */
const TABS = [
  { id: "audit",   label: "Audit Logs",     icon: Shield   },
  { id: "queries", label: "Query History",  icon: Clock    },
  { id: "failed",  label: "Failed Queries", icon: XCircle  },
  { id: "tokens",  label: "Token Usage",    icon: Key      },
];

/* ── Status badge ── */
function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();
  const isOk = s === "success" || s === "true" || s === "completed";
  return (
    <span style={{
      fontSize: 10, padding: "2px 9px", borderRadius: 20,
      fontWeight: 700,
      background: isOk ? "var(--badge-active)" : "var(--badge-revoked)",
      color: isOk ? "var(--badge-active-text)" : "var(--badge-revoked-text)",
    }}>
      {status || "—"}
    </span>
  );
}

/* ── Generic data table ── */
function DataTable({ cols, rows, empty = "No data available" }) {
  if (!rows || rows.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0", color: "var(--text3)" }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>📭</div>
        <div style={{ fontSize: 13 }}>{empty}</div>
      </div>
    );
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="ongc-table">
        <thead>
          <tr>
            {cols.map((c) => <th key={c.key}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {cols.map((c) => (
                <td key={c.key}>
                  {c.render ? c.render(row[c.key], row) : (
                    row[c.key] == null
                      ? <span style={{ color: "var(--text3)", fontStyle: "italic" }}>—</span>
                      : String(row[c.key])
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Pagination ── */
function Pager({ page, total, pageSize, onPage, loading }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 18px", borderTop: "1px solid var(--border)",
    }}>
      <span style={{ fontSize: 12, color: "var(--text3)" }}>
        Page {page} of {totalPages} · {total} entries
      </span>
      <div style={{ display: "flex", gap: 6 }}>
        <button
          className="ongc-btn-ghost"
          onClick={() => onPage(page - 1)}
          disabled={page === 1 || loading}
        >
          <ChevronLeft size={14} />
        </button>
        <button
          className="ongc-btn-ghost"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages || loading}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function AuditLogs() {
  const [tab, setTab] = useState("audit");
  const [data, setData] = useState({ audit: [], queries: [], failed: [], tokens: [] });
  const [totals, setTotals] = useState({ audit: 0, queries: 0, failed: 0, tokens: 0 });
  const [page, setPage] = useState({ audit: 1, queries: 1, failed: 1, tokens: 1 });
  const [loading, setLoading] = useState(false);
  const PAGE_SIZE = 25;

  const loadTab = (t, p = 1) => {
    setLoading(true);
    const pg = { skip: (p - 1) * PAGE_SIZE, limit: PAGE_SIZE };
    const fetchers = {
      audit:   () => auditAPI.getLogs(pg),
      queries: () => auditAPI.getQueryHistory(pg),
      failed:  () => auditAPI.getFailedQueries(pg),
      tokens:  () => auditAPI.getTokenUsage(),
    };
    fetchers[t]()
      .then((r) => {
        setData((prev) => ({ ...prev, [t]: r.data?.items || r.data || [] }));
        setTotals((prev) => ({ ...prev, [t]: r.data?.total || (r.data?.items || r.data || []).length }));
        setPage((prev) => ({ ...prev, [t]: p }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Load all tabs in parallel on mount
    setLoading(true);
    const pg = { skip: 0, limit: PAGE_SIZE };
    Promise.allSettled([
      auditAPI.getLogs(pg),
      auditAPI.getQueryHistory(pg),
      auditAPI.getFailedQueries(pg),
      auditAPI.getTokenUsage(),
    ]).then(([auditRes, queriesRes, failedRes, tokensRes]) => {
      const extract = (r) => (r.status === "fulfilled" ? (r.value.data?.items || r.value.data || []) : []);
      const count = (r) => (r.status === "fulfilled" ? (r.value.data?.total || extract(r).length) : 0);
      setData({
        audit:   extract(auditRes),
        queries: extract(queriesRes),
        failed:  extract(failedRes),
        tokens:  extract(tokensRes),
      });
      setTotals({
        audit:   count(auditRes),
        queries: count(queriesRes),
        failed:  count(failedRes),
        tokens:  count(tokensRes),
      });
    }).finally(() => setLoading(false));
  }, []);

  /* ── Column definitions ── */
  const fmt = (v) => v ? dayjs(v).format("DD MMM YY, HH:mm") : "—";
  const fmtRel = (v) => v ? dayjs(v).fromNow() : "—";

  const COLS = {
    audit: [
      { key: "timestamp",     label: "Time",    render: (v) => <span style={{ color: "var(--text3)", fontSize: 12, whiteSpace: "nowrap" }}>{fmt(v)}</span> },
      { key: "action",        label: "Action",  render: (v) => <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text2)" }}>{v}</span> },
      { key: "resource_type", label: "Resource" },
      { key: "user_email",    label: "User",    render: (v) => <span style={{ color: "var(--text2)", fontSize: 12 }}>{v || "—"}</span> },
      { key: "ip_address",    label: "IP",      render: (v) => <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text3)" }}>{v || "—"}</span> },
      { key: "success",       label: "Status",  render: (v) => <StatusBadge status={v ? "success" : "failure"} /> },
    ],
    queries: [
      { key: "created_at",    label: "Time",    render: (v) => <span style={{ color: "var(--text3)", fontSize: 12, whiteSpace: "nowrap" }}>{fmt(v)}</span> },
      { key: "question",      label: "Question",render: (v) => (
        <span style={{ color: "var(--text)", fontSize: 12, maxWidth: 280, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {v || "—"}
        </span>
      )},
      { key: "db_type",       label: "DB Profile",      render: (v, row) => (
        <span style={{ fontFamily: "monospace", fontSize: 11 }}>{row.profile_name || v || "—"}</span>
      ) },
      { key: "execution_time_ms", label: "Time (ms)", render: (v) => (
        <span style={{ color: v > 2000 ? "#f59e0b" : "var(--text2)", fontFamily: "monospace", fontSize: 12 }}>{v ?? "—"}</span>
      )},
      { key: "status",        label: "Status",  render: (v) => <StatusBadge status={v} /> },
    ],
    failed: [
      { key: "created_at",    label: "Time",    render: (v) => <span style={{ color: "var(--text3)", fontSize: 12 }}>{fmt(v)}</span> },
      { key: "question",      label: "Question",render: (v) => (
        <span style={{ color: "var(--text)", fontSize: 12, maxWidth: 240, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {v || "—"}
        </span>
      )},
      { key: "error_message", label: "Error",   render: (v) => (
        <span style={{ color: "#f87171", fontSize: 11, maxWidth: 260, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {v || "—"}
        </span>
      )},
      { key: "db_type",       label: "DB",      render: (v) => <span style={{ fontFamily: "monospace", fontSize: 11 }}>{v}</span> },
    ],
    tokens: [
      { key: "used_at",       label: "Time",    render: (v) => <span style={{ color: "var(--text3)", fontSize: 12 }}>{fmt(v)}</span> },
      { key: "token_name",    label: "Token",   render: (v) => <span style={{ fontFamily: "monospace", fontSize: 12 }}>{v || "—"}</span> },
      { key: "endpoint",      label: "Endpoint",render: (v) => <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text2)" }}>{v || "—"}</span> },
      { key: "ip_address",    label: "IP",      render: (v) => <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text3)" }}>{v || "—"}</span> },
      { key: "status_code",   label: "HTTP",    render: (v) => (
        <span style={{
          fontFamily: "monospace", fontSize: 12,
          color: v >= 400 ? "#f87171" : v >= 300 ? "#f59e0b" : "#4ade80",
        }}>{v || "—"}</span>
      )},
    ],
  };

  const rows = data[tab] || [];
  const cols = COLS[tab] || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeIn 0.4s ease" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">Audit & Logs</h1>
          <p className="page-subtitle">Platform activity, query history, and security audit trail</p>
        </div>
        <button
          className="ongc-btn-ghost"
          onClick={() => loadTab(tab, page[tab])}
          disabled={loading}
          title="Refresh"
          style={{ gap: 6 }}
        >
          <RefreshCw size={14} style={loading ? { animation: "spin 0.8s linear infinite" } : {}} />
          Refresh
        </button>
      </div>

      {/* Summary stats */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <div key={id} className="ongc-card" style={{ padding: "12px 18px", minWidth: 110 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Icon size={12} color={id === "failed" ? "#f87171" : "var(--accent)"} />
              <span style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 0.8 }}>
                {label}
              </span>
            </div>
            <div style={{
              fontSize: 20, fontWeight: 700,
              color: id === "failed" && totals[id] > 0 ? "#f87171" : "var(--text)",
            }}>
              {totals[id]}
            </div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div style={{ borderBottom: "1px solid var(--border)", display: "flex", gap: 0 }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setTab(id); if (!data[id]?.length) loadTab(id, 1); }}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 16px",
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: tab === id ? 700 : 500,
              color: tab === id
                ? (id === "failed" ? "#f87171" : "var(--accent)")
                : "var(--text3)",
              borderBottom: tab === id
                ? `2px solid ${id === "failed" ? "#f87171" : "var(--accent)"}`
                : "2px solid transparent",
              transition: "color 0.15s, border-color 0.15s",
            }}
          >
            <Icon size={13} />
            {label}
            {totals[id] > 0 && (
              <span style={{
                fontSize: 10, padding: "1px 6px", borderRadius: 20,
                background: id === "failed" ? "rgba(248,113,113,0.12)" : "rgba(204,0,0,0.1)",
                color: id === "failed" ? "#f87171" : "var(--accent)",
                fontWeight: 700,
              }}>
                {totals[id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Data card */}
      <div className="ongc-card" style={{ overflow: "hidden", padding: 0 }}>
        {/* Card header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {(() => {
              const t = TABS.find((t) => t.id === tab);
              if (!t) return null;
              const Ic = t.icon;
              return (
                <>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: tab === "failed" ? "rgba(248,113,113,0.1)" : "rgba(204,0,0,0.1)",
                    border: `1px solid ${tab === "failed" ? "rgba(248,113,113,0.25)" : "rgba(204,0,0,0.2)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Ic size={13} color={tab === "failed" ? "#f87171" : "var(--accent)"} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{t.label}</span>
                </>
              );
            })()}
          </div>
          <span style={{ fontSize: 12, color: "var(--text3)" }}>
            {loading ? "Loading…" : `${rows.length} of ${totals[tab]} entries`}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: "var(--text3)" }}>
            <div style={{ fontSize: 24, marginBottom: 10, display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</div>
            <div style={{ fontSize: 13 }}>Loading…</div>
          </div>
        ) : (
          <>
            <DataTable cols={cols} rows={rows} empty={`No ${TABS.find((t) => t.id === tab)?.label?.toLowerCase()} yet`} />
            <Pager
              page={page[tab]}
              total={totals[tab]}
              pageSize={PAGE_SIZE}
              onPage={(p) => loadTab(tab, p)}
              loading={loading}
            />
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
