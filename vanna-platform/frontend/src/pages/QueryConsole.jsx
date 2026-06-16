import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Send, Download, FileSpreadsheet, FileText, ChevronLeft, ChevronRight } from "lucide-react";

export default function QueryConsole() {
  const [apiToken, setApiToken] = useState(localStorage.getItem("api_token") || "");
  const [question, setQuestion] = useState("");
  const [explain, setExplain] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const saveToken = () => {
    localStorage.setItem("api_token", apiToken);
    toast.success("API token saved");
  };

  const runQuery = async (p = 1) => {
    if (!apiToken) return toast.error("Enter an API token first");
    if (!question.trim()) return toast.error("Enter a question");
    setLoading(true);
    try {
      const { data } = await axios.post(
        "/api/query",
        { question, page: p, page_size: PAGE_SIZE, explain },
        { headers: { Authorization: `Bearer ${apiToken}` } }
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
    const { data } = await axios.get(url, {
      headers: { Authorization: `Bearer ${apiToken}` },
      responseType: "blob",
    });
    const blob = new Blob([data]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `query_result.${format === "excel" ? "xlsx" : "csv"}`;
    a.click();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Query Console</h1>
        <p className="text-gray-400 text-sm">Ask questions in natural language — AI generates & executes SQL</p>
      </div>

      {/* API Token config */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1">API Token (for external app access)</label>
          <input type="password" value={apiToken} onChange={(e) => setApiToken(e.target.value)}
            placeholder="vanna_..."
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
        </div>
        <button onClick={saveToken} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg">Save</button>
      </div>

      {/* Question input */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Ask a question</label>
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) runQuery(); }}
            placeholder='e.g. "Show total gatepasses created this month" or "List top 10 customers by revenue"'
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input type="checkbox" checked={explain} onChange={(e) => setExplain(e.target.checked)}
              className="rounded border-gray-700 bg-gray-800 text-indigo-500" />
            Include SQL explanation
          </label>
          <button onClick={() => runQuery(1)} disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm px-4 py-2 rounded-lg">
            {loading ? <span className="animate-spin">⟳</span> : <Send size={15} />}
            {loading ? "Running…" : "Run Query  Ctrl+Enter"}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-indigo-900/30 border border-indigo-800 rounded-xl p-4">
            <div className="text-xs text-indigo-400 mb-1">AI Summary</div>
            <div className="text-white">{result.summary}</div>
            <div className="text-xs text-gray-500 mt-2">
              {result.row_count} row(s) returned · {result.execution_time_ms}ms · {result.db_type?.toUpperCase()}
              {result.total_rows && ` · ${result.total_rows} total rows`}
            </div>
          </div>

          {/* Generated SQL */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800 border-b border-gray-700">
              <span className="text-xs text-gray-400 font-medium">Generated SQL</span>
            </div>
            <SyntaxHighlighter language="sql" style={oneDark} customStyle={{ margin: 0, background: "transparent", padding: "1rem", fontSize: "0.8rem" }}>
              {result.generated_sql}
            </SyntaxHighlighter>
          </div>

          {/* SQL Explanation */}
          {result.sql_explanation && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">SQL Explanation</div>
              <div className="text-gray-300 text-sm">{result.sql_explanation}</div>
            </div>
          )}

          {/* Data table */}
          {result.data?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <span className="text-sm text-white font-medium">Results ({result.row_count} rows)</span>
                <div className="flex gap-2">
                  <button onClick={() => exportFile("csv")} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg">
                    <FileText size={13} /> CSV
                  </button>
                  <button onClick={() => exportFile("excel")} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg">
                    <FileSpreadsheet size={13} /> Excel
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-800">
                      {result.columns.map((c) => (
                        <th key={c} className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium whitespace-nowrap">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((row, i) => (
                      <tr key={i} className="border-t border-gray-800 hover:bg-gray-800/50">
                        {result.columns.map((c) => (
                          <td key={c} className="px-4 py-2.5 text-gray-300 text-xs whitespace-nowrap max-w-xs truncate">
                            {row[c] == null ? <span className="text-gray-600">NULL</span> : String(row[c])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {result.total_rows > PAGE_SIZE && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
                  <span className="text-xs text-gray-500">Page {page} · {result.total_rows} total rows</span>
                  <div className="flex gap-2">
                    <button onClick={() => runQuery(page - 1)} disabled={page === 1 || loading}
                      className="p-1.5 text-gray-400 hover:text-white disabled:opacity-40 hover:bg-gray-800 rounded">
                      <ChevronLeft size={15} />
                    </button>
                    <button onClick={() => runQuery(page + 1)} disabled={page * PAGE_SIZE >= result.total_rows || loading}
                      className="p-1.5 text-gray-400 hover:text-white disabled:opacity-40 hover:bg-gray-800 rounded">
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
