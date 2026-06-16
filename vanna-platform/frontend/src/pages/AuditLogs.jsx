import React, { useEffect, useState } from "react";
import { auditAPI } from "../services/api";
import dayjs from "dayjs";

const STATUS_COLOR = { success: "text-green-400", failure: "text-red-400" };

function Table({ cols, rows, empty = "No records" }) {
  if (!rows?.length) return <div className="text-gray-500 text-sm py-10 text-center">{empty}</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-800">
            {cols.map((c) => <th key={c} className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium whitespace-nowrap">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-gray-800 hover:bg-gray-800/40">
              {cols.map((c) => <td key={c} className="px-4 py-2.5 text-gray-300 text-xs whitespace-nowrap max-w-xs truncate">{row[c]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TABS = ["Audit Logs", "Query History", "Failed Queries", "Token Usage"];

export default function AuditLogs() {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const calls = [
      auditAPI.getLogs({ page: 1, page_size: 100 }),
      auditAPI.getQueryHistory({ page: 1, page_size: 100 }),
      auditAPI.getFailedQueries({ page: 1, page_size: 100 }),
      auditAPI.getTokenUsage(),
    ];
    Promise.allSettled(calls).then((results) => {
      setData({
        audit: results[0].value?.data?.items || [],
        history: results[1].value?.data?.items || [],
        failed: results[2].value?.data || [],
        tokenUsage: results[3].value?.data || [],
      });
    }).finally(() => setLoading(false));
  }, []);

  const auditCols = ["action", "resource_type", "ip_address", "status", "created_at"];
  const auditRows = (data.audit || []).map((r) => ({
    ...r, created_at: dayjs(r.created_at).format("MMM D HH:mm:ss"),
  }));

  const historyCols = ["question", "status", "db_type", "execution_time_ms", "row_count", "ip_address", "created_at"];
  const historyRows = (data.history || []).map((r) => ({
    ...r,
    question: r.question?.slice(0, 60) + (r.question?.length > 60 ? "…" : ""),
    created_at: dayjs(r.created_at).format("MMM D HH:mm"),
    execution_time_ms: r.execution_time_ms ? `${r.execution_time_ms}ms` : "—",
  }));

  const failedCols = ["question", "status", "error", "ip_address", "created_at"];
  const failedRows = (data.failed || []).map((r) => ({
    ...r,
    question: r.question?.slice(0, 50),
    created_at: dayjs(r.created_at).format("MMM D HH:mm"),
  }));

  const tokenCols = ["name", "total_requests", "status", "last_used_ip", "last_used_at"];
  const tokenRows = (data.tokenUsage || []).map((r) => ({
    ...r, last_used_at: r.last_used_at ? dayjs(r.last_used_at).format("MMM D HH:mm") : "—",
  }));

  const tabContent = [
    { cols: auditCols, rows: auditRows, empty: "No audit logs" },
    { cols: historyCols, rows: historyRows, empty: "No query history" },
    { cols: failedCols, rows: failedRows, empty: "No failed queries" },
    { cols: tokenCols, rows: tokenRows, empty: "No token usage data" },
  ];

  const current = tabContent[tab];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Audit & Monitoring</h1>
        <p className="text-gray-400 text-sm">Full audit trail — user activity, queries, tokens, IP tracking</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${tab === i ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? <div className="text-gray-400 text-sm py-10 text-center">Loading…</div>
          : <Table cols={current.cols} rows={current.rows} empty={current.empty} />}
      </div>
    </div>
  );
}
