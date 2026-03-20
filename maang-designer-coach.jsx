import { useState, useEffect, useRef } from "react";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:#090909; --bg2:#111; --bg3:#1a1a1a; --bg4:#222;
      --border:rgba(255,255,255,.08); --border2:rgba(255,255,255,.14);
      --accent:#5b5bff; --pink:#e0627a; --teal:#2eb8a0; --gold:#d4a843; --lav:#9b8be8;
      --text:#f0eef8; --text2:#888898; --text3:#444454;
      --font:Helvetica Neue,Helvetica,Arial,sans-serif;
      --mono:'DM Mono',monospace; --r:10px; --r2:6px;
    }
    html,body{background:var(--bg);color:var(--text);font-family:var(--font);min-height:100vh;-webkit-font-smoothing:antialiased;}
    ::-webkit-scrollbar{width:3px;height:3px;}
    ::-webkit-scrollbar-thumb{background:var(--bg4);border-radius:2px;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
    @keyframes barGrow{from{width:0}}
    @keyframes popIn{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}
    .fu{animation:fadeUp .4s ease both}
    .fu1{animation:fadeUp .4s .07s ease both}
    .fu2{animation:fadeUp .4s .14s ease both}
    .fu3{animation:fadeUp .4s .21s ease both}
    .fu4{animation:fadeUp .4s .28s ease both}
    .fu5{animation:fadeUp .4s .35s ease both}
    input[type=file]{display:none}
    textarea,button{font-family:var(--font)!important}
  `}</style>
);

// ── Atoms ─────────────────────────────────────────────────────────────────────
const Card = ({ children, style, cls="", onClick }) => (
  <div className={cls} onClick={onClick}
    style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:20,...style}}>
    {children}
  </div>
);

const Badge = ({ children, c="accent", style }) => {
  const m={accent:["rgba(91,91,255,.14)","#7878ff"],success:["rgba(46,184,160,.14)","#2eb8a0"],
    warn:["rgba(212,168,67,.14)","#d4a843"],danger:["rgba(224,98,122,.14)","#e0627a"],
    muted:["rgba(255,255,255,.06)","var(--text2)"],lav:["rgba(155,139,232,.14)","#9b8be8"]};
  const [bg,col]=m[c]||m.accent;
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,background:bg,color:col,
    padding:"3px 9px",borderRadius:20,fontSize:10,fontFamily:"var(--mono)",letterSpacing:".04em",...style}}>
    {children}
  </span>;
};

const Btn = ({ children, onClick, v="pri", disabled, loading, style, size="md" }) => {
  const pad={sm:"7px 14px",md:"10px 20px",lg:"13px 26px"}[size];
  const fs={sm:12,md:13,lg:14}[size];
  const vs={
    pri:{background:"var(--accent)",color:"#fff",border:"none",boxShadow:"0 3px 16px rgba(91,91,255,.3)"},
    sec:{background:"transparent",color:"var(--text)",border:"1px solid var(--border)"},
    ghost:{background:"transparent",color:"var(--text2)",border:"none"},
    success:{background:"rgba(46,184,160,.1)",color:"var(--teal)",border:"1px solid rgba(46,184,160,.2)"},
  };
  return (
    <button onClick={onClick} disabled={disabled||loading}
      style={{...vs[v],padding:pad,borderRadius:"var(--r2)",fontSize:fs,fontWeight:600,
        cursor:disabled||loading?"not-allowed":"pointer",opacity:disabled?.45:1,
        display:"inline-flex",alignItems:"center",gap:7,transition:"all .18s",
        letterSpacing:"-.01em",...style}}
      onMouseEnter={e=>{if(!disabled&&!loading){e.currentTarget.style.opacity=".82";e.currentTarget.style.transform="translateY(-1px)";}}}
      onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="none";}}>
      {loading&&<span style={{width:13,height:13,border:"2px solid rgba(255,255,255,.25)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .6s linear infinite"}}/>}
      {children}
    </button>
  );
};

const Inp = ({ label, hint, value, onChange, placeholder, type="text", multiline, rows=4, style, required }) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<div style={{display:"flex",justifyContent:"space-between"}}>
      <label style={{fontSize:11,color:"var(--text2)",fontFamily:"var(--mono)",letterSpacing:".05em"}}>
        {label}{required&&<span style={{color:"var(--pink)",marginLeft:2}}>*</span>}
      </label>
      {hint&&<span style={{fontSize:10,color:"var(--text3)"}}>{hint}</span>}
    </div>}
    {multiline
      ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
          style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--r2)",
            color:"var(--text)",padding:"11px 13px",fontSize:13,resize:"vertical",outline:"none",
            transition:"border-color .2s",lineHeight:1.7,...style}}
          onFocus={e=>e.target.style.borderColor="var(--accent)"}
          onBlur={e=>e.target.style.borderColor="var(--border)"}/>
      : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
          style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--r2)",
            color:"var(--text)",padding:"10px 13px",fontSize:13,outline:"none",
            transition:"border-color .2s",...style}}
          onFocus={e=>e.target.style.borderColor="var(--accent)"}
          onBlur={e=>e.target.style.borderColor="var(--border)"}/>}
  </div>
);

const Spin = ({ size=18, color="var(--accent)" }) => (
  <span style={{width:size,height:size,border:`2px solid rgba(91,91,255,.2)`,borderTopColor:color,
    borderRadius:"50%",display:"inline-block",animation:"spin .65s linear infinite",flexShrink:0}}/>
);

const Bar = ({ label, value, max=10, color="var(--accent)", evidence }) => (
  <div style={{display:"flex",flexDirection:"column",gap:4}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontSize:12,color:"var(--text2)",fontFamily:"var(--mono)"}}>{label}</span>
      <span style={{fontSize:12,fontWeight:700,color,fontFamily:"var(--mono)"}}>{(+value).toFixed(1)}/10</span>
    </div>
    <div style={{height:5,background:"var(--bg4)",borderRadius:3,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${(value/max)*100}%`,background:color,borderRadius:3,animation:"barGrow .85s ease both"}}/>
    </div>
    {evidence&&<p style={{fontSize:10,color:"var(--text3)",lineHeight:1.5,fontFamily:"var(--mono)",marginTop:2}}>{evidence}</p>}
  </div>
);

// ── File Upload Drop Zone ─────────────────────────────────────────────────────
const FileZone = ({ label, hint, accept, onFile, file, icon="📎", extracting=false }) => {
  const ref = useRef();
  const [drag, setDrag] = useState(false);
  const handle = f => { if(f) onFile(f); };
  return (
    <div onClick={()=>!extracting&&ref.current.click()}
      onDragOver={e=>{e.preventDefault();setDrag(true);}}
      onDragLeave={()=>setDrag(false)}
      onDrop={e=>{e.preventDefault();setDrag(false);handle(e.dataTransfer.files[0]);}}
      style={{border:`1.5px dashed ${drag?"var(--accent)":file?"var(--teal)":"var(--border)"}`,
        borderRadius:"var(--r)",padding:"16px",cursor:extracting?"default":"pointer",
        background:drag?"rgba(91,91,255,.05)":file?"rgba(46,184,160,.04)":"var(--bg3)",
        transition:"all .2s",textAlign:"center"}}>
      <input type="file" ref={ref} accept={accept} onChange={e=>handle(e.target.files[0])}/>
      {extracting
        ? <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:6}}>
              <Spin size={16}/>
            </div>
            <p style={{fontSize:12,fontWeight:600,color:"var(--accent)"}}>Reading PDF…</p>
            <p style={{fontSize:10,color:"var(--text3)",marginTop:2}}>{file?.name}</p>
          </>
        : file
          ? <>
              <div style={{fontSize:20,marginBottom:5}}>✅</div>
              <p style={{fontSize:12,fontWeight:600,color:"var(--teal)"}}>{file.name}</p>
              <p style={{fontSize:10,color:"var(--text3)",marginTop:2}}>{(file.size/1024).toFixed(0)} KB · Click to replace</p>
            </>
          : <>
              <div style={{fontSize:20,marginBottom:5}}>{icon}</div>
              <p style={{fontSize:12,fontWeight:600,color:"var(--text2)"}}>{label}</p>
              <p style={{fontSize:10,color:"var(--text3)",marginTop:3}}>{hint}</p>
            </>}
    </div>
  );
};

// ── Skill maps ────────────────────────────────────────────────────────────────
const SK = {productThinking:"#5b5bff",uxExecution:"#e0627a",systemsThinking:"#2eb8a0",aiUnderstanding:"#d4a843",communication:"#9b8be8"};
const SL = {productThinking:"Product Thinking",uxExecution:"UX Execution",systemsThinking:"Systems Thinking",aiUnderstanding:"AI Understanding",communication:"Communication"};
const ROLES = ["Senior Designer","Staff Designer","Lead Designer","Principal Designer"];

// ── PDF extraction (workerless — works in sandboxed iframes) ──────────────────
let _pdfReady = null;
function loadPdfJs() {
  if (_pdfReady) return _pdfReady;
  _pdfReady = new Promise((res, rej) => {
    if (window.pdfjsLib) { res(window.pdfjsLib); return; }
    const s = document.createElement("script");
    s.src = "https://unpkg.com/pdfjs-dist@3.11.174/legacy/build/pdf.min.js";
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "";
      res(window.pdfjsLib);
    };
    s.onerror = () => rej(new Error("PDF.js load failed"));
    document.head.appendChild(s);
  });
  return _pdfReady;
}

async function extractPdfText(file) {
  try {
    const lib = await loadPdfJs();
    const buf = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: buf, disableWorker: true, verbosity: 0 }).promise;
    const parts = [];
    for (let i = 1; i <= Math.min(pdf.numPages, 25); i++) {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent();
      const rows = {};
      tc.items.forEach(item => {
        if (!item.str.trim()) return;
        const y = Math.round(item.transform[5]);
        (rows[y] = rows[y] || []).push(item.str);
      });
      parts.push(Object.keys(rows).sort((a,b)=>b-a).map(y=>rows[y].join(" ")).join("\n"));
    }
    const text = parts.join("\n").trim();
    return text.length > 50 ? text : null;
  } catch(e) {
    console.warn("PDF extract error:", e.message);
    return null;
  }
}

async function readFileAsText(file) {
  if (!file) return null;
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    return await extractPdfText(file);
  }
  return new Promise(res => {
    const r = new FileReader();
    r.onload = e => {
      let text = e.target.result || "";
      if (name.endsWith(".docx") || name.endsWith(".doc")) {
        text = text.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
        res(text.length > 80 ? text : null);
      } else {
        res(text || null);
      }
    };
    r.onerror = () => res(null);
    r.readAsText(file);
  });
}

// ── Storage ───────────────────────────────────────────────────────────────────
const KEY = "mdc_v3";
const saveS = async s => {
  const str = JSON.stringify(s);
  try { await window.storage.set(KEY, str); } catch {}
  try { localStorage.setItem(KEY, str); } catch {}
};
const loadS = async () => {
  try { const r = await window.storage.get(KEY); if (r?.value) return JSON.parse(r.value); } catch {}
  try { const v = localStorage.getItem(KEY); if (v) return JSON.parse(v); } catch {}
  return null;
};

// ── AI Service ────────────────────────────────────────────────────────────────
const SYS = "You are a MAANG-level Product Design Interviewer and Coach. Think like: Google UX (clarity, structure), Meta Design (product sense, scale), Amazon (trade-offs, metrics), MIT (systems thinking). Be critical. No generic praise. Explain WHY and HOW to improve. Most work deserves 4-7, not 8-10.";

async function callAI(msgs, json=false) {
  // Prepend system instruction as first user message (artifact API proxy pattern)
  const fullMsgs = [
    { role: "user", content: SYS + "\n\nNow respond to the following:" },
    { role: "assistant", content: "Understood. I will follow those instructions." },
    ...msgs
  ];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: fullMsgs
    })
  });

  const data = await response.json();
  const text = (data.content || []).map(b => b.text || "").join("").trim();

  if (!text) {
    const errMsg = data?.error?.message || JSON.stringify(data).slice(0, 200);
    throw new Error("API error: " + errMsg);
  }

  if (json) {
    const clean = text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
    const s = clean.indexOf("{");
    const e = clean.lastIndexOf("}");
    if (s !== -1 && e > s) {
      try { return JSON.parse(clean.slice(s, e + 1)); } catch {}
    }
    try { return JSON.parse(clean); } catch { return null; }
  }
  return text;
}


async function analyzeProfile({ resumeText, resumeFile, portfolioUrl, portfolioDesc, portfolioFile, experience, targetRole }) {
  const src = [];
  if (resumeText) src.push("RESUME:\n" + resumeText.slice(0, 4000));
  else if (resumeFile) src.push("Resume file uploaded: " + resumeFile.name + " (could not extract text — analyze based on other info)");
  if (portfolioUrl) src.push("Portfolio URL: " + portfolioUrl);
  if (portfolioDesc) src.push("Portfolio case studies:\n" + portfolioDesc.slice(0, 2000));
  else if (portfolioFile) src.push("Portfolio file uploaded: " + portfolioFile.name);

  const prompt = "Evaluate a product designer for " + targetRole + " at MAANG. " + experience + " years experience.\n\n"
    + src.join("\n---\n")
    + "\n\nScore ONLY on concrete evidence. If thin evidence, score 3-5."
    + "\nRubric: 1-3 no evidence, 4-5 shallow, 6-7 approaching MAANG, 8-9 strong MAANG, 10 extraordinary."
    + "\nDimensions: productThinking, uxExecution, systemsThinking, aiUnderstanding, communication."
    + '\nReturn ONLY valid JSON: {"scores":{"productThinking":N,"uxExecution":N,"systemsThinking":N,"aiUnderstanding":N,"communication":N},'
    + '"evidence":{"productThinking":"...","uxExecution":"...","systemsThinking":"...","aiUnderstanding":"...","communication":"..."},'
    + '"overall_assessment":"2-3 sentences honest vs MAANG bar",'
    + '"immediate_gaps":["gap1","gap2","gap3"],"strengths":["s1","s2"],'
    + '"recommended_start":"which skill to focus first and why"}';
  return await callAI([{role:"user",content:prompt}], true);
}

async function gen6MonthPlan(user, skillGraph, analysis) {
  const sorted = Object.entries(skillGraph).sort((a,b)=>a[1]-b[1]);
  const prompt = "Create a 6-month MAANG design prep calendar for " + user.targetRole + ", " + user.experience + "yr.\n"
    + "Skills low-to-high: " + sorted.map(([k,v])=>k+":"+v).join(", ") + "\n"
    + "Gaps: " + (analysis?.immediate_gaps?.join(", ")||"general") + "\n"
    + "Start focus: " + (analysis?.recommended_start||sorted[0][0]) + "\n"
    + 'Return ONLY valid JSON: {"months":[{"month":1,"theme":"title","focus":"skillKey","secondaryFocus":"skillKey",'
    + '"goal":"success criteria","courses":[{"title":"title","type":"Book|Video|Practice|Article|Project","duration":"Xh","why":"reason"}],'
    + '"weeklyTasks":["w1","w2","w3","w4"],"milestone":"measurable milestone",'
    + '"expectedScoreGain":{"productThinking":0,"uxExecution":0,"systemsThinking":0,"aiUnderstanding":0,"communication":0}}]}';
  return await callAI([{role:"user",content:prompt}], true);
}

async function genTask(user, skillGraph, plan, month) {
  const weak = Object.entries(skillGraph).sort((a,b)=>a[1]-b[1]);
  const focus = plan?.months?.[month-1]?.focus || weak[0][0];
  const prompt = "1-hour design task for " + user.name + ", " + user.experience + "yr, " + user.targetRole + ".\n"
    + "Month " + month + " focus: " + focus + ". Weakest: " + weak.slice(0,2).map(([k,v])=>k+"("+v+")").join(", ") + ".\n"
    + 'Return ONLY valid JSON: {"task_title":"title","task_type":"Design Sprint|Case Study|System Design|UX Audit","difficulty":"Foundational|Intermediate|Advanced|MAANG-Level","focus_skill":"skillKey",'
    + '"problem_statement":"2-3 paragraphs","time_breakdown":[{"phase":"name","minutes":15,"goal":"deliverable"}],'
    + '"expected_output":"specific artifacts","evaluation_criteria":["c1","c2","c3","c4","c5"]}';
  return await callAI([{role:"user",content:prompt}], true);
}

async function evalWork(task, response) {
  const prompt = "Evaluate MAANG design response.\nTask: " + (task.task_title||"Design Work")
    + "\nProblem: " + (task.problem_statement||"Portfolio work").slice(0,500)
    + "\nExpected: " + (task.expected_output||"MAANG-quality design thinking").slice(0,300)
    + "\nResponse:\n" + response.slice(0,3000)
    + '\nReturn ONLY valid JSON: {"scores":{"clarity":N,"structure":N,"tradeoffs":N,"depth":N,"metrics":N},'
    + '"final_score":N,"level":"Below Bar|Approaching Bar|Bar|Above Bar|Exceptional","weak_areas":["a1","a2"],'
    + '"detailed_feedback":{"clarity":"...","structure":"...","tradeoffs":"...","depth":"...","metrics":"...","overall":"2-3 sentences"}}';
  return await callAI([{role:"user",content:prompt}], true);
}

async function genImprovement(evaluation, task) {
  const prompt = "Improvement plan.\nTask: " + (task?.task_title||"Design Work")
    + "\nScore: " + evaluation.final_score + "/10 (" + evaluation.level + ")"
    + "\nWeak: " + (evaluation.weak_areas||[]).join(", ")
    + "\nFeedback: " + JSON.stringify(evaluation.detailed_feedback)
    + '\nReturn ONLY valid JSON: {"root_causes":["r1","r2"],"action_steps":["s1","s2","s3","s4"],'
    + '"example_snippet":"150-200 word improved answer","next_focus":"skillKey",'
    + '"difficulty_adjustment":"easier|same|harder","reason":"why"}';
  return await callAI([{role:"user",content:prompt}], true);
}

async function chatAI(msgs, user, skillGraph) {
  // Build context into the first message instead of system param
  const ctx = SYS + " You are coaching " + user.name + " for " + user.targetRole + ". Their current skills: " + JSON.stringify(skillGraph) + ". Be direct and critical.";
  const fullMsgs = [
    { role: "user", content: ctx + "\n\nNow respond to the following:" },
    { role: "assistant", content: "Understood. I will coach you directly." },
    ...msgs.map(m => ({ role: m.role, content: m.content }))
  ];
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: fullMsgs })
  });
  const data = await response.json();
  return (data.content || []).map(b => b.text || "").join("").trim() || "Could not connect.";
}

// ── PDF Report (string concat only — no nested template literals) ─────────────
function downloadReport(state) {
  const { user, skillGraph, portfolioAnalysis, responses, plan } = state;
  const date = new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
  const avg = (Object.values(skillGraph).reduce((a,b)=>a+b,0)/5).toFixed(1);
  const readiness = Math.round(parseFloat(avg)*10);
  const rcColor = readiness>=70?"#2eb8a0":readiness>=50?"#d4a843":"#e0627a";

  const bar = (v,c) =>
    '<div style="height:6px;background:#1e1e1e;border-radius:3px;margin-top:4px;">'
    + '<div style="height:100%;width:' + Math.round((v/10)*100) + '%;background:' + c + ';border-radius:3px;"></div></div>';

  const skillRows = Object.entries(skillGraph).map(([k,v]) => {
    const ev = portfolioAnalysis?.evidence?.[k] || "";
    return '<div style="margin-bottom:14px;">'
      + '<div style="display:flex;justify-content:space-between;">'
      + '<span style="font-size:13px;color:#888;">' + (SL[k]||k) + '</span>'
      + '<span style="font-size:13px;font-weight:700;color:' + (SK[k]||"#fff") + ';">' + (+v).toFixed(1) + '/10</span>'
      + '</div>' + bar(v, SK[k]||"#5b5bff")
      + (ev ? '<p style="font-size:10px;color:#555;margin-top:4px;">' + ev + '</p>' : '')
      + '</div>';
  }).join("");

  const evalRows = !(responses&&responses.length)
    ? '<tr><td colspan="4" style="padding:12px 0;color:#555;text-align:center;">No evaluations yet</td></tr>'
    : responses.slice(-10).reverse().map(r => {
        const col = r.score>=8?"#2eb8a0":r.score>=6?"#d4a843":"#e0627a";
        return '<tr style="border-top:1px solid #1e1e1e;">'
          + '<td style="padding:9px 0;font-size:12px;color:#aaa;">' + (r.taskTitle||"Task") + '</td>'
          + '<td style="padding:9px 0;font-size:12px;color:#aaa;text-align:center;">' + r.date + '</td>'
          + '<td style="padding:9px 0;font-size:13px;font-weight:700;color:' + col + ';text-align:center;">' + r.score + '/10</td>'
          + '<td style="padding:9px 0;font-size:11px;color:#666;text-align:center;">' + (r.level||"—") + '</td>'
          + '</tr>';
      }).join("");

  const monthRows = (plan?.months||[]).map(m => {
    const col = Object.values(SK)[m.month % 5] || "#5b5bff";
    return '<div style="margin-bottom:12px;padding:14px;background:#111;border-radius:8px;border-left:3px solid ' + col + ';">'
      + '<div style="display:flex;justify-content:space-between;margin-bottom:5px;">'
      + '<span style="font-size:13px;font-weight:700;">Month ' + m.month + ': ' + m.theme + '</span>'
      + '<span style="font-size:10px;color:#5b5bff;">' + (SL[m.focus]||m.focus) + '</span>'
      + '</div><p style="font-size:12px;color:#888;margin-bottom:4px;">' + m.goal + '</p>'
      + '<p style="font-size:11px;color:#555;font-style:italic;">Milestone: ' + m.milestone + '</p>'
      + '</div>';
  }).join("");

  const paGaps = (portfolioAnalysis?.immediate_gaps||[]).map(g=>'<p style="font-size:12px;color:#e0627a;padding:3px 0;">• '+g+'</p>').join("");
  const paStr  = (portfolioAnalysis?.strengths||[]).map(s=>'<p style="font-size:12px;color:#2eb8a0;padding:3px 0;">• '+s+'</p>').join("");

  const css = "body{font-family:Helvetica Neue,Helvetica,Arial,sans-serif;background:#0d0d0d;color:#f0eef8;margin:0;padding:40px;}"
    + ".page{max-width:750px;margin:0 auto;}"
    + ".sec{background:#111;border:1px solid #1e1e1e;border-radius:10px;padding:22px;margin-bottom:18px;}"
    + "table{width:100%;border-collapse:collapse;}"
    + "th{text-align:left;font-size:10px;color:#555;font-weight:400;padding-bottom:9px;letter-spacing:.06em;}"
    + "@media print{body{background:#fff;color:#000;}.sec{background:#f8f8f8;border-color:#ddd;}}";

  const metaItems = [["TARGET ROLE",user.targetRole,"#f0eef8"],["EXPERIENCE",user.experience+" years","#f0eef8"],["READINESS",readiness+"%",rcColor],["AVG SCORE",avg+"/10","#f0eef8"],["DATE",date,"#f0eef8"]]
    .map(([k,v,c])=>'<div><div style="font-size:14px;font-weight:700;color:'+c+';">'+v+'</div><div style="font-size:9px;color:#555;margin-top:2px;">'+k+'</div></div>')
    .join("");

  let html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>MDC \u2014 " + user.name + "</title><style>" + css + "</style></head><body><div class=\"page\">";
  html += '<div class="sec" style="background:linear-gradient(135deg,rgba(91,91,255,.12),rgba(155,139,232,.06));border-color:rgba(91,91,255,.25);">';
  html += '<div style="font-size:10px;color:#5b5bff;letter-spacing:.1em;margin-bottom:10px;">MAANG DESIGNER COACH \u2014 PROFILE REPORT</div>';
  html += '<h1 style="font-size:26px;font-weight:700;margin:0 0 12px;">' + user.name + '</h1>';
  html += '<div style="display:flex;gap:28px;flex-wrap:wrap;">' + metaItems + '</div></div>';
  html += '<div class="sec"><div style="font-size:10px;color:#555;letter-spacing:.08em;margin-bottom:14px;">SKILL GRAPH</div>' + skillRows + '</div>';
  if (portfolioAnalysis) {
    html += '<div class="sec"><div style="font-size:10px;color:#555;margin-bottom:10px;">PORTFOLIO ASSESSMENT</div>';
    html += '<p style="font-size:13px;line-height:1.7;color:#aaa;margin-bottom:12px;">' + (portfolioAnalysis.overall_assessment||"") + '</p>';
    if (paGaps) html += '<div style="margin-bottom:10px;"><div style="font-size:10px;color:#e0627a;margin-bottom:6px;">TOP GAPS</div>' + paGaps + '</div>';
    if (paStr)  html += '<div><div style="font-size:10px;color:#2eb8a0;margin-bottom:6px;">STRENGTHS</div>' + paStr + '</div>';
    html += '</div>';
  }
  if (responses&&responses.length) {
    html += '<div class="sec"><div style="font-size:10px;color:#555;margin-bottom:12px;">EVALUATION HISTORY</div>';
    html += '<table><thead><tr><th>TASK</th><th style="text-align:center;">DATE</th><th style="text-align:center;">SCORE</th><th style="text-align:center;">LEVEL</th></tr></thead><tbody>' + evalRows + '</tbody></table></div>';
  }
  if (plan?.months?.length) {
    html += '<div class="sec"><div style="font-size:10px;color:#555;margin-bottom:12px;">6-MONTH ROADMAP</div>' + monthRows + '</div>';
  }
  html += '<div style="text-align:center;padding:16px 0;font-size:10px;color:#333;">Generated by MAANG Designer Coach \u00b7 ' + date + '</div>';
  html += '</div></body></html>';

  const fname = "MDC-" + user.name.replace(/\s+/g,"-") + "-" + new Date().toISOString().split("T")[0] + ".html";
  const a = Object.assign(document.createElement("a"),{href:URL.createObjectURL(new Blob([html],{type:"text/html"})),download:fname});
  a.click();
}

// ── Onboarding ────────────────────────────────────────────────────────────────
function StepDots({ current }) {
  const labels = ["Profile","Resume","Portfolio","Analysis","Results"];
  return (
    <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:34}}>
      {labels.map((label,i) => {
        const done=i<current, active=i===current;
        return (
          <div key={i} style={{display:"flex",alignItems:"center",flex:i<labels.length-1?1:"none"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{width:26,height:26,borderRadius:"50%",flexShrink:0,
                background:done?"var(--accent)":active?"rgba(91,91,255,.18)":"var(--bg3)",
                border:`1.5px solid ${done||active?"var(--accent)":"var(--border)"}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:10,fontFamily:"var(--mono)",fontWeight:600,
                color:done?"#fff":active?"var(--accent)":"var(--text3)",
                transition:"all .3s"}}>
                {done?"✓":i+1}
              </div>
              <span style={{fontSize:9,fontFamily:"var(--mono)",
                color:active?"var(--accent)":done?"var(--text2)":"var(--text3)",
                whiteSpace:"nowrap"}}>
                {label}
              </span>
            </div>
            {i<labels.length-1&&<div style={{flex:1,height:1,background:done?"var(--accent)":"var(--border)",margin:"0 5px",marginBottom:20,transition:"background .4s"}}/>}
          </div>
        );
      })}
    </div>
  );
}

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({name:"",experience:"",targetRole:ROLES[0]});
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeExtracting, setResumeExtracting] = useState(false);
  const [resumeExtracted, setResumeExtracted] = useState(false);
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [portfolioDesc, setPortfolioDesc] = useState("");
  const [portfolioExtracting, setPortfolioExtracting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState(null);
  const [plan, setPlan] = useState(null);
  const [err, setErr] = useState(null);

  const handleResumeFile = async f => {
    setResumeFile(f); setResumeExtracting(true); setResumeExtracted(false); setResumeText("");
    const text = await readFileAsText(f);
    setResumeText(text || "");
    setResumeExtracted(!!text);
    setResumeExtracting(false);
  };

  const handlePortfolioFile = async f => {
    setPortfolioFile(f); setPortfolioExtracting(true);
    const text = await readFileAsText(f);
    if (text && !portfolioDesc) setPortfolioDesc(text.slice(0,2000));
    setPortfolioExtracting(false);
  };

  const runAnalysis = async () => {
    setAnalyzing(true); setErr(null); setStep(3);
    const msgs = ["Reading your resume...","Scanning portfolio...","Scoring vs MAANG bar...","Finding skill gaps...","Building 6-month plan..."];
    let pi = 0; setProgress(msgs[0]);
    const iv = setInterval(()=>{ pi=Math.min(pi+1,msgs.length-1); setProgress(msgs[pi]); }, 2800);
    try {
      const r = await analyzeProfile({
        resumeText: (resumeText||"").trim(),
        resumeFile,
        portfolioUrl: (portfolioUrl||"").trim(),
        portfolioDesc: (portfolioDesc||"").trim(),
        portfolioFile,
        experience: form.experience,
        targetRole: form.targetRole
      });
      if (!r) throw new Error("Analysis returned no data. Please check your Anthropic API key is set correctly.");
      setResult(r);
      clearInterval(iv);
      setProgress("Generating your 6-month plan...");
      const p = await gen6MonthPlan(form, r.scores, r);
      setPlan(p);
      setStep(4);
    } catch(e) {
      clearInterval(iv);
      console.error("Analysis error:", e);
      const msg = e.message || "Analysis failed";
      // Give actionable guidance based on error type
      if (msg.includes("API key") || msg.includes("401") || msg.includes("auth")) {
        setErr("Invalid API key. Make sure you are using this app through Claude.ai where the API key is provided automatically.");
      } else if (msg.includes("pattern") || msg.includes("URL") || msg.includes("DOM")) {
        setErr("Browser error: " + msg + ". Try refreshing the page and trying again.");
      } else {
        setErr(msg);
      }
      setStep(2);
    }
    finally { setAnalyzing(false); }
  };

  const finish = () => {
    const sg = result.scores;
    const readiness = Math.round(Object.values(sg).reduce((a,b)=>a+b,0)/5*10);
    const state = {user:{...form},skillGraph:sg,portfolioAnalysis:result,plan,tasks:[],responses:[],streak:0,lastActive:null,readinessScore:readiness,createdAt:Date.now()};
    saveS(state); onComplete(state);
  };

  // Step 0: Welcome
  if (step===0) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
      <div className="fu" style={{maxWidth:500,textAlign:"center"}}>
        <div style={{width:58,height:58,borderRadius:14,background:"rgba(91,91,255,.14)",border:"1px solid rgba(91,91,255,.28)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 22px"}}>🎯</div>
        <h1 style={{fontSize:32,fontWeight:700,marginBottom:10,letterSpacing:"-.03em",lineHeight:1.1}}>MAANG Designer<br/>Coach</h1>
        <p style={{color:"var(--text2)",fontSize:14,lineHeight:1.8,marginBottom:10}}>AI training system preparing product designers for MAANG roles in 6 months.</p>
        <p style={{color:"var(--text3)",fontSize:12,lineHeight:1.7,marginBottom:30,fontFamily:"var(--mono)"}}>We analyze your actual resume & portfolio — not self-reported scores.</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:30}}>
          {["Resume & portfolio analysis","Evidence-based skill scores","Daily 60-min tasks","MAANG-bar evaluations","6-month calendar","Downloadable reports"].map(f=>(
            <div key={f} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:20}}>
              <span style={{color:"var(--teal)",fontSize:10}}>✓</span><span style={{fontSize:11,color:"var(--text2)"}}>{f}</span>
            </div>
          ))}
        </div>
        <Btn onClick={()=>setStep(1)} size="lg">Get Started →</Btn>
      </div>
    </div>
  );

  // Step 1: Basics
  if (step===1) return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
      <div style={{width:"100%",maxWidth:480}}>
        <StepDots current={0}/>
        <h2 className="fu" style={{fontSize:22,fontWeight:700,marginBottom:5,letterSpacing:"-.02em"}}>About you</h2>
        <p className="fu1" style={{color:"var(--text2)",fontSize:13,marginBottom:24}}>Context to calibrate your analysis.</p>
        <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:24}}>
          <Inp label="YOUR NAME" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="Alex Chen" required/>
          <Inp label="YEARS OF DESIGN EXPERIENCE" type="number" value={form.experience} onChange={v=>setForm(f=>({...f,experience:v}))} placeholder="4" required/>
          <div>
            <label style={{fontSize:11,color:"var(--text2)",fontFamily:"var(--mono)",letterSpacing:".05em",display:"block",marginBottom:8}}>TARGET ROLE</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {ROLES.map(r=>(
                <button key={r} onClick={()=>setForm(f=>({...f,targetRole:r}))} style={{padding:"8px 14px",borderRadius:"var(--r2)",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .2s",background:form.targetRole===r?"var(--accent)":"var(--bg3)",color:form.targetRole===r?"#fff":"var(--text2)",border:`1px solid ${form.targetRole===r?"var(--accent)":"var(--border)"}`}}>{r}</button>
              ))}
            </div>
          </div>
        </div>
        <Btn onClick={()=>setStep(2)} disabled={!form.name||!form.experience}>Continue →</Btn>
      </div>
    </div>
  );

  // Step 2: Resume + Portfolio
  if (step===2) return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
      <div style={{width:"100%",maxWidth:700}}>
        <StepDots current={1}/>
        {err&&<div style={{background:"rgba(224,98,122,.1)",border:"1px solid rgba(224,98,122,.2)",borderRadius:"var(--r2)",padding:"11px 14px",marginBottom:18,color:"var(--pink)",fontSize:12,display:"flex",gap:7}}>⚠️ {err}</div>}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          {/* Resume */}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <div style={{width:26,height:26,borderRadius:7,background:"rgba(91,91,255,.14)",border:"1px solid rgba(91,91,255,.22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>📄</div>
              <div><h3 style={{fontSize:14,fontWeight:700}}>Resume</h3><p style={{fontSize:11,color:"var(--text3)"}}>Upload PDF or paste text</p></div>
            </div>
            <FileZone label="Upload Resume" hint="PDF, DOCX, TXT · drag & drop" accept=".pdf,.doc,.docx,.txt" onFile={handleResumeFile} file={resumeFile} icon="📄" extracting={resumeExtracting}/>

            {/* Extraction status */}
            {!resumeExtracting && resumeFile && (
              <p style={{fontSize:10,fontFamily:"var(--mono)",marginTop:5,
                color:resumeExtracted?"var(--teal)":"var(--gold)"}}>
                {resumeExtracted
                  ? "✓ Text extracted — review below"
                  : "⚠ Could not read PDF text — paste your resume below"}
              </p>
            )}

            <div style={{display:"flex",alignItems:"center",gap:8,margin:"10px 0"}}>
              <div style={{flex:1,height:1,background:"var(--border)"}}/>
              <span style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--mono)"}}>or paste text</span>
              <div style={{flex:1,height:1,background:"var(--border)"}}/>
            </div>
            <Inp multiline rows={9} value={resumeText} onChange={v=>setResumeText(v)}
              placeholder={"Google, Senior UX Designer (2021–2024)\n• Led Search redesign — +18% CTR\n• Built design system for 40 designers\n• 200+ user research sessions\n\nPaste your full resume here for best results"}/>
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:4}}>
              <span style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--mono)"}}>{resumeText.length} chars</span>
            </div>
          </div>

          {/* Portfolio */}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <div style={{width:26,height:26,borderRadius:7,background:"rgba(224,98,122,.14)",border:"1px solid rgba(224,98,122,.22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🎨</div>
              <div><h3 style={{fontSize:14,fontWeight:700}}>Portfolio</h3><p style={{fontSize:11,color:"var(--text3)"}}>File + URL + case studies</p></div>
            </div>
            <FileZone label="Upload Portfolio PDF" hint="PDF, images · drag & drop" accept=".pdf,.png,.jpg,.zip" onFile={handlePortfolioFile} file={portfolioFile} icon="🎨" extracting={portfolioExtracting}/>
            <Inp style={{marginTop:10}} value={portfolioUrl} onChange={v=>setPortfolioUrl(v)} placeholder="https://yourportfolio.com (optional)"/>
            <Inp style={{marginTop:10}} multiline rows={6} value={portfolioDesc} onChange={v=>setPortfolioDesc(v)}
              placeholder={"Describe your 2-3 best case studies:\n• Problem + business context\n• Process and key decisions\n• Trade-offs you navigated\n• Measurable outcomes\n\nMore detail = more accurate scores"}/>
          </div>
        </div>

        <div style={{background:"rgba(91,91,255,.05)",border:"1px solid rgba(91,91,255,.14)",borderRadius:"var(--r)",padding:"11px 14px",margin:"14px 0",display:"flex",gap:9}}>
          <span style={{fontSize:14,flexShrink:0}}>🔒</span>
          <p style={{fontSize:11,color:"var(--text3)",lineHeight:1.6}}>Data stays in your browser. Only the AI analysis call is sent externally.</p>
        </div>

        <div style={{display:"flex",gap:10}}>
          <Btn onClick={()=>setStep(1)} v="sec">← Back</Btn>
          <Btn onClick={runAnalysis} loading={analyzing}
            disabled={!resumeText.trim()&&!resumeFile&&!portfolioDesc.trim()&&!portfolioFile}>
            Analyze My Profile →
          </Btn>
        </div>
        <p style={{fontSize:10,color:"var(--text3)",marginTop:8,fontFamily:"var(--mono)"}}>Provide resume or portfolio to continue</p>
      </div>
    </div>
  );

  // Step 3: Loading
  if (step===3) return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",gap:28}}>
      <StepDots current={2}/>
      <div style={{textAlign:"center"}}>
        <div style={{position:"relative",width:70,height:70,margin:"0 auto 22px"}}>
          <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"1.5px solid rgba(91,91,255,.15)",animation:"spin 3s linear infinite"}}/>
          <div style={{position:"absolute",inset:8,borderRadius:"50%",border:"1.5px solid rgba(91,91,255,.25)",animation:"spin 2s linear infinite reverse"}}/>
          <div style={{position:"absolute",inset:16,borderRadius:"50%",background:"rgba(91,91,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🎯</div>
        </div>
        <h3 style={{fontSize:17,fontWeight:700,marginBottom:7}}>Analyzing your profile</h3>
        <p style={{fontSize:12,color:"var(--text2)",fontFamily:"var(--mono)",animation:"pulse 2s ease infinite"}}>{progress}</p>
        <p style={{fontSize:11,color:"var(--text3)",marginTop:12}}>30–45 seconds · reading every detail of your experience</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,maxWidth:380,width:"100%"}}>
        {Object.entries(SL).map(([k,label],i)=>(
          <div key={k} className={"fu"+i} style={{padding:"9px 13px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r2)",display:"flex",alignItems:"center",gap:8,gridColumn:i===4?"1/-1":"auto"}}>
            <span style={{fontSize:13}}>{["💡","✏️","⚙️","🤖","🗣️"][i]}</span>
            <span style={{fontSize:11,color:"var(--text2)"}}>{label}</span>
            <span style={{marginLeft:"auto",width:5,height:5,borderRadius:"50%",background:Object.values(SK)[i],animation:"pulse 1.4s ease infinite"}}/>
          </div>
        ))}
      </div>
    </div>
  );

  // Step 4: Results
  if (step===4&&result) {
    const avg = Object.values(result.scores).reduce((a,b)=>a+b,0)/5;
    const readiness = Math.round(avg*10);
    const lc = avg>=8?"var(--teal)":avg>=6?"var(--gold)":"var(--pink)";
    const ll = avg>=8?"Close to MAANG Bar":avg>=6?"Approaching Bar":avg>=4?"Building Foundations":"Early Stage";
    return (
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",padding:"44px 20px"}}>
        <div style={{width:"100%",maxWidth:700}}>
          <StepDots current={4}/>
          <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:14}}>
            <div>
              <Badge c="success" style={{marginBottom:10}}>Analysis Complete</Badge>
              <h2 style={{fontSize:22,fontWeight:700}}>Your Skill Baseline</h2>
              <p style={{color:"var(--text2)",fontSize:12,marginTop:3}}>Scored from your actual resume & portfolio</p>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:40,fontWeight:700,color:lc,lineHeight:1,fontFamily:"var(--mono)"}}>{readiness}%</div>
              <div style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--mono)",marginTop:1}}>MAANG READINESS</div>
              <div style={{fontSize:12,color:lc,marginTop:3,fontWeight:600}}>{ll}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1.1fr 1fr",gap:14,marginBottom:14}}>
            <Card cls="fu1">
              <div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)",marginBottom:14}}>SKILL SCORES</div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {Object.entries(result.scores).map(([k,v])=><Bar key={k} label={SL[k]} value={v} color={SK[k]} evidence={result.evidence?.[k]}/>)}
              </div>
            </Card>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {result.overall_assessment&&<Card cls="fu2" style={{borderLeft:"3px solid var(--accent)"}}><div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)",marginBottom:8}}>ASSESSMENT</div><p style={{fontSize:12,lineHeight:1.75}}>{result.overall_assessment}</p></Card>}
              {result.immediate_gaps?.length>0&&<Card cls="fu3" style={{borderColor:"rgba(224,98,122,.2)"}}><div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--pink)",marginBottom:7}}>TOP GAPS</div>{result.immediate_gaps.map((g,i)=><p key={i} style={{fontSize:11,color:"var(--text2)",lineHeight:1.6,padding:"2px 0"}}>• {g}</p>)}</Card>}
              {result.strengths?.length>0&&<Card cls="fu4" style={{borderColor:"rgba(46,184,160,.2)"}}><div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--teal)",marginBottom:7}}>STRENGTHS</div>{result.strengths.map((s,i)=><p key={i} style={{fontSize:11,color:"var(--text2)",lineHeight:1.6,padding:"2px 0"}}>• {s}</p>)}</Card>}
              {result.recommended_start&&<Card cls="fu5" style={{background:"rgba(91,91,255,.06)",borderColor:"rgba(91,91,255,.2)"}}><div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--accent)",marginBottom:6}}>START HERE</div><p style={{fontSize:11,lineHeight:1.65,color:"var(--text2)"}}>{result.recommended_start}</p></Card>}
            </div>
          </div>
          {plan?.months?.length>0&&(
            <Card cls="fu4" style={{marginBottom:14,background:"rgba(91,91,255,.04)",borderColor:"rgba(91,91,255,.18)"}}>
              <div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--accent)",marginBottom:10}}>6-MONTH ROADMAP PREVIEW</div>
              <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
                {plan.months.map(m=>(
                  <div key={m.month} style={{flexShrink:0,width:135,padding:"10px 12px",background:"var(--bg3)",borderRadius:"var(--r2)",borderTop:`3px solid ${Object.values(SK)[m.month%5]}`}}>
                    <div style={{fontSize:9,fontFamily:"var(--mono)",color:"var(--text3)",marginBottom:3}}>MONTH {m.month}</div>
                    <p style={{fontSize:11,fontWeight:600,lineHeight:1.35,marginBottom:3}}>{m.theme}</p>
                    <p style={{fontSize:10,color:"var(--text3)"}}>{SL[m.focus]||m.focus}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <Btn onClick={()=>{setStep(2);setResult(null);setPlan(null);}} v="sec" size="sm">← Re-analyze</Btn>
            <Btn onClick={finish} size="lg">Start My Training →</Btn>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ state, onNavigate, onUpdate }) {
  const { user, skillGraph, tasks, streak, readinessScore, portfolioAnalysis, responses } = state;
  const todayDone = tasks.some(t=>t.date===new Date().toDateString()&&t.completed);
  const totalDone = tasks.filter(t=>t.completed).length;
  const avg = Object.values(skillGraph).reduce((a,b)=>a+b,0)/5;
  const level = avg>=8?"MAANG Ready":avg>=6?"Approaching Bar":avg>=4?"Building Foundations":"Early Stage";
  const lc = avg>=8?"var(--teal)":avg>=6?"var(--gold)":"var(--pink)";
  return (
    <div style={{maxWidth:960,margin:"0 auto",padding:"28px 20px"}}>
      <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22,flexWrap:"wrap",gap:12}}>
        <div>
          <p style={{fontFamily:"var(--mono)",color:"var(--text3)",fontSize:11,marginBottom:4}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</p>
          <h1 style={{fontSize:24,fontWeight:700,letterSpacing:"-.02em"}}>Welcome back, {user.name}</h1>
          <div style={{display:"flex",gap:8,marginTop:7}}><Badge c="lav">{user.targetRole}</Badge><Badge c={portfolioAnalysis?"success":"muted"}>{portfolioAnalysis?"Portfolio-calibrated":"Baseline"}</Badge></div>
        </div>
        <div style={{display:"flex",gap:9}}>
          <Btn onClick={()=>downloadReport(state)} v="sec" size="sm">⬇ Report</Btn>
          <Btn onClick={()=>onNavigate("profile")} v="sec" size="sm">Profile →</Btn>
        </div>
      </div>
      <div className="fu1" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        {[{label:"Readiness",value:readinessScore+"%",color:lc,sub:level},{label:"Day Streak",value:streak+"🔥",color:"var(--gold)"},{label:"Tasks Done",value:totalDone,color:"var(--teal)"},{label:"Today",value:todayDone?"✓ Done":"Pending",color:todayDone?"var(--teal)":"var(--pink)"}].map(({label,value,color,sub})=>(
          <Card key={label} style={{padding:"14px 16px",textAlign:"center"}}>
            <div style={{fontSize:20,fontWeight:700,color,marginBottom:2,fontFamily:"var(--mono)"}}>{value}</div>
            {sub&&<div style={{fontSize:9,color,fontFamily:"var(--mono)",marginBottom:2}}>{sub}</div>}
            <div style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--mono)",letterSpacing:".05em"}}>{label}</div>
          </Card>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1.2fr",gap:14,marginBottom:14}}>
        <Card cls="fu2">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <h3 style={{fontSize:13,fontWeight:700}}>Skill Graph</h3>
            <Badge c={portfolioAnalysis?"success":"muted"} style={{fontSize:9}}>{portfolioAnalysis?"Portfolio-calibrated":"Baseline"}</Badge>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {Object.entries(skillGraph).map(([k,v])=><Bar key={k} label={SL[k]} value={v} color={SK[k]}/>)}
          </div>
          {portfolioAnalysis?.overall_assessment&&<p style={{fontSize:10,color:"var(--text3)",marginTop:12,paddingTop:10,borderTop:"1px solid var(--border)",lineHeight:1.6,fontFamily:"var(--mono)"}}>{portfolioAnalysis.overall_assessment}</p>}
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Card cls="fu3" style={{background:"linear-gradient(135deg,rgba(91,91,255,.08),rgba(155,139,232,.04))",borderColor:"rgba(91,91,255,.2)",flex:1}}>
            <Badge c="accent" style={{marginBottom:9}}>TODAY'S TASK</Badge>
            <h3 style={{fontSize:15,fontWeight:700,margin:"7px 0 6px",lineHeight:1.3}}>{todayDone?"Task complete! 🎉":"Your 60-min challenge awaits"}</h3>
            <p style={{fontSize:12,color:"var(--text2)",lineHeight:1.65,marginBottom:12}}>{todayDone?"Great work. Come back tomorrow.":"Personalized task calibrated to your skill gaps."}</p>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={()=>onNavigate("task")} v={todayDone?"sec":"pri"} size="sm">{todayDone?"View Task":"Start Task →"}</Btn>
              <Btn onClick={()=>onNavigate("submit")} v="sec" size="sm">📤 Submit Work</Btn>
            </div>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <Card cls="fu4" style={{cursor:"pointer",padding:16}} onClick={()=>onNavigate("calendar")}>
              <div style={{fontSize:20,marginBottom:6}}>📅</div>
              <h4 style={{fontSize:12,fontWeight:700,marginBottom:2}}>6-Month Plan</h4>
              <p style={{fontSize:10,color:"var(--text3)"}}>Training calendar</p>
            </Card>
            <Card cls="fu5" style={{cursor:"pointer",padding:16}} onClick={()=>onNavigate("chat")}>
              <div style={{fontSize:20,marginBottom:6}}>💬</div>
              <h4 style={{fontSize:12,fontWeight:700,marginBottom:2}}>Coach Chat</h4>
              <p style={{fontSize:10,color:"var(--text3)"}}>Ask questions</p>
            </Card>
          </div>
        </div>
      </div>
      {responses.length>0&&(
        <Card cls="fu4">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h3 style={{fontSize:13,fontWeight:700}}>Recent Evaluations</h3>
            <button onClick={()=>onNavigate("history")} style={{fontSize:11,color:"var(--accent)",background:"none",border:"none",cursor:"pointer"}}>View all →</button>
          </div>
          {responses.slice(-3).reverse().map((r,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",background:"var(--bg3)",borderRadius:"var(--r2)",marginBottom:6,cursor:"pointer"}}
              onClick={()=>onNavigate("history")} onMouseEnter={e=>e.currentTarget.style.background="var(--bg4)"} onMouseLeave={e=>e.currentTarget.style.background="var(--bg3)"}>
              <div><span style={{fontSize:12,fontWeight:600}}>{r.taskTitle||"Task"}</span><span style={{fontSize:10,color:"var(--text3)",marginLeft:9,fontFamily:"var(--mono)"}}>{r.date}</span></div>
              <div style={{display:"flex",gap:7}}>{r.level&&<Badge c="muted" style={{fontSize:9}}>{r.level}</Badge>}<Badge c={r.score>=8?"success":r.score>=6?"warn":"danger"}>{r.score}/10</Badge></div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ── Profile Page ──────────────────────────────────────────────────────────────
function ProfilePage({ state, onNavigate }) {
  const { user, skillGraph, portfolioAnalysis, responses, readinessScore } = state;
  const avg = Object.values(skillGraph).reduce((a,b)=>a+b,0)/5;
  const lc = avg>=8?"var(--teal)":avg>=6?"var(--gold)":"var(--pink)";
  return (
    <div style={{maxWidth:860,margin:"0 auto",padding:"28px 20px"}}>
      <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,flexWrap:"wrap",gap:12}}>
        <div><h2 style={{fontSize:22,fontWeight:700,marginBottom:4}}>My Profile</h2><p style={{color:"var(--text2)",fontSize:13}}>Your baseline assessment and evaluation history</p></div>
        <Btn onClick={()=>downloadReport(state)} v="pri" size="sm">⬇ Download Full Report</Btn>
      </div>
      <Card cls="fu1" style={{marginBottom:14,background:"linear-gradient(135deg,rgba(91,91,255,.08),rgba(155,139,232,.04))",borderColor:"rgba(91,91,255,.2)"}}>
        <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{width:50,height:50,borderRadius:13,background:"var(--accent)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"#fff",flexShrink:0}}>{user.name[0]}</div>
          <div style={{flex:1}}>
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:5}}>{user.name}</h3>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><Badge c="lav">{user.targetRole}</Badge><Badge c="muted">{user.experience} years exp</Badge><Badge c={portfolioAnalysis?"success":"muted"}>{portfolioAnalysis?"Portfolio analyzed":"No portfolio"}</Badge></div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:34,fontWeight:700,color:lc,fontFamily:"var(--mono)"}}>{readinessScore}%</div>
            <div style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--mono)"}}>MAANG READINESS</div>
          </div>
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card cls="fu2">
          <h3 style={{fontSize:13,fontWeight:700,marginBottom:13}}>Skill Baseline</h3>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {Object.entries(skillGraph).map(([k,v])=><Bar key={k} label={SL[k]} value={v} color={SK[k]} evidence={portfolioAnalysis?.evidence?.[k]}/>)}
          </div>
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {portfolioAnalysis
            ? <>
                <Card cls="fu3" style={{borderLeft:"3px solid var(--accent)"}}><div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)",marginBottom:7}}>PORTFOLIO ASSESSMENT</div><p style={{fontSize:12,lineHeight:1.75}}>{portfolioAnalysis.overall_assessment}</p></Card>
                {portfolioAnalysis.immediate_gaps?.length>0&&<Card cls="fu4" style={{borderColor:"rgba(224,98,122,.2)"}}><div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--pink)",marginBottom:7}}>GAPS TO CLOSE</div>{portfolioAnalysis.immediate_gaps.map((g,i)=><p key={i} style={{fontSize:11,color:"var(--text2)",padding:"2px 0"}}>• {g}</p>)}</Card>}
                {portfolioAnalysis.strengths?.length>0&&<Card cls="fu5" style={{borderColor:"rgba(46,184,160,.2)"}}><div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--teal)",marginBottom:7}}>STRENGTHS</div>{portfolioAnalysis.strengths.map((s,i)=><p key={i} style={{fontSize:11,color:"var(--text2)",padding:"2px 0"}}>• {s}</p>)}</Card>}
              </>
            : <Card style={{textAlign:"center",padding:30}}><div style={{fontSize:30,marginBottom:10}}>📂</div><p style={{fontSize:13,fontWeight:600,marginBottom:6}}>No portfolio analysis</p><p style={{fontSize:12,color:"var(--text3)"}}>Reset and re-onboard with your resume and portfolio.</p></Card>}
        </div>
      </div>
      {responses.length>0&&(
        <Card cls="fu4">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13}}>
            <h3 style={{fontSize:13,fontWeight:700}}>All Evaluation Results</h3>
            <span style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--mono)"}}>{responses.length} total</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {responses.slice().reverse().map((r,i)=>(
              <div key={i} style={{padding:"10px 13px",background:"var(--bg3)",borderRadius:"var(--r2)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:12,fontWeight:600,marginBottom:2}}>{r.taskTitle||"Design Task"}</div><div style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--mono)"}}>{r.date}</div></div>
                <div style={{display:"flex",gap:7}}>{r.level&&<Badge c="muted" style={{fontSize:9}}>{r.level}</Badge>}<Badge c={r.score>=8?"success":r.score>=6?"warn":"danger"} style={{fontSize:11}}>{r.score}/10</Badge></div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Calendar Page ─────────────────────────────────────────────────────────────
function CalendarPage({ state, onNavigate }) {
  const [activeMonth, setActiveMonth] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [localPlan, setLocalPlan] = useState(state.plan);
  const typeColors = {Book:"#5b5bff",Video:"#e0627a",Practice:"#2eb8a0",Article:"#d4a843",Project:"#9b8be8"};

  const genPlan = async () => {
    setGenerating(true);
    try {
      const p = await gen6MonthPlan(state.user, state.skillGraph, state.portfolioAnalysis);
      setLocalPlan(p);
      saveS({...state, plan:p});
    } catch(e) { console.error(e); }
    setGenerating(false);
  };

  if (!localPlan?.months?.length) return (
    <div style={{maxWidth:760,margin:"0 auto",padding:"28px 20px"}}>
      <h2 className="fu" style={{fontSize:22,fontWeight:700,marginBottom:6}}>6-Month Training Calendar</h2>
      <p className="fu1" style={{color:"var(--text2)",fontSize:13,marginBottom:26}}>Your personalized MAANG prep roadmap.</p>
      <Card style={{textAlign:"center",padding:40}}>
        <div style={{fontSize:40,marginBottom:14}}>📅</div>
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>No plan generated yet</h3>
        <p style={{fontSize:13,color:"var(--text3)",marginBottom:20}}>Generate your 6-month calendar calibrated to your skill gaps.</p>
        <Btn onClick={genPlan} loading={generating}>Generate My 6-Month Plan →</Btn>
      </Card>
    </div>
  );

  const months = localPlan.months;
  const active = months.find(m=>m.month===activeMonth)||months[0];
  return (
    <div style={{maxWidth:960,margin:"0 auto",padding:"28px 20px"}}>
      <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:12}}>
        <div><h2 style={{fontSize:22,fontWeight:700,marginBottom:4}}>6-Month Training Calendar</h2><p style={{color:"var(--text2)",fontSize:13}}>Calibrated to your skill gaps</p></div>
        <div style={{display:"flex",gap:9}}><Btn onClick={genPlan} loading={generating} v="sec" size="sm">↻ Regenerate</Btn><Btn onClick={()=>downloadReport(state)} v="sec" size="sm">⬇ Export</Btn></div>
      </div>
      <div className="fu1" style={{display:"flex",gap:8,marginBottom:18,overflowX:"auto",paddingBottom:4}}>
        {months.map(m=>{
          const col=Object.values(SK)[m.month%5]||"var(--accent)";
          const isA=m.month===activeMonth;
          return (
            <button key={m.month} onClick={()=>setActiveMonth(m.month)} style={{flexShrink:0,padding:"11px 14px",borderRadius:"var(--r)",cursor:"pointer",background:isA?"var(--bg3)":"var(--bg2)",border:`1px solid ${isA?col:"var(--border)"}`,transition:"all .2s",textAlign:"left",minWidth:125,boxShadow:isA?`0 0 18px ${col}20`:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontSize:9,fontFamily:"var(--mono)",color:"var(--text3)"}}>MONTH {m.month}</span><div style={{width:7,height:7,borderRadius:"50%",background:col}}/></div>
              <p style={{fontSize:11,fontWeight:600,lineHeight:1.3,color:isA?"var(--text)":"var(--text2)",marginBottom:2}}>{m.theme}</p>
              <p style={{fontSize:10,color:"var(--text3)"}}>{SL[m.focus]||m.focus}</p>
            </button>
          );
        })}
      </div>
      {active&&(
        <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:14}}>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            <Card cls="fu2" style={{borderTop:`3px solid ${Object.values(SK)[active.month%5]}`}}>
              <div style={{fontSize:9,fontFamily:"var(--mono)",color:"var(--text3)",marginBottom:4}}>MONTH {active.month} OF 6</div>
              <h3 style={{fontSize:16,fontWeight:700,marginBottom:7}}>{active.theme}</h3>
              <div style={{display:"flex",gap:7,marginBottom:10}}><Badge c="accent" style={{fontSize:9}}>{SL[active.focus]||active.focus}</Badge>{active.secondaryFocus&&<Badge c="muted" style={{fontSize:9}}>{SL[active.secondaryFocus]||active.secondaryFocus}</Badge>}</div>
              <p style={{fontSize:12,color:"var(--text2)",lineHeight:1.7,marginBottom:10}}><strong style={{color:"var(--text)"}}>Goal:</strong> {active.goal}</p>
              {active.milestone&&<div style={{padding:"8px 12px",background:"rgba(46,184,160,.07)",borderRadius:"var(--r2)",border:"1px solid rgba(46,184,160,.18)"}}><span style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--teal)"}}>MILESTONE: </span><span style={{fontSize:11,color:"var(--text2)"}}>{active.milestone}</span></div>}
            </Card>
            {active.weeklyTasks?.length>0&&(
              <Card cls="fu3">
                <div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)",marginBottom:11}}>WEEKLY TASKS</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {active.weeklyTasks.map((task,i)=>(
                    <div key={i} style={{display:"flex",gap:9,padding:"9px 11px",background:"var(--bg3)",borderRadius:"var(--r2)"}}>
                      <div style={{width:21,height:21,borderRadius:"50%",background:"rgba(91,91,255,.14)",border:"1px solid rgba(91,91,255,.22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontFamily:"var(--mono)",color:"var(--accent)",flexShrink:0}}>W{i+1}</div>
                      <p style={{fontSize:12,color:"var(--text2)",lineHeight:1.55,paddingTop:1}}>{task}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {active.courses?.length>0&&(
              <Card cls="fu2">
                <div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)",marginBottom:11}}>RECOMMENDED RESOURCES</div>
                <div style={{display:"flex",flexDirection:"column",gap:9}}>
                  {active.courses.map((c,i)=>{
                    const tc=typeColors[c.type]||"var(--accent)";
                    return (
                      <div key={i} style={{padding:"10px 12px",background:"var(--bg3)",borderRadius:"var(--r2)",borderLeft:`2px solid ${tc}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><span style={{fontSize:12,fontWeight:600}}>{c.title}</span><div style={{display:"flex",gap:5}}><Badge c="muted" style={{fontSize:9,color:tc}}>{c.type}</Badge>{c.duration&&<Badge c="muted" style={{fontSize:9}}>{c.duration}</Badge>}</div></div>
                        {c.why&&<p style={{fontSize:11,color:"var(--text3)",lineHeight:1.5}}>{c.why}</p>}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
            {active.expectedScoreGain&&Object.values(active.expectedScoreGain).some(v=>v>0)&&(
              <Card cls="fu3">
                <div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)",marginBottom:11}}>EXPECTED SKILL GAINS</div>
                {Object.entries(active.expectedScoreGain).filter(([,v])=>v>0).map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:"var(--bg3)",borderRadius:"var(--r2)",marginBottom:6}}>
                    <span style={{fontSize:11,color:"var(--text2)"}}>{SL[k]||k}</span>
                    <span style={{fontSize:12,fontWeight:700,color:"var(--teal)",fontFamily:"var(--mono)"}}>+{v}</span>
                  </div>
                ))}
              </Card>
            )}
            <Card cls="fu4" style={{background:"rgba(91,91,255,.04)",borderColor:"rgba(91,91,255,.16)"}}>
              <div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--accent)",marginBottom:8}}>READY TO TRAIN?</div>
              <Btn onClick={()=>onNavigate("task")} size="sm" style={{width:"100%",justifyContent:"center"}}>Get Today's Task →</Btn>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Task Page ─────────────────────────────────────────────────────────────────
function TaskPage({ state, onUpdate, onNavigate }) {
  const [phase, setPhase] = useState("loading");
  const [task, setTask] = useState(null);
  const [response, setResponse] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [improvement, setImprovement] = useState(null);
  const [err, setErr] = useState(null);
  const [timer, setTimer] = useState(3600);
  const [timerOn, setTimerOn] = useState(false);
  const timerRef = useRef(null);

  useEffect(()=>{
    const today = new Date().toDateString();
    const todayTask = state.tasks.find(t=>t.date===today);
    if (todayTask) {
      setTask(todayTask);
      if (todayTask.completed&&todayTask.evaluation) { setEvaluation(todayTask.evaluation); setImprovement(todayTask.improvement); setPhase("done"); }
      else setPhase("task");
    } else loadTask();
    return ()=>clearInterval(timerRef.current);
  },[]);

  useEffect(()=>{
    if (timerOn) timerRef.current=setInterval(()=>setTimer(t=>Math.max(0,t-1)),1000);
    else clearInterval(timerRef.current);
    return()=>clearInterval(timerRef.current);
  },[timerOn]);

  const loadTask = async () => {
    setPhase("loading"); setErr(null);
    try {
      const month = Math.min(6,Math.max(1,Math.floor((Date.now()-(state.createdAt||Date.now()))/(30*86400000))+1));
      const t = await genTask(state.user, state.skillGraph, state.plan, month);
      if (!t) throw new Error("Failed to generate task.");
      const newTask = {...t,date:new Date().toDateString(),completed:false,id:Date.now()};
      setTask(newTask); onUpdate({...state,tasks:[...state.tasks,newTask]}); setPhase("task");
    } catch(e) { setErr(e.message); setPhase("error"); }
  };

  const submit = async () => {
    if (!response.trim()) return; setPhase("evaluating");
    try {
      const ev = await evalWork(task, response);
      if (!ev) throw new Error("Evaluation failed.");
      const imp = await genImprovement(ev, task);
      setEvaluation(ev); setImprovement(imp);
      const sg = {...state.skillGraph};
      const map = {clarity:["communication"],structure:["uxExecution","communication"],tradeoffs:["productThinking","systemsThinking"],depth:["systemsThinking","aiUnderstanding"],metrics:["productThinking"]};
      if (ev.scores) Object.entries(ev.scores).forEach(([d,s])=>{(map[d]||[]).forEach(k=>{sg[k]=Math.round(Math.max(1,Math.min(10,sg[k]*0.72+s*0.28))*10)/10;});});
      const readiness = Math.round(Object.values(sg).reduce((a,b)=>a+b,0)/5*10);
      const newStreak = state.lastActive===new Date(Date.now()-86400000).toDateString()?state.streak+1:state.lastActive===new Date().toDateString()?state.streak:1;
      const updatedTasks = state.tasks.map(t=>t.id===task.id?{...t,completed:true,evaluation:ev,improvement:imp}:t);
      onUpdate({...state,skillGraph:sg,readinessScore:readiness,tasks:updatedTasks,responses:[...state.responses,{taskTitle:task.task_title,date:new Date().toLocaleDateString(),score:ev.final_score,level:ev.level}],streak:newStreak,lastActive:new Date().toDateString()});
      setPhase("done"); setTimerOn(false);
    } catch(e) { setErr(e.message); setPhase("task"); }
  };

  const mins=Math.floor(timer/60), secs=timer%60;
  const tc=timer<600?"var(--pink)":timer<1800?"var(--gold)":"var(--teal)";
  const sc=s=>s>=8?"var(--teal)":s>=6?"var(--gold)":"var(--pink)";

  if (phase==="loading"||phase==="evaluating") return (
    <div style={{minHeight:"60vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}>
      <Spin size={30}/><p style={{color:"var(--text2)",fontFamily:"var(--mono)",fontSize:12}}>{phase==="evaluating"?"Evaluating your response…":"Generating your task…"}</p>
    </div>
  );

  if (phase==="error") return (
    <div style={{maxWidth:460,margin:"80px auto",padding:"0 20px",textAlign:"center"}}>
      <div style={{fontSize:36,marginBottom:12}}>⚠️</div>
      <h3 style={{marginBottom:8}}>Something went wrong</h3>
      <p style={{color:"var(--text2)",marginBottom:20,fontSize:13}}>{err}</p>
      <Btn onClick={loadTask}>Try Again</Btn>
    </div>
  );

  if (phase==="done"&&evaluation) return (
    <div style={{maxWidth:760,margin:"0 auto",padding:"28px 20px"}}>
      <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div><h2 style={{fontSize:20,fontWeight:700}}>Evaluation Results</h2><p style={{color:"var(--text2)",fontSize:12,marginTop:3}}>{task?.task_title}</p></div>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:42,fontWeight:700,color:sc(evaluation.final_score),lineHeight:1,fontFamily:"var(--mono)",animation:"popIn .4s ease"}}>{evaluation.final_score}/10</div>
          <Badge c={evaluation.final_score>=8?"success":evaluation.final_score>=6?"warn":"danger"} style={{marginTop:5}}>{evaluation.level}</Badge>
        </div>
      </div>
      <Card cls="fu1" style={{marginBottom:11}}>
        <div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)",marginBottom:12}}>SCORE BREAKDOWN</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {Object.entries(evaluation.scores||{}).map(([d,s])=><Bar key={d} label={d.charAt(0).toUpperCase()+d.slice(1)} value={s} color={sc(s)}/>)}
        </div>
      </Card>
      <Card cls="fu2" style={{marginBottom:11}}>
        <div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)",marginBottom:11}}>FEEDBACK</div>
        {evaluation.detailed_feedback?.overall&&<div style={{background:"var(--bg3)",borderRadius:"var(--r2)",padding:"11px 13px",marginBottom:10,borderLeft:"2px solid var(--accent)"}}><p style={{fontSize:13,lineHeight:1.75}}>{evaluation.detailed_feedback.overall}</p></div>}
        <div style={{display:"grid",gap:7}}>
          {Object.entries(evaluation.detailed_feedback||{}).filter(([k])=>k!=="overall").map(([d,fb])=>(
            <div key={d} style={{padding:"9px 12px",background:"var(--bg3)",borderRadius:"var(--r2)"}}><span style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)",display:"block",marginBottom:3}}>{d.toUpperCase()}</span><p style={{fontSize:12,lineHeight:1.6}}>{fb}</p></div>
          ))}
        </div>
      </Card>
      {improvement&&(
        <Card cls="fu3" style={{marginBottom:11,borderColor:"rgba(46,184,160,.22)"}}>
          <div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--teal)",marginBottom:12}}>IMPROVEMENT PLAN</div>
          {improvement.root_causes?.length>0&&<div style={{marginBottom:10}}><p style={{fontSize:11,color:"var(--text3)",marginBottom:5}}>Root causes:</p>{improvement.root_causes.map((c,i)=><p key={i} style={{fontSize:12,color:"var(--text2)",lineHeight:1.6,padding:"2px 0"}}>• {c}</p>)}</div>}
          {improvement.action_steps?.length>0&&<div style={{marginBottom:10}}><p style={{fontSize:11,color:"var(--text3)",marginBottom:5}}>Action steps:</p><ol style={{paddingLeft:15}}>{improvement.action_steps.map((s,i)=><li key={i} style={{fontSize:12,lineHeight:1.65,padding:"2px 0"}}>{s}</li>)}</ol></div>}
          {improvement.example_snippet&&<div style={{background:"rgba(46,184,160,.06)",border:"1px solid rgba(46,184,160,.18)",borderRadius:"var(--r2)",padding:"11px 13px",marginBottom:9}}><div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--teal)",marginBottom:6}}>EXAMPLE IMPROVED ANSWER</div><p style={{fontSize:12,lineHeight:1.75}}>{improvement.example_snippet}</p></div>}
          {improvement.reason&&<div style={{padding:"8px 12px",background:"var(--bg3)",borderRadius:"var(--r2)",fontSize:12,color:"var(--text2)"}}>Next: <strong style={{color:"var(--text)"}}>{improvement.reason}</strong></div>}
        </Card>
      )}
      <div style={{display:"flex",gap:9}}><Btn onClick={()=>onNavigate("dashboard")} v="sec">← Dashboard</Btn><Btn onClick={()=>onNavigate("chat")} v="sec">Discuss with Coach →</Btn></div>
    </div>
  );

  return (
    <div style={{maxWidth:760,margin:"0 auto",padding:"28px 20px"}}>
      <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{display:"flex",gap:7,marginBottom:6}}><Badge c="muted">{task?.task_type}</Badge><Badge c={task?.difficulty==="MAANG-Level"?"danger":task?.difficulty==="Advanced"?"warn":"muted"}>{task?.difficulty}</Badge></div>
          <h2 style={{fontSize:17,fontWeight:700}}>{task?.task_title}</h2>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
          <span style={{fontFamily:"var(--mono)",fontSize:22,fontWeight:700,color:tc}}>{String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}</span>
          <Btn onClick={()=>setTimerOn(a=>!a)} v="sec" size="sm">{timerOn?"⏸ Pause":"▶ Start Timer"}</Btn>
        </div>
      </div>
      <Card cls="fu1" style={{marginBottom:9}}><div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)",marginBottom:8}}>PROBLEM STATEMENT</div><p style={{fontSize:13,lineHeight:1.8}}>{task?.problem_statement}</p></Card>
      {task?.time_breakdown?.length>0&&(
        <Card cls="fu2" style={{marginBottom:9}}>
          <div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)",marginBottom:9}}>60-MINUTE BREAKDOWN</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {task.time_breakdown.map((p,i)=>(
              <div key={i} style={{flex:"1 1 130px",background:"var(--bg3)",borderRadius:"var(--r2)",padding:"9px 11px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:9,color:"var(--text3)",fontFamily:"var(--mono)"}}>PHASE {i+1}</span><Badge c="accent" style={{fontSize:9}}>{p.minutes}min</Badge></div>
                <p style={{fontSize:11,fontWeight:600,marginBottom:2}}>{p.phase}</p><p style={{fontSize:10,color:"var(--text3)"}}>{p.goal}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
      <div className="fu3" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:12}}>
        <Card><div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)",marginBottom:7}}>EXPECTED OUTPUT</div><p style={{fontSize:12,lineHeight:1.7}}>{task?.expected_output}</p></Card>
        <Card><div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)",marginBottom:8}}>CRITERIA</div><ul style={{paddingLeft:13}}>{task?.evaluation_criteria?.map((c,i)=><li key={i} style={{fontSize:11,color:"var(--text2)",lineHeight:1.6,padding:"1px 0"}}>{c}</li>)}</ul></Card>
      </div>
      <Card cls="fu4" style={{marginBottom:10}}>
        <div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)",marginBottom:9}}>YOUR RESPONSE</div>
        <Inp multiline rows={10} value={response} onChange={setResponse} placeholder="Walk through your thinking… Cover: user insights → problem framing → solution → trade-offs → metrics."/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:9,flexWrap:"wrap",gap:8}}>
          <span style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--mono)"}}>{response.length} chars · {response.split(/\s+/).filter(Boolean).length} words</span>
          <Btn onClick={submit} disabled={response.trim().length<50}>Submit for Evaluation →</Btn>
        </div>
      </Card>
      {err&&<div style={{background:"rgba(224,98,122,.09)",border:"1px solid rgba(224,98,122,.2)",borderRadius:"var(--r2)",padding:"10px 13px",color:"var(--pink)",fontSize:12}}>⚠️ {err}</div>}
    </div>
  );
}

// ── Submit Work Page ───────────────────────────────────────────────────────────
function SubmitPage({ state, onUpdate, onNavigate }) {
  const [workFile, setWorkFile] = useState(null);
  const [workText, setWorkText] = useState("");
  const [workExtracting, setWorkExtracting] = useState(false);
  const [context, setContext] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [improvement, setImprovement] = useState(null);
  const [err, setErr] = useState(null);

  const handleWorkFile = async f => {
    setWorkFile(f); setWorkExtracting(true);
    const text = await readFileAsText(f);
    if (text) setWorkText(text.slice(0,5000));
    setWorkExtracting(false);
  };

  const submit = async () => {
    const content = workText || (workFile ? "[File: "+workFile.name+"]" : "");
    if (!content) return;
    setEvaluating(true); setErr(null);
    try {
      const fakeTask = {task_title:context||"Submitted Work",problem_statement:context||"Evaluate this design work at MAANG bar.",expected_output:"Portfolio-quality design thinking"};
      const ev = await evalWork(fakeTask, workText||content);
      if (!ev) throw new Error("Evaluation failed.");
      const imp = await genImprovement(ev, fakeTask);
      setEvaluation(ev); setImprovement(imp);
      onUpdate({...state,responses:[...state.responses,{taskTitle:context||"Uploaded Work",date:new Date().toLocaleDateString(),score:ev.final_score,level:ev.level}]});
    } catch(e) { setErr(e.message); }
    setEvaluating(false);
  };

  const sc=s=>s>=8?"var(--teal)":s>=6?"var(--gold)":"var(--pink)";
  return (
    <div style={{maxWidth:760,margin:"0 auto",padding:"28px 20px"}}>
      <h2 className="fu" style={{fontSize:22,fontWeight:700,marginBottom:5}}>Submit Your Work</h2>
      <p className="fu1" style={{color:"var(--text2)",fontSize:13,marginBottom:22}}>Upload design work or paste your writeup for MAANG-bar evaluation.</p>
      {!evaluation
        ? <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Card cls="fu2"><Inp label="TASK / BRIEF CONTEXT (optional)" value={context} onChange={setContext} hint="What was the challenge?" placeholder="e.g. Redesign checkout flow for fintech app…"/></Card>
            <Card cls="fu3">
              <div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)",marginBottom:11}}>UPLOAD YOUR WORK</div>
              <FileZone label="Upload your work" hint="PDF, image, DOCX, any file · drag & drop" accept="*" onFile={handleWorkFile} file={workFile} icon="📤" extracting={workExtracting}/>
              <div style={{display:"flex",alignItems:"center",gap:8,margin:"11px 0"}}>
                <div style={{flex:1,height:1,background:"var(--border)"}}/>
                <span style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--mono)"}}>or write / paste</span>
                <div style={{flex:1,height:1,background:"var(--border)"}}/>
              </div>
              <Inp multiline rows={8} value={workText} onChange={setWorkText} placeholder="Paste your design writeup, case study, wireframe rationale, or any work to be evaluated…"/>
            </Card>
            {err&&<div style={{background:"rgba(224,98,122,.09)",border:"1px solid rgba(224,98,122,.2)",borderRadius:"var(--r2)",padding:"10px 13px",color:"var(--pink)",fontSize:12}}>⚠️ {err}</div>}
            <div style={{display:"flex",gap:9}}><Btn onClick={()=>onNavigate("dashboard")} v="sec">← Back</Btn><Btn onClick={submit} loading={evaluating} disabled={!workText.trim()&&!workFile}>Evaluate My Work →</Btn></div>
          </div>
        : <div>
            <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:12}}>
              <div><h3 style={{fontSize:18,fontWeight:700}}>Work Evaluated</h3><p style={{color:"var(--text2)",fontSize:12,marginTop:3}}>{context||"Uploaded Work"}</p></div>
              <div style={{textAlign:"center"}}><div style={{fontSize:42,fontWeight:700,color:sc(evaluation.final_score),lineHeight:1,fontFamily:"var(--mono)"}}>{evaluation.final_score}/10</div><Badge c={evaluation.final_score>=8?"success":evaluation.final_score>=6?"warn":"danger"} style={{marginTop:5}}>{evaluation.level}</Badge></div>
            </div>
            <Card cls="fu1" style={{marginBottom:11}}><div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)",marginBottom:11}}>SCORES</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{Object.entries(evaluation.scores||{}).map(([d,s])=><Bar key={d} label={d.charAt(0).toUpperCase()+d.slice(1)} value={s} color={sc(s)}/>)}</div></Card>
            <Card cls="fu2" style={{marginBottom:11}}><div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)",marginBottom:10}}>FEEDBACK</div>{evaluation.detailed_feedback?.overall&&<div style={{background:"var(--bg3)",borderRadius:"var(--r2)",padding:"11px 13px",borderLeft:"2px solid var(--accent)"}}><p style={{fontSize:13,lineHeight:1.75}}>{evaluation.detailed_feedback.overall}</p></div>}</Card>
            {improvement?.action_steps?.length>0&&<Card cls="fu3" style={{marginBottom:11,borderColor:"rgba(46,184,160,.2)"}}><div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--teal)",marginBottom:9}}>HOW TO IMPROVE</div>{improvement.action_steps.map((s,i)=><p key={i} style={{fontSize:12,color:"var(--text2)",lineHeight:1.65,padding:"2px 0"}}>• {s}</p>)}{improvement.example_snippet&&<div style={{background:"rgba(46,184,160,.06)",border:"1px solid rgba(46,184,160,.16)",borderRadius:"var(--r2)",padding:"11px 13px",marginTop:10}}><div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--teal)",marginBottom:6}}>EXAMPLE IMPROVED APPROACH</div><p style={{fontSize:12,lineHeight:1.75}}>{improvement.example_snippet}</p></div>}</Card>}
            <div style={{display:"flex",gap:9}}><Btn onClick={()=>{setEvaluation(null);setWorkFile(null);setWorkText("");setContext("");}} v="sec">Submit Another →</Btn><Btn onClick={()=>onNavigate("profile")}>View Profile →</Btn></div>
          </div>}
    </div>
  );
}

// ── History Page ───────────────────────────────────────────────────────────────
function HistoryPage({ state, onNavigate }) {
  const [sel, setSel] = useState(null);
  const done = state.tasks.filter(t=>t.completed);
  if (state.responses.length===0) return (
    <div style={{maxWidth:600,margin:"80px auto",padding:"0 20px",textAlign:"center"}}>
      <div style={{fontSize:40,marginBottom:12}}>📭</div>
      <h3 style={{marginBottom:8}}>No evaluations yet</h3>
      <p style={{color:"var(--text2)",marginBottom:20,fontSize:13}}>Complete your first task to see history.</p>
      <Btn onClick={()=>onNavigate("task")}>Start Today's Task →</Btn>
    </div>
  );
  return (
    <div style={{maxWidth:800,margin:"0 auto",padding:"28px 20px"}}>
      <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:12}}>
        <div><h2 style={{fontSize:22,fontWeight:700,marginBottom:3}}>Evaluation History</h2><p style={{color:"var(--text2)",fontSize:13}}>{done.length} tasks completed</p></div>
        <Btn onClick={()=>downloadReport(state)} v="sec" size="sm">⬇ Download Report</Btn>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {done.slice().reverse().map((task,i)=>{
          const r=state.responses.find(r=>r.taskTitle===task.task_title);
          const score=r?.score||task.evaluation?.final_score||0;
          const open=sel===i;
          return (
            <Card key={i} cls="fu" style={{cursor:"pointer",borderColor:open?"rgba(91,91,255,.3)":"var(--border)",transition:"border-color .2s"}} onClick={()=>setSel(open?null:i)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:open?12:0}}>
                <div><h4 style={{fontSize:13,fontWeight:700,marginBottom:3}}>{task.task_title}</h4><div style={{display:"flex",gap:6}}><Badge c="muted" style={{fontSize:9}}>{task.task_type}</Badge><span style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--mono)"}}>{task.date}</span></div></div>
                <div style={{display:"flex",alignItems:"center",gap:7}}><Badge c={score>=8?"success":score>=6?"warn":"danger"}>{score}/10</Badge><span style={{color:"var(--text3)",fontSize:11}}>{open?"▲":"▼"}</span></div>
              </div>
              {open&&task.evaluation&&(
                <div>
                  <div style={{height:1,background:"var(--border)",marginBottom:11}}/>
                  <p style={{fontSize:12,color:"var(--text2)",lineHeight:1.75,marginBottom:11}}>{task.evaluation.detailed_feedback?.overall}</p>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
                    {Object.entries(task.evaluation.scores||{}).map(([k,v])=>(
                      <div key={k} style={{textAlign:"center",background:"var(--bg3)",borderRadius:"var(--r2)",padding:"7px 4px"}}>
                        <div style={{fontSize:14,fontWeight:700,color:v>=8?"var(--teal)":v>=6?"var(--gold)":"var(--pink)",fontFamily:"var(--mono)"}}>{v}</div>
                        <div style={{fontSize:9,color:"var(--text3)",fontFamily:"var(--mono)"}}>{k.slice(0,5)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Chat Page ─────────────────────────────────────────────────────────────────
function ChatPage({ state }) {
  const [msgs, setMsgs] = useState([{role:"assistant",content:"Hey "+state.user.name+"! I'm your MAANG Design Coach.\n\nAsk me anything:\n• How to structure a design case\n• Skill-specific improvement\n• Mock interview questions\n• Feedback on your thinking"}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  const send = async () => {
    if (!input.trim()||loading) return;
    const m={role:"user",content:input};
    const newMsgs=[...msgs,m]; setMsgs(newMsgs); setInput(""); setLoading(true);
    try { const r=await chatAI(newMsgs,state.user,state.skillGraph); setMsgs(m=>[...m,{role:"assistant",content:r}]); }
    catch { setMsgs(m=>[...m,{role:"assistant",content:"Couldn't connect. Please check your API key."}]); }
    setLoading(false);
  };
  return (
    <div style={{maxWidth:720,margin:"0 auto",padding:"28px 20px",display:"flex",flexDirection:"column",height:"calc(100vh - 80px)"}}>
      <h2 className="fu" style={{fontSize:20,fontWeight:700,marginBottom:4}}>Coach Chat</h2>
      <p className="fu1" style={{color:"var(--text2)",fontSize:12,marginBottom:16}}>Your MAANG-level design mentor</p>
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:11,paddingBottom:12}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",animation:"fadeUp .28s ease"}}>
            {m.role==="assistant"&&<div style={{width:25,height:25,borderRadius:"50%",background:"var(--accent)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,marginRight:8,flexShrink:0,marginTop:2}}>🎯</div>}
            <div style={{maxWidth:"76%",padding:"11px 14px",borderRadius:m.role==="user"?"14px 14px 3px 14px":"14px 14px 14px 3px",background:m.role==="user"?"var(--accent)":"var(--bg2)",border:m.role==="assistant"?"1px solid var(--border)":"none",fontSize:13,lineHeight:1.72,whiteSpace:"pre-wrap"}}>{m.content}</div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:25,height:25,borderRadius:"50%",background:"var(--accent)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>🎯</div><div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"14px 14px 14px 3px",padding:"11px 14px",display:"flex",gap:5}}>{[0,1,2].map(j=><span key={j} style={{width:5,height:5,borderRadius:"50%",background:"var(--text3)",display:"inline-block",animation:`pulse 1.2s ${j*.18}s infinite`}}/>)}</div></div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{display:"flex",gap:7,marginBottom:7,overflowX:"auto",paddingBottom:3}}>
        {["Structure a MAANG case","What metrics matter?","How to show systems thinking?","Give me a mock question"].map(q=>(
          <button key={q} onClick={()=>setInput(q)} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:20,padding:"5px 11px",color:"var(--text2)",fontSize:11,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,transition:"all .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.color="var(--accent)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text2)";}}
          >{q}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:9}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Ask your coach anything…" style={{flex:1,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--r2)",color:"var(--text)",padding:"10px 13px",fontSize:13,outline:"none",transition:"border-color .2s"}} onFocus={e=>e.target.style.borderColor="var(--accent)"} onBlur={e=>e.target.style.borderColor="var(--border)"}/>
        <Btn onClick={send} loading={loading} disabled={!input.trim()}>Send</Btn>
      </div>
      <span style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--mono)",marginTop:5}}>Enter to send · Shift+Enter for new line</span>
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav({ page, onNavigate, userName }) {
  const links=[{id:"dashboard",label:"Dashboard",icon:"◈"},{id:"task",label:"Task",icon:"⚡"},{id:"submit",label:"Submit Work",icon:"📤"},{id:"calendar",label:"Calendar",icon:"📅"},{id:"history",label:"History",icon:"◷"},{id:"profile",label:"Profile",icon:"◉"},{id:"chat",label:"Coach",icon:"💬"}];
  return (
    <nav style={{position:"sticky",top:0,zIndex:50,background:"rgba(9,9,9,.92)",backdropFilter:"blur(18px)",borderBottom:"1px solid var(--border)",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:2}}>
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"0 10px 0 0",marginRight:6,borderRight:"1px solid var(--border)"}}>
          <div style={{width:20,height:20,borderRadius:5,background:"var(--accent)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff"}}>M</div>
          <span style={{fontSize:13,fontWeight:700,letterSpacing:"-.02em"}}>MDC</span>
        </div>
        {links.map(l=>(
          <button key={l.id} onClick={()=>onNavigate(l.id)} style={{padding:"15px 10px",background:"none",border:"none",cursor:"pointer",color:page===l.id?"var(--text)":"var(--text2)",fontSize:12,fontWeight:page===l.id?700:400,borderBottom:page===l.id?"2px solid var(--accent)":"2px solid transparent",transition:"color .18s",display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:11}}>{l.icon}</span>{l.label}
          </button>
        ))}
      </div>
      <span style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--mono)",maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{userName}</span>
    </nav>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [appState, setAppState] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [booting, setBooting] = useState(true);

  useEffect(()=>{
    loadS().then(s=>{ if(s) setAppState(s); setBooting(false); });
  },[]);

  const handleUpdate = s => { setAppState(s); saveS(s); };
  const handleOnboard = s => { setAppState(s); setPage("dashboard"); };
  const handleReset = () => {
    ["mdc_v3","mdc_v2","mdc_v1"].forEach(k=>{
      try{window.storage.delete(k);}catch{}
      try{localStorage.removeItem(k);}catch{}
    });
    setAppState(null); setPage("dashboard");
  };

  if (booting) return (
    <>
      <GlobalStyles/>
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
        <div style={{width:30,height:30,border:"2px solid rgba(91,91,255,.2)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin .65s linear infinite"}}/>
        <p style={{fontSize:12,color:"var(--text3)",fontFamily:"var(--mono)"}}>Restoring your session…</p>
      </div>
    </>
  );

  if (!appState) return <><GlobalStyles/><Onboarding onComplete={handleOnboard}/></>;

  return (
    <>
      <GlobalStyles/>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:"radial-gradient(ellipse at 20% 15%, rgba(91,91,255,.025) 0%, transparent 55%), radial-gradient(ellipse at 80% 85%, rgba(224,98,122,.02) 0%, transparent 55%)"}}/>
      <div style={{position:"relative",zIndex:1}}>
        <Nav page={page} onNavigate={setPage} userName={appState.user.name}/>
        <main>
          {page==="dashboard" && <Dashboard state={appState} onNavigate={setPage} onUpdate={handleUpdate}/>}
          {page==="task"      && <TaskPage state={appState} onUpdate={handleUpdate} onNavigate={setPage}/>}
          {page==="submit"    && <SubmitPage state={appState} onUpdate={handleUpdate} onNavigate={setPage}/>}
          {page==="calendar"  && <CalendarPage state={appState} onNavigate={setPage}/>}
          {page==="history"   && <HistoryPage state={appState} onNavigate={setPage}/>}
          {page==="profile"   && <ProfilePage state={appState} onNavigate={setPage}/>}
          {page==="chat"      && <ChatPage state={appState}/>}
        </main>
        <button onClick={handleReset} style={{position:"fixed",bottom:12,right:12,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text3)",padding:"5px 11px",borderRadius:"var(--r2)",fontSize:10,fontFamily:"var(--mono)",cursor:"pointer"}}>↺ Reset</button>
      </div>
    </>
  );
}
