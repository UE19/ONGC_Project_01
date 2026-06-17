import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Send, Download, FileSpreadsheet, FileText, ChevronLeft, ChevronRight, Terminal, Sparkles, Database } from "lucide-react";

export default function QueryConsole() {
  const [apiToken, setApiToken] = useState(localStorage.getItem("api_token") || "");
  const [question, setQuestion] = useState("");
  const [explain, setExplain] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const saveToken = () => {
    localStorage.setItem("api_token", apiToken.trim());
    toast.success("API token saved");
  };

  const runQuery = async (p = 1) => {
    if (!apiToken.trim()) return toast.error("Enter an API token first");
    if (!question.trim()) return toast.error("Enter a question");
    setLoading(true);
    try {
      const { data } = await axios.post(
        "/api/query",
        { question, page: p, page_size: PAGE_SIZE, explain },
        { headers: { Authorization: `Bearer ${apiToken.trim()}` } }
      );
      setResult(data);
      setPage(p);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Query failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const exportFile = async (format) => {
    if (!result) return;
    const url = `/api/query/${result.query_id}/export/${format}`;
    try {
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${apiToken.trim()}` },
        responseType: "blob",
      });
      const blob = new Blob([data]);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `query_result.${format === "excel" ? "xlsx" : "csv"}`;
      a.click();
    } catch {
      toast.error("Export failed");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, animation: "fadeIn 0.4s ease" }}>

      {/* API Token Config */}
      <div className="ongc-card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Terminal size={15} color="var(--accent)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)" }}>API Token Configuration</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label className="ongc-label">API Token (for external app access)</label>
            <input
              className="ongc-input"
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="vanna_..."
            />
          </div>
          <button
            className="ongc-btn-secondary"
            onClick={saveToken}
            style={{ padding: "10px 18px", borderRadius: 8, flexShrink: 0 }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Question input */}
      <div className="ongc-card" style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Sparkles size={15} color="var(--accent)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)" }}>Natural Language Query</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label className="ongc-label">Ask a question about your data</label>
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) runQuery(); }}
              placeholder='e.g. "Show total budget allocations by department" or "List top 10 equipment assets by value"'
              className="ongc-input"
              style={{ resize: "vertical", minHeight: 80, lineHeight: 1.6 }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 13, color: "var(--text2)", cursor: "pointer",
            }}>
              <input
                type="checkbox"
                checked={explain}
                onChange={(e) => setExplain(e.target.checked)}
                style={{ accentColor: "var(--accent)" }}
              />
              Include SQL explanation
            </label>
            <button
              onClick={() => runQuery(1)}
              disabled={loading}
              className="ongc-btn-primary"
              style={{ gap: 7 }}
            >
              {loading ? (
                <span style={{ display: "inline-block", animation: "spin 0.7s linear infinite" }}>⟳</span>
              ) : (
                <Send size={14} />
              )}
              {loading ? "Running…" : "Run Query"}
              {!loading && (
                <span style={{ fontSize: 11, opacity: 0.7, fontWeight: 400 }}>Ctrl+↵</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "slideUp 0.3s ease" }}>

          {/* AI Summary */}
          <div className="ongc-card" style={{
            padding: "16px 20px",
            borderLeft: "3px solid var(--accent)",
            background: "linear-gradient(90deg, var(--accent-subtle) 0%, var(--card) 100%)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Sparkles size={12} color="var(--accent)" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1 }}>AI Summary</span>
            </div>
            <div style={{ color: "var(--text)", fontSize: 14, lineHeight: 1.7 }}>{result.summary}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 10, display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
              <span>{result.row_count} row(s)</span>
              <span>·</span>
              <span>{result.execution_time_ms}ms</span>
              <span>·</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Database size={10} />
                {result.db_type?.toUpperCase()}
              </span>
              {result.total_rows && <><span>·</span><span>{result.total_rows} total rows</span></>}
            </div>
          </div>

          {/* Generated SQL */}
          <div className="ongc-card" style={{ overflow: "hidden" }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px",
              background: "var(--surface2)",
              borderBottom: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Terminal size={13} color="var(--text3)" />
                <span style={{ fontSize: 12, color: "var(--text2)", fontWeight: 600 }}>Generated SQL</span>
              </div>
            </div>
            <SyntaxHighlighter
              language="sql"
              style={oneDark}
              customStyle={{ margin: 0, background: "transparent", padding: "14px 16px", fontSize: "0.8rem" }}
            >
              {result.generated_sql}
            </SyntaxHighlighter>
          </div>

          {/* SQL Explanation */}
          {result.sql_explanation && (
            <div className="ongc-card" style={{ padding: "14px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>SQL Explanation</div>
              <div style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.7 }}>{result.sql_explanation}</div>
            </div>
          )}

          {/* Data table */}
          {result.data?.length > 0 && (
            <div className="ongc-card" style={{ overflow: "hidden" }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 18px",
                borderBottom: "1px solid var(--border)",
              }}>
                <span style={{ color: "var(--text)", fontWeight: 600, fontSize: 14 }}>
                  Results <span style={{ color: "var(--text3)", fontWeight: 400 }}>({result.row_count} rows)</span>
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => exportFile("csv")}
                    className="ongc-btn-ghost"
                    style={{ fontSize: 12, padding: "6px 12px", gap: 5, color: "var(--text2)" }}
                  >
                    <FileText size={12} /> CSV
                  </button>
                  <button
                    onClick={() => exportFile("excel")}
                    className="ongc-btn-ghost"
                    style={{ fontSize: 12, padding: "6px 12px", gap: 5, color: "var(--text2)" }}
                  >
                    <FileSpreadsheet size={12} /> Excel
                  </button>
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="ongc-table">
                  <thead>
                    <tr>
                      {result.columns.map((c) => (
                        <th key={c}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((row, i) => (
                      <tr key={i}>
                        {result.columns.map((c) => (
                          <td key={c}>
                            {row[c] == null
                              ? <span style={{ color: "var(--text3)", fontStyle: "italic" }}>NULL</span>
                              : String(row[c])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {result.total_rows > PAGE_SIZE && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 18px",
                  borderTop: "1px solid var(--border)",
                }}>
                  <span style={{ fontSize: 12, color: "var(--text3)" }}>
                    Page {page} · {result.total_rows} total rows
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => runQuery(page - 1)}
                      disabled={page === 1 || loading}
                      className="ongc-btn-ghost"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <button
                      onClick={() => runQuery(page + 1)}
                      disabled={page * PAGE_SIZE >= result.total_rows || loading}
                      className="ongc-btn-ghost"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
