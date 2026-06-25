import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import {
  Send, Bot, User, Table2, Sparkles, Key, Trash2,
  Copy, ExternalLink, Sun, Moon, Zap, Database,
  BarChart3, Shield, ChevronDown, ChevronUp, X,
} from "lucide-react";

/* ─── Theme tokens ─── */
const T = {
  dark: {
    bg1:"#04080f", bg2:"#080e1e",
    panel:"rgba(8,13,28,0.82)", panelBorder:"rgba(255,255,255,0.09)",
    header:"rgba(5,9,20,0.95)",
    input:"rgba(255,255,255,0.06)", inputBorder:"rgba(255,255,255,0.13)",
    msgUser:"rgba(204,0,0,0.22)", msgUserBorder:"rgba(204,0,0,0.38)",
    msgBot:"rgba(255,255,255,0.07)", msgBotBorder:"rgba(255,255,255,0.11)",
    text:"rgba(255,255,255,0.93)", textSub:"rgba(255,255,255,0.46)",
    textMuted:"rgba(255,255,255,0.22)",
    sql:"rgba(0,0,0,0.45)", sqlText:"#93c5fd",
    tableHead:"rgba(255,255,255,0.04)", tableBorder:"rgba(255,255,255,0.08)",
    chip:"rgba(255,255,255,0.06)", chipBorder:"rgba(255,255,255,0.12)", chipText:"rgba(255,255,255,0.52)",
    scrollbar:"rgba(255,255,255,0.1)",
    cardBg:"rgba(255,255,255,0.04)", cardBorder:"rgba(255,255,255,0.08)",
  },
  light: {
    bg1:"#e8f0fe", bg2:"#fce7f3",
    panel:"rgba(255,255,255,0.88)", panelBorder:"rgba(0,0,0,0.1)",
    header:"rgba(255,255,255,0.97)",
    input:"rgba(0,0,0,0.04)", inputBorder:"rgba(0,0,0,0.14)",
    msgUser:"rgba(204,0,0,0.1)", msgUserBorder:"rgba(204,0,0,0.22)",
    msgBot:"rgba(0,0,0,0.04)", msgBotBorder:"rgba(0,0,0,0.09)",
    text:"#0f172a", textSub:"#64748b", textMuted:"#94a3b8",
    sql:"#f1f5f9", sqlText:"#1e40af",
    tableHead:"#f8fafc", tableBorder:"#e2e8f0",
    chip:"rgba(0,0,0,0.05)", chipBorder:"rgba(0,0,0,0.12)", chipText:"#475569",
    scrollbar:"rgba(0,0,0,0.12)",
    cardBg:"rgba(255,255,255,0.75)", cardBorder:"rgba(0,0,0,0.08)",
  },
};

const SUGGESTIONS = [
  "Show total queries by database",
  "List top 10 assets by value",
  "How many active users this month?",
  "Show recent production logs",
];

const FEATURES = [
  { icon:Zap,       label:"Instant Queries",  sub:"Natural language → SQL",  color:"#f59e0b" },
  { icon:Database,  label:"Multi-Database",   sub:"PostgreSQL, MongoDB…",    color:"#22d3ee" },
  { icon:BarChart3, label:"Live Results",      sub:"Real-time data fetch",    color:"#22c55e" },
  { icon:Shield,    label:"Read-Only Safe",    sub:"No writes, no risk",      color:"#a78bfa" },
];

/* ── Result Table ── */
function ResultTable({ result, t }) {
  if (!result?.data?.length) return null;
  return (
    <div style={{ marginTop:8, borderRadius:10, overflow:"hidden", border:`1px solid ${t.tableBorder}`, fontSize:11 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 12px", background:t.tableHead, borderBottom:`1px solid ${t.tableBorder}`, color:t.textSub }}>
        <Table2 size={10}/>
        <span style={{ fontWeight:700, color:t.text }}>{result.row_count} rows</span>
        <span>·</span><span>{result.execution_time_ms}ms</span>
        <span>·</span>
        <span style={{ fontFamily:"monospace", color:"#CC0000", fontSize:10, fontWeight:700 }}>{result.db_type?.toUpperCase()}</span>
      </div>
      <div style={{ overflowX:"auto", maxHeight:160, overflowY:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>
            {result.columns.map(c=>(
              <th key={c} style={{ padding:"5px 10px", textAlign:"left", background:t.tableHead, color:t.textSub, fontWeight:600, fontSize:9, letterSpacing:0.5, textTransform:"uppercase", borderBottom:`1px solid ${t.tableBorder}`, whiteSpace:"nowrap" }}>{c}</th>
            ))}
          </tr></thead>
          <tbody>
            {result.data.slice(0,6).map((row,ri)=>(
              <tr key={ri} style={{ borderBottom:`1px solid ${t.tableBorder}` }}>
                {result.columns.map(c=>(
                  <td key={c} style={{ padding:"5px 10px", color:t.text, fontSize:11, whiteSpace:"nowrap" }}>
                    {row[c]==null ? <span style={{ color:t.textMuted, fontStyle:"italic" }}>NULL</span> : String(row[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result.row_count>6 && (
        <div style={{ padding:"4px 12px", fontSize:9, color:t.textMuted, background:t.tableHead, borderTop:`1px solid ${t.tableBorder}` }}>
          +{result.row_count-6} more rows
        </div>
      )}
    </div>
  );
}

/* ── 3D Feature Card ── */
function Card({ icon:Icon, label, sub, color, isDark }) {
  const [r, setR] = useState({ x:0, y:0 });
  return (
    <div
      onMouseMove={e => { const b=e.currentTarget.getBoundingClientRect(); setR({ x:((e.clientY-b.top)/b.height-0.5)*-14, y:((e.clientX-b.left)/b.width-0.5)*14 }); }}
      onMouseLeave={() => setR({ x:0, y:0 })}
      style={{
        padding:"16px", borderRadius:16,
        background: isDark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.78)",
        border: isDark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(0,0,0,0.08)",
        backdropFilter:"blur(10px)",
        transform:`perspective(600px) rotateX(${r.x}deg) rotateY(${r.y}deg) translateZ(${r.x||r.y?8:0}px)`,
        transition:"transform 0.1s ease, box-shadow 0.2s ease",
        boxShadow: r.x||r.y
          ? isDark ? `0 20px 48px rgba(0,0,0,0.5), 0 0 0 1px ${color}28` : `0 20px 48px rgba(0,0,0,0.1), 0 0 0 1px ${color}35`
          : isDark ? "0 4px 18px rgba(0,0,0,0.3)" : "0 4px 18px rgba(0,0,0,0.07)",
        cursor:"default",
      }}
    >
      <div style={{ width:34,height:34,borderRadius:10,background:`${color}18`,border:`1px solid ${color}35`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 10px ${color}28`,marginBottom:10 }}>
        <Icon size={15} color={color}/>
      </div>
      <div style={{ fontSize:12,fontWeight:700,color:isDark?"rgba(255,255,255,0.88)":"#1e293b",marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:11,color:isDark?"rgba(255,255,255,0.38)":"#64748b",lineHeight:1.5 }}>{sub}</div>
    </div>
  );
}

/* ── Main ── */
export default function ChatApp() {
  const [theme, setTheme]           = useState(() => localStorage.getItem("chat_theme") || "dark");
  const [chatOpen, setChatOpen]     = useState(false);
  const [hovered, setHovered]       = useState(false);
  const [messages, setMessages]     = useState([{ role:"assistant", content:"Hi! I'm your ONGC AI Query Assistant. Ask me anything about your data in plain English — I'll fetch real results instantly." }]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [apiToken, setApiToken]     = useState(() => localStorage.getItem("api_token") || "");
  const [tokenInput, setTokenInput] = useState(() => localStorage.getItem("api_token") || "");
  const [tokenOpen, setTokenOpen]   = useState(!localStorage.getItem("api_token"));
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const t = T[theme];
  const isDark = theme === "dark";

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);
  useEffect(() => { if (chatOpen) setTimeout(() => inputRef.current?.focus(), 200); }, [chatOpen]);

  const toggleTheme = () => { const n = isDark?"light":"dark"; setTheme(n); localStorage.setItem("chat_theme",n); };

  const saveToken = () => {
    const tok = tokenInput.trim();
    if (!tok) return toast.error("Enter a token");
    localStorage.setItem("api_token", tok);
    setApiToken(tok); setTokenOpen(false);
    toast.success("Token saved!"); setTimeout(() => inputRef.current?.focus(), 100);
  };

  const clearChat = () => setMessages([{ role:"assistant", content:"Chat cleared! Ask me anything about your ONGC data." }]);

  const popOut = () => {
    window.open(
      window.location.href,
      "ongc_chat_popup",
      "width=440,height=700,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no"
    );
  };

  const send = async (question) => {
    const q = (question || input).trim();
    if (!q || loading) return;
    if (!apiToken) { setTokenOpen(true); toast.error("Set your API token first"); return; }
    setMessages(p => [...p, { role:"user", content:q }]);
    setInput(""); setLoading(true);
    try {
      const { data } = await axios.post(
        "/api/query",
        { question:q, page:1, page_size:50 },
        { headers:{ Authorization:`Bearer ${apiToken}` } }
      );
      setMessages(p => [...p, { role:"assistant", content:data.summary, result:data, sql:data.generated_sql }]);
    } catch(err) {
      setMessages(p => [...p, { role:"assistant", content:err.response?.data?.detail||"Query failed. Check your token or rephrase.", error:true }]);
    } finally {
      setLoading(false); setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div style={{ minHeight:"100vh", fontFamily:"'Inter',-apple-system,sans-serif", position:"relative", overflow:"hidden",
      background: isDark
        ? `linear-gradient(135deg,${t.bg1} 0%,${t.bg2} 50%,${t.bg1} 100%)`
        : `linear-gradient(135deg,${t.bg1} 0%,${t.bg2} 50%,#ede9fe 100%)`,
    }}>
      <Toaster position="top-center" toastOptions={{
        style:{ background:isDark?"#111d30":"#fff", color:isDark?"#e8eef7":"#0f172a", border:isDark?"1px solid #1a2d47":"1px solid #e2e8f0", borderRadius:10, fontSize:13 },
        success:{iconTheme:{primary:"#22c55e",secondary:"#fff"}},
        error:{iconTheme:{primary:"#CC0000",secondary:"#fff"}},
      }}/>

      {/* ── Background blobs + grid ── */}
      <div aria-hidden style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden" }}>
        <div style={{ position:"absolute",width:750,height:750,borderRadius:"50%",
          background:isDark?"radial-gradient(circle,rgba(204,0,0,0.2) 0%,transparent 68%)":"radial-gradient(circle,rgba(204,0,0,0.12) 0%,transparent 68%)",
          top:"-200px",left:"-100px",animation:"blob1 20s ease-in-out infinite" }}/>
        <div style={{ position:"absolute",width:620,height:620,borderRadius:"50%",
          background:isDark?"radial-gradient(circle,rgba(14,165,233,0.14) 0%,transparent 68%)":"radial-gradient(circle,rgba(14,165,233,0.09) 0%,transparent 68%)",
          top:"30%",right:"-150px",animation:"blob2 25s ease-in-out infinite" }}/>
        <div style={{ position:"absolute",width:500,height:500,borderRadius:"50%",
          background:isDark?"radial-gradient(circle,rgba(168,85,247,0.11) 0%,transparent 68%)":"radial-gradient(circle,rgba(168,85,247,0.07) 0%,transparent 68%)",
          bottom:"-100px",left:"30%",animation:"blob3 28s ease-in-out infinite" }}/>
        <div style={{ position:"absolute",inset:0,
          backgroundImage:isDark
            ?"linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)"
            :"linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px)",
          backgroundSize:"52px 52px" }}/>
      </div>

      {/* ── Top bar ── */}
      <header style={{
        position:"relative",zIndex:10,
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"0 32px",height:58,
        background:isDark?"rgba(4,8,15,0.7)":"rgba(255,255,255,0.7)",
        backdropFilter:"blur(16px)",
        borderBottom:`1px solid ${t.panelBorder}`,
      }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#CC0000,#7a0000)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(204,0,0,0.45)" }}>
            <Sparkles size={15} color="white"/>
          </div>
          <div>
            <div style={{ fontSize:13,fontWeight:800,color:t.text,letterSpacing:0.5 }}>ONGC AI Platform</div>
            <div style={{ fontSize:9,color:t.textSub,letterSpacing:1.5,textTransform:"uppercase" }}>Energy: Now AND Next</div>
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.2)",fontSize:10,color:"#4ade80",fontWeight:600 }}>
            <div style={{ width:5,height:5,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 5px #22c55e" }}/>
            Live
          </div>
          <button onClick={toggleTheme} title="Toggle theme" style={{ width:32,height:32,borderRadius:8,border:`1px solid ${t.panelBorder}`,background:t.input,color:t.textSub,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            {isDark?<Sun size={14}/>:<Moon size={14}/>}
          </button>
          <button onClick={() => window.open("/dashboard","_blank")} style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 13px",borderRadius:8,background:t.input,border:`1px solid ${t.panelBorder}`,color:t.textSub,fontSize:11,fontWeight:600,cursor:"pointer" }}>
            <ExternalLink size={11}/> Platform
          </button>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
            style={{ width:32,height:32,borderRadius:8,border:`1px solid ${t.panelBorder}`,background:t.input,color:t.textSub,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}
            title="Copy link">
            <Copy size={13}/>
          </button>
        </div>
      </header>

      {/* ── Hero content ── */}
      <div style={{ position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 58px)",padding:"40px 24px",gap:40,textAlign:"center" }}>

        {/* Logo */}
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:20 }}>
          <div style={{
            width:96,height:96,borderRadius:28,
            background:"linear-gradient(135deg,#e60000 0%,#7a0000 100%)",
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:"0 8px 0 rgba(80,0,0,0.5), 0 16px 50px rgba(204,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.2)",
            animation:"floatLogo 4s ease-in-out infinite",
          }}>
            <Sparkles size={42} color="white" style={{ filter:"drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}/>
          </div>
          <div>
            <div style={{ fontSize:11,fontWeight:800,letterSpacing:4,color:"#CC0000",marginBottom:12,textTransform:"uppercase" }}>ONGC · AI Platform</div>
            <h1 style={{ fontSize:52,fontWeight:900,margin:"0 0 16px",color:t.text,lineHeight:1.1,letterSpacing:-1,
              textShadow:isDark?"0 2px 30px rgba(0,0,0,0.6)":"none" }}>
              Query Your Data<br/>
              <span style={{ background:"linear-gradient(90deg,#CC0000,#ff6b6b,#ff9090)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", filter:"drop-shadow(0 2px 10px rgba(204,0,0,0.4))" }}>
                In Plain English
              </span>
            </h1>
            <p style={{ fontSize:15,color:t.textSub,maxWidth:480,margin:"0 auto",lineHeight:1.75 }}>
              No SQL needed. Ask questions about your ONGC databases and get instant AI-powered results — right here.
            </p>
          </div>
        </div>

        {/* 3D Feature Cards */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,maxWidth:780,width:"100%" }}>
          {FEATURES.map(f => <Card key={f.label} {...f} isDark={isDark}/>)}
        </div>

        {/* CTA hint */}
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:10 }}>
          <div style={{ padding:"8px 20px",borderRadius:20,background:isDark?"rgba(204,0,0,0.08)":"rgba(204,0,0,0.06)",border:"1px solid rgba(204,0,0,0.2)",fontSize:12,color:isDark?"rgba(204,0,0,0.8)":"rgba(180,0,0,0.7)",fontWeight:700,letterSpacing:1 }}>
            Click the button below to start querying →
          </div>
        </div>
      </div>

      {/* ── Chat panel (slide-up overlay) ── */}
      {chatOpen && (
        <div style={{
          position:"fixed",bottom:100,right:24,zIndex:1000,
          width:420,height:600,
          background:t.panel,
          backdropFilter:"blur(28px) saturate(1.5)",
          WebkitBackdropFilter:"blur(28px) saturate(1.5)",
          border:`1px solid ${t.panelBorder}`,
          borderRadius:24,
          boxShadow:isDark
            ?"0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.06)"
            :"0 32px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
          display:"flex",flexDirection:"column",overflow:"hidden",
          animation:"panelSlideUp 0.35s cubic-bezier(0.34,1.2,0.64,1)",
        }}>

          {/* ── Curved heading box ── */}
          <div style={{
            margin:"14px 14px 0",
            padding:"12px 14px",
            borderRadius:16,
            background:isDark?"linear-gradient(135deg,rgba(204,0,0,0.2),rgba(80,0,0,0.12))":"linear-gradient(135deg,rgba(204,0,0,0.1),rgba(255,180,180,0.07))",
            border:"1px solid rgba(204,0,0,0.28)",
            boxShadow:isDark?"inset 0 1px 0 rgba(255,255,255,0.07),0 4px 18px rgba(204,0,0,0.18)":"inset 0 1px 0 rgba(255,255,255,0.9),0 4px 18px rgba(204,0,0,0.08)",
            display:"flex",alignItems:"center",justifyContent:"space-between",
            flexShrink:0,
          }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ width:36,height:36,borderRadius:11,background:"linear-gradient(135deg,#CC0000,#7a0000)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(204,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.2)" }}>
                <Bot size={17} color="white"/>
              </div>
              <div>
                <div style={{ fontSize:14,fontWeight:800,color:t.text,letterSpacing:-0.2 }}>Query Assistant</div>
                <div style={{ fontSize:10,color:t.textSub,display:"flex",alignItems:"center",gap:4,marginTop:1 }}>
                  <div style={{ width:5,height:5,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 6px #22c55e",animation:"pulseDot 2s infinite" }}/>
                  Vanna AI · Live
                </div>
              </div>
            </div>
            {/* Action buttons */}
            <div style={{ display:"flex",gap:6 }}>
              <button onClick={popOut} title="Pop out as floating window" style={{ height:28,padding:"0 10px",borderRadius:8,border:`1px solid ${t.panelBorder}`,background:t.input,color:t.textSub,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontSize:10,fontWeight:600 }}>
                <ExternalLink size={11}/> Pop out
              </button>
              <button onClick={clearChat} title="Clear chat" style={{ width:28,height:28,borderRadius:8,border:`1px solid ${t.panelBorder}`,background:t.input,color:t.textSub,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Trash2 size={11}/>
              </button>
              <button onClick={() => setChatOpen(false)} title="Close" style={{ width:28,height:28,borderRadius:8,border:`1px solid ${t.panelBorder}`,background:t.input,color:t.textSub,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <X size={12}/>
              </button>
            </div>
          </div>

          {/* Token pill */}
          <div style={{ padding:"8px 14px 0",flexShrink:0 }}>
            <button onClick={() => setTokenOpen(v=>!v)} style={{
              display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:20,
              background:apiToken?"rgba(34,197,94,0.1)":"rgba(204,0,0,0.1)",
              border:`1px solid ${apiToken?"rgba(34,197,94,0.3)":"rgba(204,0,0,0.3)"}`,
              color:apiToken?"#4ade80":"#f87171",fontSize:10,fontWeight:700,cursor:"pointer",
            }}>
              <Key size={10}/>{apiToken?"✓ Token configured":"⚠ Set API token"}
              {tokenOpen?<ChevronUp size={9}/>:<ChevronDown size={9}/>}
            </button>
          </div>

          {/* Token input */}
          {tokenOpen && (
            <div style={{ margin:"8px 14px 0",padding:"10px 12px",borderRadius:12,background:isDark?"rgba(204,0,0,0.07)":"rgba(204,0,0,0.04)",border:"1px solid rgba(204,0,0,0.18)",display:"flex",gap:8,alignItems:"center",animation:"fadeDown 0.18s ease",flexShrink:0 }}>
              <Key size={11} color="#f87171" style={{ flexShrink:0 }}/>
              <input type="password" value={tokenInput} onChange={e=>setTokenInput(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") saveToken(); }}
                placeholder="Paste API token (vanna_…)"
                style={{ flex:1,background:t.input,border:`1px solid ${t.inputBorder}`,borderRadius:7,padding:"6px 10px",color:t.text,fontSize:11,outline:"none" }}/>
              <button onClick={saveToken} style={{ padding:"6px 12px",borderRadius:7,border:"none",background:"linear-gradient(135deg,#CC0000,#990000)",color:"white",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0,boxShadow:"0 2px 8px rgba(204,0,0,0.35)" }}>Save</button>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:12,scrollbarWidth:"thin",scrollbarColor:`${t.scrollbar} transparent` }}>
            {messages.map((m,i)=>(
              <div key={i} style={{ display:"flex",gap:8,flexDirection:m.role==="user"?"row-reverse":"row",animation:"msgIn 0.22s cubic-bezier(0.34,1.2,0.64,1)" }}>
                <div style={{ width:30,height:30,borderRadius:"50%",flexShrink:0,
                  background:m.role==="user"?"linear-gradient(135deg,#CC0000,#7a0000)":isDark?"linear-gradient(135deg,#0ea5e9,#0369a1)":"linear-gradient(135deg,#6366f1,#4338ca)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  boxShadow:m.role==="user"?"0 3px 10px rgba(204,0,0,0.45)":"0 3px 10px rgba(99,102,241,0.4)",
                  border:"2px solid rgba(255,255,255,0.15)" }}>
                  {m.role==="user"?<User size={12} color="white"/>:<Bot size={12} color="white"/>}
                </div>
                <div style={{ maxWidth:"80%",display:"flex",flexDirection:"column",gap:5 }}>
                  <div style={{
                    padding:"9px 13px",
                    borderRadius:m.role==="user"?"14px 3px 14px 14px":"3px 14px 14px 14px",
                    background:m.role==="user"?t.msgUser:m.error?"rgba(239,68,68,0.1)":t.msgBot,
                    border:`1px solid ${m.role==="user"?t.msgUserBorder:m.error?"rgba(239,68,68,0.25)":t.msgBotBorder}`,
                    color:m.error?"#f87171":t.text,fontSize:12,lineHeight:1.65,
                    boxShadow:isDark?"inset 0 1px 0 rgba(255,255,255,0.05)":"inset 0 1px 0 rgba(255,255,255,0.8)",
                  }}>{m.content}</div>
                  {m.sql && (
                    <div style={{ padding:"6px 10px",borderRadius:7,background:t.sql,border:`1px solid ${t.tableBorder}`,fontFamily:"monospace",fontSize:9,color:t.sqlText,overflowX:"auto",whiteSpace:"pre",maxHeight:60,overflowY:"auto" }}>
                      {m.sql}
                    </div>
                  )}
                  <ResultTable result={m.result} t={t}/>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:"flex",gap:8 }}>
                <div style={{ width:30,height:30,borderRadius:"50%",background:isDark?"linear-gradient(135deg,#0ea5e9,#0369a1)":"linear-gradient(135deg,#6366f1,#4338ca)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 3px 10px rgba(99,102,241,0.4)",border:"2px solid rgba(255,255,255,0.15)" }}>
                  <Bot size={12} color="white"/>
                </div>
                <div style={{ padding:"10px 14px",borderRadius:"3px 14px 14px 14px",background:t.msgBot,border:`1px solid ${t.msgBotBorder}`,display:"flex",gap:4,alignItems:"center" }}>
                  {[0,1,2].map(n=><div key={n} style={{ width:5,height:5,borderRadius:"50%",background:t.textSub,animation:`bounce 1.2s ${n*0.2}s infinite` }}/>)}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Suggestions */}
          {messages.length===1 && !loading && (
            <div style={{ display:"flex",gap:5,flexWrap:"wrap",padding:"0 14px 8px",flexShrink:0 }}>
              {SUGGESTIONS.map(s=>(
                <button key={s} onClick={()=>send(s)} style={{ padding:"5px 11px",borderRadius:20,background:t.chip,border:`1px solid ${t.chipBorder}`,color:t.chipText,fontSize:10,cursor:"pointer",transition:"all 0.14s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="rgba(204,0,0,0.1)"; e.currentTarget.style.borderColor="rgba(204,0,0,0.3)"; e.currentTarget.style.color="#CC0000"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=t.chip; e.currentTarget.style.borderColor=t.chipBorder; e.currentTarget.style.color=t.chipText; }}
                >{s}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding:"10px 14px 14px",borderTop:`1px solid ${t.panelBorder}`,background:t.header,flexShrink:0 }}>
            <div style={{ display:"flex",gap:8,alignItems:"center",background:t.input,border:`1px solid ${t.inputBorder}`,borderRadius:14,padding:"3px 3px 3px 12px",transition:"border-color 0.2s,box-shadow 0.2s" }}
              onFocusCapture={e=>{ e.currentTarget.style.borderColor="rgba(204,0,0,0.5)"; e.currentTarget.style.boxShadow="0 0 0 3px rgba(204,0,0,0.1)"; }}
              onBlurCapture={e=>{ e.currentTarget.style.borderColor=t.inputBorder; e.currentTarget.style.boxShadow="none"; }}
            >
              <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}
                placeholder="Ask about your ONGC data…" disabled={loading}
                style={{ flex:1,background:"none",border:"none",outline:"none",color:t.text,fontSize:12,padding:"9px 0" }}/>
              <button onClick={()=>send()} disabled={loading||!input.trim()} style={{
                width:36,height:36,borderRadius:10,border:"none",flexShrink:0,
                background:input.trim()&&!loading?"linear-gradient(135deg,#CC0000,#990000)":isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)",
                color:"white",display:"flex",alignItems:"center",justifyContent:"center",
                cursor:input.trim()&&!loading?"pointer":"not-allowed",transition:"all 0.18s",
                boxShadow:input.trim()&&!loading?"0 2px 10px rgba(204,0,0,0.45)":"none",
              }}>
                <Send size={13} color={input.trim()&&!loading?"white":t.textMuted}/>
              </button>
            </div>
            <div style={{ fontSize:9,color:t.textMuted,textAlign:"center",marginTop:7 }}>Enter to send · ONGC AI Platform</div>
          </div>
        </div>
      )}

      {/* ── Floating chatbot button ── */}
      <div style={{ position:"fixed",bottom:24,right:24,zIndex:1001,display:"flex",flexDirection:"column",alignItems:"center",gap:8 }}>

        {/* Hover preview popup */}
        {hovered && !chatOpen && (
          <div style={{
            position:"absolute",bottom:"calc(100% + 14px)",right:0,
            width:210,padding:"12px 14px",
            background:isDark?"rgba(8,13,28,0.95)":"rgba(255,255,255,0.97)",
            border:`1px solid ${t.panelBorder}`,borderRadius:14,
            boxShadow:"0 16px 40px rgba(0,0,0,0.3)",
            backdropFilter:"blur(16px)",
            animation:"previewPop 0.2s cubic-bezier(0.34,1.4,0.64,1)",
            pointerEvents:"none",
          }}>
            <div style={{ position:"absolute",bottom:-6,right:24,width:12,height:12,background:isDark?"rgba(8,13,28,0.95)":"rgba(255,255,255,0.97)",border:`1px solid ${t.panelBorder}`,borderTop:"none",borderLeft:"none",transform:"rotate(45deg)" }}/>
            <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:7 }}>
              <div style={{ width:22,height:22,borderRadius:6,background:"linear-gradient(135deg,#CC0000,#7a0000)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Bot size={11} color="white"/>
              </div>
              <span style={{ fontSize:11,fontWeight:700,color:t.text }}>ONGC Query Assistant</span>
            </div>
            <p style={{ fontSize:11,color:t.textSub,lineHeight:1.5,margin:0 }}>Ask anything about your ONGC data — instant results!</p>
            <div style={{ marginTop:8,fontSize:10,color:"#CC0000",fontWeight:700 }}>Click to open →</div>
          </div>
        )}

        {/* Curved label */}
        {!chatOpen && (
          <div style={{
            padding:"5px 14px 5px 10px",
            background:"linear-gradient(135deg,rgba(204,0,0,0.16),rgba(100,0,0,0.09))",
            border:"1px solid rgba(204,0,0,0.32)",borderRadius:20,
            display:"flex",alignItems:"center",gap:6,
            fontSize:11,fontWeight:700,color:"#CC0000",
            boxShadow:"0 4px 16px rgba(204,0,0,0.22)",
            animation:"labelPop 0.3s cubic-bezier(0.34,1.4,0.64,1)",whiteSpace:"nowrap",
          }}>
            <div style={{ width:6,height:6,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 5px #22c55e" }}/>
            AI Assistant
          </div>
        )}

        {/* Main button */}
        <button
          onClick={() => setChatOpen(v=>!v)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          title="Open AI Query Assistant"
          style={{
            width:60,height:60,borderRadius:"50%",
            background:chatOpen
              ?"linear-gradient(135deg,#222,#111)"
              :"linear-gradient(135deg,#e60000 0%,#7a0000 100%)",
            border:"2.5px solid rgba(255,255,255,0.18)",
            boxShadow:chatOpen
              ?"0 0 0 4px rgba(204,0,0,0.2),0 8px 24px rgba(0,0,0,0.5)"
              :"0 6px 0 rgba(80,0,0,0.5),0 12px 32px rgba(204,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.22)",
            cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
            transition:"all 0.22s cubic-bezier(0.34,1.56,0.64,1)",position:"relative",
          }}
          onMouseEnter={(e) => {
            setHovered(true);
            if (!chatOpen) { e.currentTarget.style.transform="scale(1.1) translateY(-3px)"; e.currentTarget.style.boxShadow="0 10px 0 rgba(80,0,0,0.5),0 20px 44px rgba(204,0,0,0.65),inset 0 1px 0 rgba(255,255,255,0.25)"; }
          }}
          onMouseLeave={(e) => {
            setHovered(false);
            e.currentTarget.style.transform="scale(1) translateY(0)";
            e.currentTarget.style.boxShadow=chatOpen
              ?"0 0 0 4px rgba(204,0,0,0.2),0 8px 24px rgba(0,0,0,0.5)"
              :"0 6px 0 rgba(80,0,0,0.5),0 12px 32px rgba(204,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.22)";
          }}
        >
          <div style={{ transition:"transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",transform:chatOpen?"rotate(90deg) scale(0.8)":"rotate(0deg) scale(1)" }}>
            {chatOpen
              ? <X size={22} color="white" style={{ filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}/>
              : <Bot size={26} color="white" style={{ filter:"drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}/>
            }
          </div>
        </button>
      </div>

      <style>{`
        *{box-sizing:border-box;}
        body{margin:0;}
        @keyframes blob1{0%,100%{transform:translate(0,0) scale(1);}33%{transform:translate(70px,50px) scale(1.07);}66%{transform:translate(-40px,70px) scale(0.95);}}
        @keyframes blob2{0%,100%{transform:translate(0,0) scale(1);}33%{transform:translate(-60px,40px) scale(1.05);}66%{transform:translate(50px,-60px) scale(1.1);}}
        @keyframes blob3{0%,100%{transform:translate(0,0) scale(1);}33%{transform:translate(40px,-50px) scale(0.94);}66%{transform:translate(-70px,30px) scale(1.06);}}
        @keyframes floatLogo{0%,100%{transform:perspective(400px) rotateX(-6deg) translateY(0);}50%{transform:perspective(400px) rotateX(-6deg) translateY(-12px);}}
        @keyframes panelSlideUp{from{opacity:0;transform:translateY(30px) scale(0.95);}to{opacity:1;transform:translateY(0) scale(1);}}
        @keyframes msgIn{from{opacity:0;transform:translateY(10px) scale(0.96);}to{opacity:1;transform:translateY(0) scale(1);}}
        @keyframes previewPop{from{opacity:0;transform:translateY(8px) scale(0.94);}to{opacity:1;transform:translateY(0) scale(1);}}
        @keyframes labelPop{from{opacity:0;transform:scale(0.85);}to{opacity:1;transform:scale(1);}}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);}}
        @keyframes bounce{0%,60%,100%{transform:translateY(0);opacity:0.4;}30%{transform:translateY(-6px);opacity:1;}}
        @keyframes pulseDot{0%,100%{box-shadow:0 0 5px #22c55e;}50%{box-shadow:0 0 12px #22c55e;}}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(128,128,128,0.18);border-radius:4px;}
      `}</style>
    </div>
  );
}
