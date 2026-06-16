import React, { useEffect, useState } from "react";
import { schemaAPI, profilesAPI } from "../services/api";
import toast from "react-hot-toast";
import { RefreshCw, BookOpen, Plus, Trash2, Edit } from "lucide-react";

export default function SchemaManager() {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [metadata, setMetadata] = useState([]);
  const [glossary, setGlossary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [tab, setTab] = useState("tables"); // "tables" | "glossary"
  const [newTerm, setNewTerm] = useState({ term: "", definition: "", maps_to_table: "", maps_to_column: "" });
  const [editingMeta, setEditingMeta] = useState(null);

  useEffect(() => {
    profilesAPI.list().then((r) => setProfiles(r.data));
  }, []);

  useEffect(() => {
    if (!selectedProfile) return;
    setLoading(true);
    Promise.all([
      schemaAPI.getMetadata(selectedProfile),
      schemaAPI.listGlossary(selectedProfile),
    ]).then(([meta, gloss]) => {
      setMetadata(meta.data);
      setGlossary(gloss.data);
    }).finally(() => setLoading(false));
  }, [selectedProfile]);

  const handleIngest = async () => {
    if (!selectedProfile) return toast.error("Select a profile first");
    setIngesting(true);
    try {
      await schemaAPI.ingest(selectedProfile);
      toast.success("Schema ingestion started! Refresh in a moment.");
    } catch { toast.error("Ingestion failed"); }
    finally { setIngesting(false); }
  };

  const handleSaveMeta = async (metaId, description) => {
    try {
      await schemaAPI.updateMetadata(metaId, { description });
      toast.success("Metadata updated");
      setEditingMeta(null);
    } catch { toast.error("Failed"); }
  };

  const handleAddGlossary = async () => {
    if (!newTerm.term) return;
    try {
      await schemaAPI.addGlossary({ ...newTerm, profile_id: selectedProfile });
      toast.success("Term added");
      const { data } = await schemaAPI.listGlossary(selectedProfile);
      setGlossary(data);
      setNewTerm({ term: "", definition: "", maps_to_table: "", maps_to_column: "" });
    } catch { toast.error("Failed"); }
  };

  const handleDeleteGlossary = async (id) => {
    try {
      await schemaAPI.deleteGlossary(id);
      setGlossary(glossary.filter((g) => g.id !== id));
      toast.success("Term deleted");
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Schema Manager</h1>
          <p className="text-gray-400 text-sm">Discover schema, train AI, manage business glossary</p>
        </div>
      </div>

      {/* Profile selector + Ingest */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1">Select Connection Profile</label>
          <select value={selectedProfile} onChange={(e) => setSelectedProfile(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
            <option value="">Choose a profile…</option>
            {profiles.map((p) => <option key={p.id} value={p.id}>{p.profile_name} ({p.db_type})</option>)}
          </select>
        </div>
        <button onClick={handleIngest} disabled={!selectedProfile || ingesting}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm px-4 py-2 rounded-lg">
          <RefreshCw size={15} className={ingesting ? "animate-spin" : ""} />
          {ingesting ? "Ingesting…" : "Ingest & Train AI"}
        </button>
      </div>

      {selectedProfile && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
            <button onClick={() => setTab("tables")}
              className={`px-4 py-1.5 text-sm rounded-lg ${tab === "tables" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}>
              Tables & Columns
            </button>
            <button onClick={() => setTab("glossary")}
              className={`px-4 py-1.5 text-sm rounded-lg ${tab === "glossary" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}>
              Business Glossary
            </button>
          </div>

          {/* Tables tab */}
          {tab === "tables" && (
            <div className="space-y-3">
              {loading ? <div className="text-gray-400 text-sm py-10 text-center">Loading…</div>
                : metadata.length === 0 ? <div className="text-gray-500 text-sm py-10 text-center">No schema ingested yet. Click "Ingest & Train AI" to start.</div>
                : metadata.map((m) => (
                  <div key={m.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
                      <div>
                        <span className="text-white font-medium">{m.table}</span>
                        {m.schema && <span className="text-gray-500 text-xs ml-2">in {m.schema}</span>}
                        {m.manually_corrected && <span className="text-xs text-yellow-400 ml-2">✎ corrected</span>}
                      </div>
                      <button onClick={() => setEditingMeta(m.id === editingMeta ? null : m.id)}
                        className="text-gray-400 hover:text-white"><Edit size={14} /></button>
                    </div>
                    {editingMeta === m.id && (
                      <div className="px-4 py-3 bg-gray-900 border-b border-gray-800 flex gap-2">
                        <input placeholder="Add description / business context…"
                          className="flex-1 bg-gray-800 border border-gray-700 text-white text-xs rounded px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                          id={`desc_${m.id}`} defaultValue={m.description || ""} />
                        <button onClick={() => handleSaveMeta(m.id, document.getElementById(`desc_${m.id}`).value)}
                          className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded">Save</button>
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead><tr className="bg-gray-800/50">
                          {["Column", "Type", "Nullable", "PK", "FK"].map((h) => (
                            <th key={h} className="text-left px-3 py-2 text-gray-400">{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {Object.entries(m.columns || {}).map(([colName, col]) => (
                            <tr key={colName} className="border-t border-gray-800">
                              <td className="px-3 py-2 text-white">{colName}</td>
                              <td className="px-3 py-2 text-gray-400">{col.type}</td>
                              <td className="px-3 py-2 text-gray-400">{col.nullable ? "YES" : "NO"}</td>
                              <td className="px-3 py-2">{(m.relationships?.primary_keys || []).includes(colName) ? "🔑" : ""}</td>
                              <td className="px-3 py-2 text-gray-400">{(m.relationships?.foreign_keys || []).find((f) => f.column === colName)?.references_table || ""}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Glossary tab */}
          {tab === "glossary" && (
            <div className="space-y-3">
              {/* Add new term */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h3 className="text-sm text-white font-medium mb-3 flex items-center gap-2">
                  <BookOpen size={15} className="text-indigo-400" /> Add Business Term
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[["term", "Term (e.g. 'gatepass')"], ["definition", "Definition"], ["maps_to_table", "Maps to Table"], ["maps_to_column", "Maps to Column"]].map(([k, label]) => (
                    <div key={k}>
                      <label className="block text-xs text-gray-400 mb-1">{label}</label>
                      <input value={newTerm[k]} onChange={(e) => setNewTerm({ ...newTerm, [k]: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
                    </div>
                  ))}
                </div>
                <button onClick={handleAddGlossary} disabled={!newTerm.term}
                  className="mt-3 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm px-4 py-2 rounded-lg">
                  <Plus size={14} /> Add Term
                </button>
              </div>

              {/* Glossary list */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                {glossary.length === 0 ? <div className="text-gray-500 text-sm py-10 text-center">No glossary terms yet.</div>
                  : <table className="w-full text-sm">
                    <thead><tr className="bg-gray-800">
                      {["Term", "Definition", "Table", "Column", ""].map((h, i) => (
                        <th key={i} className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {glossary.map((g) => (
                        <tr key={g.id} className="border-t border-gray-800">
                          <td className="px-4 py-2.5 text-white font-medium">{g.term}</td>
                          <td className="px-4 py-2.5 text-gray-400 text-xs max-w-xs truncate">{g.definition}</td>
                          <td className="px-4 py-2.5 text-gray-400 text-xs">{g.maps_to_table}</td>
                          <td className="px-4 py-2.5 text-gray-400 text-xs">{g.maps_to_column}</td>
                          <td className="px-4 py-2.5">
                            <button onClick={() => handleDeleteGlossary(g.id)} className="text-gray-400 hover:text-red-400"><Trash2 size={13} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
