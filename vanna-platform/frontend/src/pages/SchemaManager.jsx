import React, { useEffect, useState, useCallback } from "react";
import { profilesAPI, schemaAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  Database, BookOpen, RefreshCw, Trash2, Plus, Save,
  ChevronDown, ChevronRight, Table2, Tag, Layers,
} from "lucide-react";

/* ── Tab Button ── */
function TabBtn({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "9px 18px",
        background: "none", border: "none", cursor: "pointer",
        fontSize: 13, fontWeight: active ? 700 : 500,
        color: active ? "var(--accent)" : "var(--text3)",
        borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
        transition: "color 0.15s, border-color 0.15s",
      }}
    >
      <Icon size={14} />
      {label}
      {count != null && (
        <span style={{
          fontSize: 10, padding: "1px 7px", borderRadius: 20,
          background: active ? "rgba(204,0,0,0.12)" : "var(--surface)",
          color: active ? "var(--accent)" : "var(--text3)",
          fontWeight: 700, border: `1px solid ${active ? "rgba(204,0,0,0.25)" : "var(--border)"}`,
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

/* ── Collapsible Table Row ── */
function TableRow({ meta }) {
  const [open, setOpen] = useState(false);

  /*
   * Backend GET /schema/metadata/{profile_id} returns:
   * { id, table, schema, columns: { colName: { name, type, nullable, pk?, ... } }, relationships: { primary_keys: [], foreign_keys: [] } }
   *
   * "columns" is a DICT keyed by column name — convert to array.
   * PKs are in relationships.primary_keys (list of col names).
   * FKs are in relationships.foreign_keys (list of {column, references_table, references_column}).
   */
  const colsDict = (meta && meta.columns) ? meta.columns : {};
  const cols = Array.isArray(colsDict)
    ? colsDict
    : Object.entries(colsDict).map(([colName, colData]) => ({
        name: colName,
        ...(typeof colData === "object" && colData !== null ? colData : {}),
      }));

  const pks = (meta.relationships && Array.isArray(meta.relationships.primary_keys))
    ? meta.relationships.primary_keys : [];
  const fks = (meta.relationships && Array.isArray(meta.relationships.foreign_keys))
    ? meta.relationships.foreign_keys : [];

  const fkMap = {};
  fks.forEach((fk) => { if (fk && fk.column) fkMap[fk.column] = fk; });

  const tableName = meta.table || meta.table_name || "Unknown";

  return (
    <div style={{
      border: "1px solid var(--border)",
      borderRadius: 10,
      overflow: "hidden",
      animation: "slideUp 0.2s ease",
    }}>
      {/* Header button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", background: "var(--surface)", border: "none",
          padding: "12px 16px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 10,
          color: "var(--text)",
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: "rgba(204,0,0,0.1)", border: "1px solid rgba(204,0,0,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Table2 size={13} color="var(--accent)" />
        </div>
        <span style={{ fontWeight: 600, fontSize: 13, flex: 1, textAlign: "left" }}>{tableName}</span>
        {meta.schema && (
          <span style={{
            fontSize: 10, padding: "1px 8px", borderRadius: 20,
            background: "var(--surface)", border: "1px solid var(--border)",
            color: "var(--text3)", fontFamily: "monospace",
          }}>
            {meta.schema}
          </span>
        )}
        <span style={{ fontSize: 11, color: "var(--text3)" }}>
          {cols.length} col{cols.length !== 1 ? "s" : ""}
        </span>
        {open
          ? <ChevronDown size={14} color="var(--text3)" />
          : <ChevronRight size={14} color="var(--text3)" />
        }
      </button>

      {/* Expanded columns */}
      {open && (
        <div style={{ borderTop: "1px solid var(--border)", overflowX: "auto" }}>
          {meta.description && (
            <div style={{
              padding: "8px 16px",
              background: "var(--card)",
              fontSize: 12, color: "var(--text3)",
              borderBottom: "1px solid var(--border)",
              fontStyle: "italic",
            }}>
              {meta.description}
            </div>
          )}
          {cols.length === 0 ? (
            <div style={{ padding: "16px", color: "var(--text3)", fontSize: 12, textAlign: "center" }}>
              No column data available
            </div>
          ) : (
            <table className="ongc-table" style={{ fontSize: 12 }}>
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Type</th>
                  <th>Nullable</th>
                  <th>PK</th>
                  <th>FK → References</th>
                </tr>
              </thead>
              <tbody>
                {cols.map((col, i) => {
                  // Normalise field names — backend stores: name, type, nullable (+ pk for MySQL)
                  const colName = col.name || String(i);
                  const colType = col.type || col.data_type || "—";
                  const colNullable = typeof col.nullable !== "undefined"
                    ? col.nullable
                    : (typeof col.is_nullable !== "undefined" ? col.is_nullable : false);
                  const isPK = pks.includes(colName) || col.pk === true || col.is_primary_key === true;
                  const fkRef = fkMap[colName];

                  return (
                    <tr key={i}>
                      <td style={{
                        fontFamily: "monospace",
                        color: isPK ? "var(--accent)" : "var(--text)",
                        fontWeight: isPK ? 700 : 400,
                      }}>
                        {colName}
                        {isPK && (
                          <span style={{
                            marginLeft: 6, fontSize: 9,
                            color: "var(--accent)", fontFamily: "sans-serif", fontWeight: 700,
                            border: "1px solid var(--accent)", borderRadius: 3, padding: "0 3px",
                          }}>
                            PK
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{
                          fontFamily: "monospace", fontSize: 11,
                          background: "var(--surface)", padding: "1px 6px",
                          borderRadius: 4, border: "1px solid var(--border)",
                          color: "var(--text2)",
                        }}>
                          {colType}
                        </span>
                      </td>
                      <td style={{ color: colNullable ? "var(--text3)" : "var(--text)", fontSize: 11 }}>
                        {colNullable ? "yes" : "—"}
                      </td>
                      <td>
                        {isPK ? <span style={{ color: "#f59e0b" }}>✓</span> : "—"}
                      </td>
                      <td>
                        {fkRef ? (
                          <span style={{ color: "#22d3ee", fontFamily: "monospace", fontSize: 10 }}>
                            {fkRef.references_table}.{fkRef.references_column}
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Glossary Term Card ── */
function GlossaryRow({ term, onDelete }) {
  return (
    <div className="ongc-card" style={{
      padding: "13px 16px",
      display: "flex", alignItems: "flex-start", gap: 12,
      animation: "slideUp 0.2s ease",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Tag size={13} color="#a78bfa" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 13 }}>{term.term}</div>
        <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 2, lineHeight: 1.5 }}>
          {term.definition}
        </div>
        {(term.maps_to_table || term.maps_to_column) && (
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            {term.maps_to_table && (
              <span style={{
                fontSize: 10, padding: "1px 8px", borderRadius: 20,
                background: "rgba(34,211,238,0.1)", color: "#22d3ee",
                border: "1px solid rgba(34,211,238,0.2)", fontFamily: "monospace",
              }}>
                {term.maps_to_table}
              </span>
            )}
            {term.maps_to_column && (
              <span style={{
                fontSize: 10, padding: "1px 8px", borderRadius: 20,
                background: "rgba(245,158,11,0.1)", color: "#f59e0b",
                border: "1px solid rgba(245,158,11,0.2)", fontFamily: "monospace",
              }}>
                .{term.maps_to_column}
              </span>
            )}
          </div>
        )}
      </div>
      <button
        className="ongc-btn-ghost danger"
        onClick={() => onDelete(term.id)}
        title="Delete term"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

/* ── Main Page ── */
export default function SchemaManager() {
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [tab, setTab] = useState("tables");
  const [metadata, setMetadata] = useState([]);
  const [glossary, setGlossary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [gForm, setGForm] = useState({ term: "", definition: "", maps_to_table: "", maps_to_column: "" });
  const [gSaving, setGSaving] = useState(false);

  /* Load active profiles on mount */
  useEffect(() => {
    profilesAPI.list().then((r) => {
      const active = (r.data || []).filter((p) => p.is_active);
      setProfiles(active);
      if (active.length > 0) setSelectedId(active[0].id);
    }).catch(() => {});
  }, []);

  /* Load schema data whenever selected profile changes */
  const loadData = useCallback(() => {
    if (!selectedId) return;
    setLoading(true);
    Promise.allSettled([
      schemaAPI.getMetadata(selectedId),
      schemaAPI.listGlossary(selectedId),
    ])
    .then(([tablesRes, glossaryRes]) => {
      if (tablesRes.status === "fulfilled") setMetadata(tablesRes.value.data || []);
      if (glossaryRes.status === "fulfilled") setGlossary(glossaryRes.value.data || []);
    })
    .finally(() => setLoading(false));
  }, [selectedId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleIngest = async () => {
    if (!selectedId) return;
    setIngesting(true);
    try {
      await schemaAPI.ingest(selectedId);
      toast.success("Schema ingested & AI trained");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Ingest failed");
    } finally {
      setIngesting(false);
    }
  };

  const handleAddGlossary = async (e) => {
    e.preventDefault();
    if (!gForm.term.trim() || !gForm.definition.trim()) {
      return toast.error("Term and definition required");
    }
    setGSaving(true);
    try {
      await schemaAPI.addGlossary({ ...gForm, profile_id: selectedId });
      toast.success("Term added");
      setGForm({ term: "", definition: "", maps_to_table: "", maps_to_column: "" });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add term");
    } finally {
      setGSaving(false);
    }
  };

  const handleDeleteGlossary = async (id) => {
    try {
      await schemaAPI.deleteGlossary(id);
      toast.success("Term deleted");
      loadData();
    } catch {
      toast.error("Delete failed");
    }
  };

  const selProfile = profiles.find((p) => p.id === selectedId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeIn 0.4s ease" }}>

      {/* Header */}
      <div>
        <h1 className="page-title">Schema Manager</h1>
        <p className="page-subtitle">Explore database structure and manage the AI business glossary</p>
      </div>

      {/* Profile selector + ingest */}
      <div className="ongc-card" style={{
        padding: "16px 20px",
        display: "flex", alignItems: "flex-end", gap: 14, flexWrap: "wrap",
      }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <label className="ongc-label">
            <Database size={12} style={{ display: "inline", marginRight: 5, verticalAlign: "middle" }} />
            Active Database Profile
          </label>
          <select
            className="ongc-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {profiles.length === 0
              ? <option value="">No active profiles</option>
              : profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.profile_name} ({p.db_type})</option>
                ))
            }
          </select>
        </div>

        {selProfile && (
          <div style={{ fontSize: 12, color: "var(--text3)", flex: 1, minWidth: 180, paddingBottom: 2 }}>
            <span style={{ fontFamily: "monospace" }}>
              {selProfile.host}:{selProfile.port}/{selProfile.database_name}
            </span>
          </div>
        )}

        <button
          className="ongc-btn-primary"
          onClick={handleIngest}
          disabled={ingesting || !selectedId}
          style={{ flexShrink: 0 }}
        >
          {ingesting
            ? <RefreshCw size={14} style={{ animation: "spin 0.8s linear infinite" }} />
            : <Layers size={14} />
          }
          {ingesting ? "Ingesting…" : "Ingest & Train AI"}
        </button>
      </div>

      {/* Tab switcher */}
      <div style={{ borderBottom: "1px solid var(--border)", display: "flex", gap: 0 }}>
        <TabBtn
          active={tab === "tables"}
          onClick={() => setTab("tables")}
          icon={Table2}
          label="Tables & Columns"
          count={metadata.length}
        />
        <TabBtn
          active={tab === "glossary"}
          onClick={() => setTab("glossary")}
          icon={BookOpen}
          label="Business Glossary"
          count={glossary.length}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text3)" }}>
          <div style={{
            fontSize: 28, marginBottom: 12,
            display: "inline-block", animation: "spin 1s linear infinite",
          }}>
            ⟳
          </div>
          <div>Loading schema data…</div>
        </div>
      ) : (
        <>
          {/* ── TABLES TAB ── */}
          {tab === "tables" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {metadata.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "var(--card)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px", fontSize: 26,
                  }}>
                    🗂️
                  </div>
                  <div style={{ color: "var(--text)", fontWeight: 600, marginBottom: 8 }}>
                    No schema data yet
                  </div>
                  <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 20 }}>
                    Click "Ingest & Train AI" to load tables from the selected profile
                  </div>
                  <button
                    className="ongc-btn-primary"
                    onClick={handleIngest}
                    disabled={ingesting || !selectedId}
                  >
                    <Layers size={14} /> Ingest Now
                  </button>
                </div>
              ) : (
                metadata.map((meta, i) => <TableRow key={i} meta={meta} />)
              )}
            </div>
          )}

          {/* ── GLOSSARY TAB ── */}
          {tab === "glossary" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Add form */}
              <div className="ongc-card" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Plus size={13} color="#a78bfa" />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                    Add Glossary Term
                  </span>
                </div>
                <form onSubmit={handleAddGlossary}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label className="ongc-label">Term *</label>
                             <input
                        className="ongc-input"
                        required
                        placeholder="e.g. Net Revenue"
                        value={gForm.term}
                        onChange={(e) => setGForm((f) => ({ ...f, term: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="ongc-label">Maps to Table</label>
                      <input
                        className="ongc-input"
                        placeholder="e.g. revenue_facts"
                        value={gForm.maps_to_table}
                        onChange={(e) => setGForm((f) => ({ ...f, maps_to_table: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="ongc-label">Definition *</label>
                      <textarea
                        className="ongc-input"
                        required
                        rows={2}
                        placeholder="Explain what this term means in business context"
                        value={gForm.definition}
                        onChange={(e) => setGForm((f) => ({ ...f, definition: e.target.value }))}
                        style={{ resize: "none" }}
                      />
                    </div>
                    <div>
                      <label className="ongc-label">Maps to Column</label>
                      <input
                        className="ongc-input"
                        placeholder="e.g. net_rev_amount"
                        value={gForm.maps_to_column}
                        onChange={(e) => setGForm((f) => ({ ...f, maps_to_column: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                    <button type="submit" className="ongc-btn-primary" disabled={gSaving}>
                      <Save size={14} />
                      {gSaving ? "Adding…" : "Add Term"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Glossary list */}
              {glossary.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text3)" }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>📖</div>
                  <div>No glossary terms yet. Add one above.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {glossary.map((term) => (
                    <GlossaryRow key={term.id} term={term} onDelete={handleDeleteGlossary} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
