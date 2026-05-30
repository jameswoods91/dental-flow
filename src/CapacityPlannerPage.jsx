// CapacityPlannerPage.jsx
// Drop-in page for the dental-flow admin app. Adds a Crown & Bridge Consolidation Planner.
// Matches the existing app's conventions: React + lucide-react, localStorage persistence
// (no new dependencies). Import this into your main App file and add it to the NAV/router.
//
// In your main App file:
//   1. import CapacityPlannerPage from "./CapacityPlannerPage";
//   2. add to NAV array:  { id:"capacity", label:"Capacity Planner", icon: BarChart3 }
//      (import BarChart3 from "lucide-react" alongside the others)
//   3. in the page switch, add:  {active === "capacity" && <CapacityPlannerPage />}

import { useState, useEffect } from "react";
import { Plus, Trash2, Layers, Building2, Package, BarChart3, Save, AlertTriangle, CheckCircle2, Flame, Zap, GitBranch, Wrench } from "lucide-react";

const KEY = "cbcons:v2";
// --- Persistence: localStorage. For Supabase later, swap ONLY these two functions. ---
const loadState = async () => {
  try { const v = localStorage.getItem(KEY); return v ? JSON.parse(v) : null; } catch { return null; }
};
const saveState = async (s) => {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { console.error(e); }
};

const DEPTS = { "Data Capture": "#b45309", "Model": "#0d9488", "Design": "#15803d", "Machining": "#be123c", "Wax / Metal": "#1d4ed8", "Finishing": "#7c3aed", "Shipping": "#4f46e5" };

const CB_STEPS = [
  { id: "disinfect", name: "Disinfect", dept: "Data Capture", receipt: "analog", resource: "Labor", perShift: 0, count: 1, shifts: 1, eff: null, capRelevant: false },
  { id: "case_entry", name: "Case Entry", dept: "Data Capture", receipt: "both", resource: "Labor", perShift: 0, count: 1, shifts: 1, eff: null, capRelevant: false },
  { id: "import_files", name: "Import Files", dept: "Data Capture", receipt: "digital", resource: "Labor", perShift: 0, count: 1, shifts: 1, eff: null, capRelevant: false },
  { id: "case_review", name: "Case Review / Planning", dept: "Data Capture", receipt: "both", resource: "Labor", perShift: 0, count: 1, shifts: 1, eff: null, capRelevant: false },
  { id: "pour_model", name: "Pour / Articulate / Trim / Base", dept: "Model", receipt: "analog", resource: "Labor", perShift: 0, count: 1, shifts: 1, eff: null, capRelevant: false },
  { id: "die_trim", name: "Die Trim", dept: "Model", receipt: "analog", resource: "Labor", perShift: 0, count: 1, shifts: 1, eff: null, capRelevant: false },
  { id: "scan_model", name: "Scan Model", dept: "Design", receipt: "analog", resource: "Scanner", perShift: 0, count: 1, shifts: 1, eff: null, capRelevant: false },
  { id: "design", name: "Design", dept: "Design", receipt: "both", resource: "CAD Seat", perShift: 0, count: 4, shifts: 1, eff: null, capRelevant: true },
  { id: "nest_model", name: "Nest Model", dept: "Machining", receipt: "both", resource: "Labor", perShift: 0, count: 1, shifts: 1, eff: null, capRelevant: false },
  { id: "print_model", name: "Print Model", dept: "Machining", receipt: "both", resource: "Printer", perShift: 0, count: 2, shifts: 1, eff: null, capRelevant: false },
  { id: "nest_crown", name: "Nest Crown", dept: "Machining", receipt: "both", resource: "Labor", perShift: 0, count: 1, shifts: 1, eff: null, capRelevant: false },
  { id: "mill_crown", name: "Mill Crown", dept: "Machining", receipt: "both", resource: "Mill", perShift: 0, count: 4, shifts: 2, eff: null, capRelevant: true },
  { id: "despru", name: "De-Spru Crown", dept: "Machining", receipt: "both", resource: "Labor", perShift: 0, count: 1, shifts: 1, eff: null, capRelevant: false },
  { id: "sinter", name: "Sinter Crown", dept: "Machining", receipt: "both", resource: "Sinter Furnace", perShift: 0, count: 3, shifts: 2, eff: null, capRelevant: true },
  { id: "seal_margins", name: "Seal Margins", dept: "Wax / Metal", receipt: "both", resource: "Labor", perShift: 0, count: 1, shifts: 1, eff: null, capRelevant: false },
  { id: "press", name: "Press", dept: "Wax / Metal", receipt: "both", resource: "Press Furnace", perShift: 0, count: 2, shifts: 1, eff: null, capRelevant: true },
  { id: "cast", name: "Cast", dept: "Wax / Metal", receipt: "both", resource: "Casting", perShift: 0, count: 1, shifts: 1, eff: null, capRelevant: true },
  { id: "finish_metal", name: "Finish Metal", dept: "Wax / Metal", receipt: "both", resource: "Labor", perShift: 0, count: 1, shifts: 1, eff: null, capRelevant: false },
  { id: "opaque", name: "Opaque", dept: "Wax / Metal", receipt: "both", resource: "Labor", perShift: 0, count: 1, shifts: 1, eff: null, capRelevant: false },
  { id: "polish", name: "Polish Crown", dept: "Finishing", receipt: "both", resource: "Labor", perShift: 0, count: 1, shifts: 1, eff: null, capRelevant: false },
  { id: "stain_glaze", name: "Stain and Glaze", dept: "Finishing", receipt: "both", resource: "Glaze Furnace", perShift: 0, count: 2, shifts: 1, eff: null, capRelevant: true },
  { id: "layer", name: "Layer", dept: "Finishing", receipt: "both", resource: "Ceramist", perShift: 0, count: 3, shifts: 1, eff: null, capRelevant: true },
  { id: "final_qc", name: "Final QC", dept: "Finishing", receipt: "both", resource: "Labor", perShift: 0, count: 1, shifts: 1, eff: null, capRelevant: false },
  { id: "invoice", name: "Invoice", dept: "Shipping", receipt: "both", resource: "Labor", perShift: 0, count: 1, shifts: 1, eff: null, capRelevant: false },
  { id: "ship", name: "Ship", dept: "Shipping", receipt: "both", resource: "Labor", perShift: 0, count: 1, shifts: 1, eff: null, capRelevant: false },
];

const CB_SKUS = [
  { id: "msz", name: "Mill & Sinter Zirconia Crown", cat: "Crown", finish: "Mill and Sinter", core: ["case_entry", "import_files", "disinfect", "pour_model", "die_trim", "case_review", "scan_model", "design", "nest_crown", "mill_crown", "despru", "sinter", "final_qc", "invoice", "ship"] },
  { id: "polz", name: "Polished Crown", cat: "Crown", finish: "Polished", core: ["case_entry", "import_files", "disinfect", "pour_model", "die_trim", "case_review", "scan_model", "design", "nest_crown", "mill_crown", "despru", "sinter", "polish", "final_qc", "invoice", "ship"] },
  { id: "fcz", name: "Full Contour Zirconia", cat: "Crown", finish: "Stain & Glaze", core: ["case_entry", "import_files", "disinfect", "pour_model", "die_trim", "case_review", "scan_model", "design", "nest_crown", "mill_crown", "despru", "sinter", "stain_glaze", "final_qc", "invoice", "ship"] },
  { id: "pfz", name: "PFZ", cat: "Crown", finish: "Layered", core: ["case_entry", "import_files", "disinfect", "pour_model", "die_trim", "case_review", "scan_model", "design", "nest_crown", "mill_crown", "despru", "sinter", "layer", "final_qc", "invoice", "ship"] },
  { id: "emax_ven_sg", name: "eMax Veneer Stain & Glaze", cat: "Veneer", finish: "Stain & Glaze", core: ["case_entry", "import_files", "disinfect", "pour_model", "die_trim", "case_review", "scan_model", "design", "nest_crown", "mill_crown", "despru", "seal_margins", "press", "stain_glaze", "final_qc", "invoice", "ship"] },
  { id: "emax_ven_lay", name: "eMax Veneer Layered", cat: "Veneer", finish: "Layered", core: ["case_entry", "import_files", "disinfect", "pour_model", "die_trim", "case_review", "scan_model", "design", "nest_crown", "mill_crown", "despru", "seal_margins", "press", "layer", "final_qc", "invoice", "ship"] },
  { id: "feld_ven", name: "Feldspathic Veneer", cat: "Veneer", finish: "Layered", core: ["case_entry", "import_files", "disinfect", "pour_model", "die_trim", "case_review", "scan_model", "design", "final_qc", "invoice", "ship"] },
  { id: "emax_crown", name: "eMax Crown", cat: "Crown", finish: "Stain & Glaze", core: ["case_entry", "import_files", "disinfect", "pour_model", "die_trim", "case_review", "scan_model", "design", "nest_crown", "mill_crown", "despru", "seal_margins", "press", "stain_glaze", "final_qc", "invoice", "ship"] },
  { id: "emax_crown_lay", name: "eMax Layered Crown", cat: "Crown", finish: "Layered", core: ["case_entry", "import_files", "disinfect", "pour_model", "die_trim", "case_review", "scan_model", "design", "nest_crown", "mill_crown", "despru", "seal_margins", "press", "layer", "final_qc", "invoice", "ship"] },
  { id: "cast_gold", name: "Full Cast / Gold Crown", cat: "Crown", finish: "Finish Metal", core: ["case_entry", "import_files", "disinfect", "pour_model", "die_trim", "case_review", "scan_model", "design", "nest_crown", "mill_crown", "despru", "seal_margins", "cast", "finish_metal", "final_qc", "invoice", "ship"] },
  { id: "pfm", name: "PFM", cat: "Crown", finish: "Layered", core: ["case_entry", "import_files", "disinfect", "pour_model", "die_trim", "case_review", "scan_model", "design", "nest_crown", "mill_crown", "despru", "seal_margins", "cast", "opaque", "layer", "final_qc", "invoice", "ship"] },
  { id: "zir_inlay", name: "Zirconia Inlay / Onlay", cat: "Inlay/Onlay", finish: "Stain & Glaze", core: ["case_entry", "import_files", "disinfect", "pour_model", "die_trim", "case_review", "scan_model", "design", "nest_crown", "mill_crown", "despru", "sinter", "stain_glaze", "final_qc", "invoice", "ship"] },
  { id: "emax_inlay", name: "eMax Inlay / Onlay", cat: "Inlay/Onlay", finish: "Stain & Glaze", core: ["case_entry", "import_files", "disinfect", "pour_model", "die_trim", "case_review", "scan_model", "design", "nest_crown", "mill_crown", "despru", "seal_margins", "press", "stain_glaze", "final_qc", "invoice", "ship"] },
];
const CATS = ["Crown", "Veneer", "Inlay/Onlay"];
const stepById = Object.fromEntries(CB_STEPS.map(s => [s.id, s]));

function expandRoute(core, isAnalog, steps) {
  const want = isAnalog ? "analog" : "digital";
  const tagOf = (id) => (steps ? steps.find(s => s.id === id) : stepById[id])?.receipt || "both";
  return core.filter(id => { const r = tagOf(id); return r === "both" || r === want; });
}

const uid = () => Math.random().toString(36).slice(2, 9);
const HANDOFF_DEFAULT = "nest_crown";

const defaultFinishMix = (cat) => { const skus = CB_SKUS.filter(s => s.cat === cat); const even = Math.floor(100 / skus.length); const mix = {}; skus.forEach((s, i) => mix[s.id] = i === 0 ? 100 - even * (skus.length - 1) : even); return mix; };

const defaultRules = () => {
  const r = {};
  CATS.forEach(cat => ["analog", "digital"].forEach(rcpt => { r[`${cat}|${rcpt}`] = { treat: rcpt === "digital" ? "move" : "split", handoff: HANDOFF_DEFAULT }; }));
  return { byCatReceipt: r, skuOverride: { pfm: { treat: "keep" } } };
};

const newAcquired = (name) => ({
  id: uid(), name, volume: 1500, analogPct: 40,
  catMix: { Crown: 70, Veneer: 15, "Inlay/Onlay": 15 },
  finishMix: { Crown: defaultFinishMix("Crown"), Veneer: defaultFinishMix("Veneer"), "Inlay/Onlay": defaultFinishMix("Inlay/Onlay") },
  rules: defaultRules(),
});

const seed = {
  steps: CB_STEPS, globalEff: 85, daysPerMonth: 21, unitsPerCase: 1.4,
  centralName: "Central (HQ)", acquired: [newAcquired("Site 1"), newAcquired("Site 2")],
};

export default function CapacityPlannerPage() {
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState(seed);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeAcq, setActiveAcq] = useState(0);

  useEffect(() => { (async () => { const s = await loadState(); if (s) setData(s); setLoaded(true); })(); }, []);
  useEffect(() => { if (loaded) saveState(data); }, [data, loaded]);
  useEffect(() => { setSaved(true); const t = setTimeout(() => setSaved(false), 900); return () => clearTimeout(t); }, [data]);

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Admin</div>
      <div className="mt-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Capacity Planner</h1>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: saved ? "#16794e" : "#94a3b8" }}>
          <Save className="h-3.5 w-3.5" /> {saved ? "Saved" : "Auto-saves"}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">Model rerouting Crown &amp; Bridge volume from acquired sites into Central, and see what Central needs to absorb it.</p>

      <div className="mt-5 flex gap-1 border-b border-slate-200">
        {[["dashboard", "Consolidation", BarChart3], ["central", "Central Capacity", Layers], ["routing", "Routing Rules", GitBranch], ["acquired", "Acquired Demand", Package]].map(([id, label, Icn]) => (
          <button key={id} onClick={() => setTab(id)} className="relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-colors"
            style={{ color: tab === id ? "#0f172a" : "#94a3b8" }}>
            <Icn className="h-4 w-4" />{label}
            {tab === id && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-slate-900" />}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "dashboard" && <Dashboard data={data} />}
        {tab === "central" && <CentralCapacity data={data} setData={setData} />}
        {tab === "routing" && <Routing data={data} setData={setData} activeAcq={activeAcq} setActiveAcq={setActiveAcq} />}
        {tab === "acquired" && <Acquired data={data} setData={setData} activeAcq={activeAcq} setActiveAcq={setActiveAcq} />}
      </div>
    </div>
  );
}

function siteRows(site, daysPerMonth, unitsPerCase) {
  const rows = []; const aShare = (site.analogPct || 0) / 100;
  const conv = (unitsPerCase || 1.4) / (daysPerMonth || 21);
  CATS.forEach(cat => {
    const catCases = site.volume * ((site.catMix[cat] || 0) / 100);
    const fmix = site.finishMix[cat] || {};
    CB_SKUS.filter(s => s.cat === cat).forEach(s => {
      const cases = catCases * ((fmix[s.id] || 0) / 100); if (cases <= 0) return;
      const dailyUnits = cases * conv;
      if (aShare > 0) rows.push({ sku: s, units: dailyUnits * aShare, isAnalog: true });
      if (aShare < 1) rows.push({ sku: s, units: dailyUnits * (1 - aShare), isAnalog: false });
    });
  });
  return rows;
}

function ruleFor(site, sku, isAnalog) {
  const o = site.rules.skuOverride[sku.id];
  if (o) return o.treat === "split" ? { treat: "split", handoff: o.handoff || HANDOFF_DEFAULT } : o;
  return site.rules.byCatReceipt[`${sku.cat}|${isAnalog ? "analog" : "digital"}`] || { treat: "keep" };
}

function splitRoute(route, handoff) {
  const idx = route.indexOf(handoff);
  if (idx < 0) return { local: route, central: [] };
  return { local: route.slice(0, idx), central: route.slice(idx) };
}

function computeCentralLoad(data) {
  const central = {};
  const add = (stepId, units, cat, siteName) => {
    const st = data.steps.find(s => s.id === stepId); if (!st) return;
    if (!central[stepId]) central[stepId] = { id: stepId, units: 0, byCat: {}, bySite: {} };
    central[stepId].units += units;
    central[stepId].byCat[cat] = (central[stepId].byCat[cat] || 0) + units;
    central[stepId].bySite[siteName] = (central[stepId].bySite[siteName] || 0) + units;
  };
  const shipped = {};
  data.acquired.forEach(site => {
    siteRows(site, data.daysPerMonth, data.unitsPerCase).forEach(({ sku, units, isAnalog }) => {
      const route = expandRoute(sku.core, isAnalog, data.steps);
      const rule = ruleFor(site, sku, isAnalog);
      if (rule.treat === "move") route.forEach(s => add(s, units, sku.cat, site.name));
      else if (rule.treat === "split") { const { central: C } = splitRoute(route, rule.handoff); C.forEach(s => add(s, units, sku.cat, site.name)); }
    });
    let whole = 0, split = 0, kept = 0; const aShare = (site.analogPct || 0) / 100;
    CATS.forEach(cat => {
      const catCases = site.volume * ((site.catMix[cat] || 0) / 100);
      CB_SKUS.filter(s => s.cat === cat).forEach(s => {
        const cases = catCases * ((site.finishMix[cat]?.[s.id] || 0) / 100); if (cases <= 0) return;
        [["analog", aShare], ["digital", 1 - aShare]].forEach(([rcpt, share]) => {
          if (share <= 0) return; const c = cases * share;
          const rule = ruleFor(site, s, rcpt === "analog");
          if (rule.treat === "keep") kept += c; else if (rule.treat === "move") whole += c; else split += c;
        });
      });
    });
    shipped[site.id] = { whole, split, kept };
  });
  return { central, shipped };
}

function stepCapacity(step, data) {
  const eff = (step.eff != null ? step.eff : data.globalEff) / 100;
  return step.perShift * step.count * step.shifts * eff;
}

function rankCentral(data) {
  const { central, shipped } = computeCentralLoad(data);
  const steps = data.steps.map(st => {
    const load = central[st.id]?.units || 0;
    const cap = stepCapacity(st, data);
    const util = cap ? load / cap : (load > 0 ? Infinity : 0);
    return { ...st, load, cap, util, byCat: central[st.id]?.byCat || {} };
  }).filter(s => s.load > 0 || s.capRelevant);
  steps.sort((a, b) => b.util - a.util);
  return { steps, shipped };
}

const util = (u) => u === Infinity ? "∞" : (u * 100).toFixed(0) + "%";
const uc = (u) => u > 1 ? "#c0392b" : u > 0.85 ? "#b8860b" : "#16794e";

function fixOptions(step, data) {
  if (step.util <= 1) return [];
  const eff = (step.eff != null ? step.eff : data.globalEff) / 100;
  const perResShift = step.perShift * eff;
  const opts = [];
  const noun = step.resource === "Labor" ? "person" : step.resource;
  const pl = (n) => n === 1 ? "" : "s";
  const needAtShift = Math.ceil(step.load / (perResShift * step.shifts)) - step.count;
  if (needAtShift > 0) opts.push(`+${needAtShift} ${noun}${pl(needAtShift)} (keep ${step.shifts} shift${pl(step.shifts)})`);
  const needAt2 = Math.max(0, Math.ceil(step.load / (perResShift * (step.shifts + 1))) - step.count);
  opts.push(`go to ${step.shifts + 1} shifts${needAt2 > 0 ? ` and +${needAt2} ${noun}${pl(needAt2)}` : ""}`);
  return opts;
}

const card = "rounded-xl border border-slate-200 bg-white p-4 mb-3";

function Dashboard({ data }) {
  const hasTimes = data.steps.some(s => s.perShift > 0);
  const [showAll, setShowAll] = useState(false);
  const { steps, shipped } = rankCentral(data);
  const shown = steps.filter(s => showAll || s.capRelevant);
  const drum = shown[0];
  const overloaded = shown.filter(s => s.util > 1);
  const totalToCentral = Object.values(shipped).reduce((a, s) => a + s.whole + s.split, 0);

  return (
    <div>
      {!hasTimes && <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 mb-3 text-sm text-amber-800"><strong>Enter step rates first.</strong> Go to <em>Central Capacity</em> and fill units/shift, count, and shifts for the cap-relevant steps.</div>}

      <div className={card + " flex gap-8 flex-wrap"}>
        <Stat label="Acquired sites" val={data.acquired.length} />
        <Stat label="Cases/mo to Central" val={Math.round(totalToCentral).toLocaleString()} />
        <Stat label="Steps over capacity" val={overloaded.length} color={overloaded.length ? "#c0392b" : "#16794e"} />
        <Stat label="Drum" val={drum ? drum.name : "—"} color={drum ? uc(drum.util) : "#475569"} />
      </div>

      <div className="rounded-xl border-2 p-4 mb-3" style={{ borderColor: "#b3502d" }}>
        <div className="flex items-center justify-between mb-2">
          <strong className="text-[15px] text-slate-800">★ {data.centralName} — absorbing moved volume</strong>
          <label className="flex items-center gap-1.5 text-xs text-slate-500"><input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} /> show non-constraining</label>
        </div>
        {drum && drum.util > 0 && (
          <div className="rounded-lg px-3 py-2 mb-2.5 flex items-center gap-2 text-sm" style={{ background: drum.util > 1 ? "#fdecea" : "#fef9e7", border: "1px solid " + uc(drum.util) }}>
            <Flame className="h-4 w-4" style={{ color: uc(drum.util) }} /><span><strong>Drum: {drum.name}</strong> — {drum.resource} @ {util(drum.util)}. {drum.util > 1 ? "Over capacity — caps Central's output." : "Most-loaded step."}</span>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
              <th className="py-2 pr-2">#</th><th className="py-2 pr-2">Step</th><th className="py-2 pr-2">Resource (count × shifts)</th><th className="py-2 pr-2">Daily load / cap</th><th className="py-2 pr-2">Util</th><th className="py-2">Options to clear</th>
            </tr></thead>
            <tbody>
              {shown.map((s, i) => {
                const opts = fixOptions(s, data);
                return (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="py-2 pr-2">{i === 0 ? <Flame className="h-4 w-4" style={{ color: uc(s.util) }} /> : i === 1 ? <Zap className="h-4 w-4" style={{ color: "#b8860b" }} /> : i + 1}</td>
                    <td className="py-2 pr-2 text-slate-700">{s.name} {!s.capRelevant && <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">non-CCR</span>}</td>
                    <td className="py-2 pr-2 text-xs text-slate-500">{s.resource} ({s.count} × {s.shifts}sh)</td>
                    <td className="py-2 pr-2 text-slate-600">{Math.round(s.load).toLocaleString()} / {Math.round(s.cap).toLocaleString()}</td>
                    <td className="py-2 pr-2"><div className="flex items-center gap-1.5"><div className="h-2 w-16 rounded bg-slate-100 overflow-hidden"><div style={{ width: Math.min(100, (s.util || 0) * 100) + "%", height: "100%", background: uc(s.util) }} /></div><span className="text-xs font-semibold" style={{ color: uc(s.util) }}>{util(s.util)}</span></div></td>
                    <td className="py-2 text-xs">{opts.length ? <span className="flex flex-col gap-0.5">{opts.map((o, k) => <span key={k} className="flex items-center gap-1" style={{ color: "#15803d" }}><Wrench className="h-3 w-3" />{o}</span>)}</span> : <span className="text-slate-400">ok</span>}</td>
                  </tr>
                );
              })}
              {shown.length === 0 && <tr><td colSpan={6} className="py-2 text-slate-400">No volume routed to Central yet — set routing rules.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className={card}>
        <strong className="text-sm text-slate-800">What each acquired site sends to Central <span className="font-normal text-xs text-slate-400">(cases / month)</span></strong>
        <table className="w-full text-sm mt-2">
          <thead><tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200"><th className="py-2">Site</th><th className="py-2">Moved whole</th><th className="py-2">Split (back-half)</th><th className="py-2">Kept local</th></tr></thead>
          <tbody>
            {data.acquired.map(site => { const s = shipped[site.id] || {}; return (
              <tr key={site.id} className="border-b border-slate-100">
                <td className="py-2 font-medium text-slate-700">{site.name}</td>
                <td className="py-2 text-slate-600">{Math.round(s.whole || 0).toLocaleString()}</td>
                <td className="py-2 text-slate-600">{Math.round(s.split || 0).toLocaleString()}</td>
                <td className="py-2 text-slate-500">{Math.round(s.kept || 0).toLocaleString()}</td>
              </tr>
            ); })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, val, color }) {
  return <div><div className="text-[11px] uppercase text-slate-400">{label}</div><div className="text-lg font-bold" style={{ color: color || "#1e293b" }}>{val}</div></div>;
}

const inputCls = "rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-slate-500";

function CentralCapacity({ data, setData }) {
  const upd = (id, k, v) => setData(d => ({ ...d, steps: d.steps.map(s => s.id === id ? { ...s, [k]: v } : s) }));
  const setTop = (k, v) => setData(d => ({ ...d, [k]: v }));
  return (
    <div>
      <div className={card + " flex items-end gap-4 flex-wrap"}>
        <Field label="Central name"><input className={inputCls + " w-44"} value={data.centralName} onChange={e => setTop("centralName", e.target.value)} /></Field>
        <Field label="Days / month"><input type="number" className={inputCls + " w-20"} value={data.daysPerMonth} onChange={e => setTop("daysPerMonth", +e.target.value)} /></Field>
        <Field label="Units / case"><input type="number" step="0.1" className={inputCls + " w-20"} value={data.unitsPerCase} onChange={e => setTop("unitsPerCase", +e.target.value)} /></Field>
        <Field label={`Global efficiency — ${data.globalEff}%`}><input type="range" min="40" max="100" value={data.globalEff} onChange={e => setTop("globalEff", +e.target.value)} className="w-44" /></Field>
      </div>
      <div className={card}>
        <p className="text-sm text-slate-500 mb-2.5 max-w-3xl">Central capacity per step, shown <strong>daily</strong>. Enter units/shift (per 1 resource), count at Central, and shifts/day. Daily capacity = units/shift × count × shifts × efficiency. Demand converts using {data.unitsPerCase} units/case and {data.daysPerMonth} days/month.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
              <th className="py-2 pr-2">Step</th><th className="py-2 pr-2">Dept</th><th className="py-2 pr-2">Receipt</th><th className="py-2 pr-2">Units/shift</th><th className="py-2 pr-2">Resource</th><th className="py-2 pr-2">Count</th><th className="py-2 pr-2">Shifts</th><th className="py-2 pr-2">Eff %</th><th className="py-2 pr-2">CCR</th><th className="py-2">Daily cap</th>
            </tr></thead>
            <tbody>{data.steps.map(s => (
              <tr key={s.id} className="border-b border-slate-100" style={{ background: s.capRelevant ? "#fffdfa" : "#fff" }}>
                <td className="py-1.5 pr-2 font-medium text-slate-700">{s.name}</td>
                <td className="py-1.5 pr-2 text-xs" style={{ color: DEPTS[s.dept] }}>{s.dept}</td>
                <td className="py-1.5 pr-2"><select className={inputCls} value={s.receipt} onChange={e => upd(s.id, "receipt", e.target.value)}><option value="both">Both</option><option value="analog">Analog only</option><option value="digital">Digital only</option></select></td>
                <td className="py-1.5 pr-2"><input type="number" className={inputCls + " w-20"} value={s.perShift} onChange={e => upd(s.id, "perShift", +e.target.value)} /></td>
                <td className="py-1.5 pr-2"><input className={inputCls + " w-28"} value={s.resource} onChange={e => upd(s.id, "resource", e.target.value)} /></td>
                <td className="py-1.5 pr-2"><input type="number" className={inputCls + " w-14"} value={s.count} onChange={e => upd(s.id, "count", +e.target.value)} /></td>
                <td className="py-1.5 pr-2"><input type="number" className={inputCls + " w-14"} value={s.shifts} onChange={e => upd(s.id, "shifts", +e.target.value)} /></td>
                <td className="py-1.5 pr-2"><input type="number" placeholder={data.globalEff} className={inputCls + " w-16"} value={s.eff ?? ""} onChange={e => upd(s.id, "eff", e.target.value === "" ? null : +e.target.value)} /></td>
                <td className="py-1.5 pr-2 text-center"><input type="checkbox" checked={s.capRelevant} onChange={e => upd(s.id, "capRelevant", e.target.checked)} /></td>
                <td className="py-1.5 font-medium text-slate-600">{Math.round(stepCapacity(s, data)).toLocaleString()}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <label className="flex flex-col gap-1"><span className="text-[11px] uppercase text-slate-400">{label}</span>{children}</label>;
}

function Routing({ data, setData, activeAcq, setActiveAcq }) {
  const site = data.acquired[activeAcq]; if (!site) return null;
  const setRule = (key, patch) => setData(d => ({ ...d, acquired: d.acquired.map((s, i) => i === activeAcq ? { ...s, rules: { ...s.rules, byCatReceipt: { ...s.rules.byCatReceipt, [key]: { ...s.rules.byCatReceipt[key], ...patch } } } } : s) }));
  const setOverride = (skuId, patch) => setData(d => ({ ...d, acquired: d.acquired.map((s, i) => {
    if (i !== activeAcq) return s; const ov = { ...s.rules.skuOverride };
    if (patch === null) delete ov[skuId]; else ov[skuId] = { ...ov[skuId], ...patch };
    return { ...s, rules: { ...s.rules, skuOverride: ov } };
  }) }));
  const chip = (on) => "rounded-lg px-2.5 py-1 text-xs font-medium transition-all " + (on ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700");
  const TreatBtns = ({ val, onPick }) => (
    <span className="flex gap-1">
      {[["keep", "Keep local"], ["split", "Split → Central"], ["move", "Move whole"]].map(([v, l]) => (
        <button key={v} className={chip(val === v)} onClick={() => onPick(v)}>{l}</button>
      ))}
    </span>
  );
  return (
    <div>
      <div className={card + " flex gap-2 items-center flex-wrap"}>
        <span className="text-[11px] font-semibold uppercase text-slate-400">Site:</span>
        {data.acquired.map((s, i) => <button key={s.id} className={chip(i === activeAcq)} onClick={() => setActiveAcq(i)}>{s.name}</button>)}
      </div>
      <div className={card}>
        <p className="text-sm text-slate-500 mb-2.5 max-w-3xl">How each slice of <strong>{site.name}</strong>'s volume is handled. Defaults: digital → move whole, analog → split at manufacturing handoff, PFM → keep. <strong>Split</strong> keeps steps before the handoff local; the handoff onward goes to Central.</p>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200"><th className="py-2">Category</th><th className="py-2">Receipt</th><th className="py-2">Treatment</th><th className="py-2">Split handoff</th></tr></thead>
          <tbody>
            {CATS.flatMap(cat => ["analog", "digital"].map(rcpt => {
              const key = `${cat}|${rcpt}`; const rule = site.rules.byCatReceipt[key];
              return (
                <tr key={key} className="border-b border-slate-100">
                  <td className="py-2 font-medium text-slate-700">{cat}</td>
                  <td className="py-2"><span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: rcpt === "analog" ? "#fef3c7" : "#dbeafe", color: rcpt === "analog" ? "#b45309" : "#1d4ed8" }}>{rcpt === "analog" ? "Physical Mail" : "Digital"}</span></td>
                  <td className="py-2"><TreatBtns val={rule.treat} onPick={v => setRule(key, { treat: v })} /></td>
                  <td className="py-2">{rule.treat === "split" ? (
                    <select className={inputCls} value={rule.handoff} onChange={e => setRule(key, { handoff: e.target.value })}>
                      {expandRoute(CB_SKUS.find(s => s.cat === cat).core, rcpt === "analog", data.steps).map(sid => <option key={sid} value={sid}>{data.steps.find(x => x.id === sid)?.name}</option>)}
                    </select>
                  ) : <span className="text-slate-300">—</span>}</td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>
      <div className={card}>
        <strong className="text-sm text-slate-800">SKU overrides</strong>
        <p className="text-xs text-slate-500 mt-1 mb-2.5">Override a specific SKU regardless of category rule (e.g. PFM kept here). Overrides win.</p>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200"><th className="py-2">SKU</th><th className="py-2">Override</th><th className="py-2">Handoff</th></tr></thead>
          <tbody>
            {CB_SKUS.map(s => {
              const ov = site.rules.skuOverride[s.id];
              return (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="py-2 text-slate-700">{s.name} <span className="text-[11px] text-slate-400">· {s.cat}</span></td>
                  <td className="py-2"><span className="flex gap-1.5 items-center">
                    {ov ? <TreatBtns val={ov.treat} onPick={v => setOverride(s.id, { treat: v })} /> : <span className="text-xs text-slate-400">follows category rule</span>}
                    {ov ? <button className="text-xs text-rose-600" onClick={() => setOverride(s.id, null)}>clear</button> : <button className="text-xs text-slate-500 underline" onClick={() => setOverride(s.id, { treat: "keep" })}>+ override</button>}
                  </span></td>
                  <td className="py-2">{ov?.treat === "split" ? <select className={inputCls} value={ov.handoff || HANDOFF_DEFAULT} onChange={e => setOverride(s.id, { handoff: e.target.value })}>{expandRoute(s.core, true, data.steps).map(sid => <option key={sid} value={sid}>{data.steps.find(x => x.id === sid)?.name}</option>)}</select> : <span className="text-slate-300">—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Acquired({ data, setData, activeAcq, setActiveAcq }) {
  const addSite = () => { setData(d => ({ ...d, acquired: [...d.acquired, newAcquired("Site " + (d.acquired.length + 1))] })); setActiveAcq(data.acquired.length); };
  const site = data.acquired[activeAcq]; if (!site) return null;
  const upd = (k, v) => setData(d => ({ ...d, acquired: d.acquired.map((s, i) => i === activeAcq ? { ...s, [k]: v } : s) }));
  const updCat = (cat, v) => setData(d => ({ ...d, acquired: d.acquired.map((s, i) => i === activeAcq ? { ...s, catMix: { ...s.catMix, [cat]: v } } : s) }));
  const updFinish = (cat, skuId, v) => setData(d => ({ ...d, acquired: d.acquired.map((s, i) => i === activeAcq ? { ...s, finishMix: { ...s.finishMix, [cat]: { ...s.finishMix[cat], [skuId]: v } } } : s) }));
  const del = () => { if (data.acquired.length <= 1) return; setData(d => ({ ...d, acquired: d.acquired.filter((_, i) => i !== activeAcq) })); setActiveAcq(0); };
  const catTotal = CATS.reduce((t, c) => t + (+site.catMix[c] || 0), 0);
  const finishTotal = (cat) => CB_SKUS.filter(s => s.cat === cat).reduce((t, s) => t + (+site.finishMix[cat]?.[s.id] || 0), 0);
  const chip = (on) => "rounded-lg px-2.5 py-1 text-xs font-medium " + (on ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700");
  const badge = (tot) => <span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: tot === 100 ? "#dcfce7" : "#fee2e2", color: tot === 100 ? "#15803d" : "#b91c1c" }}>{tot}%</span>;
  return (
    <div>
      <div className={card + " flex gap-2 items-center flex-wrap"}>
        <span className="text-[11px] font-semibold uppercase text-slate-400">Site:</span>
        {data.acquired.map((s, i) => <button key={s.id} className={chip(i === activeAcq)} onClick={() => setActiveAcq(i)}>{s.name}</button>)}
        <button className="ml-auto flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50" onClick={addSite}><Plus className="h-3.5 w-3.5" />Add site</button>
      </div>
      <div className={card}>
        <p className="text-xs text-slate-500 mb-2.5">Acquired sites are demand sources — no capacity inputs. Enter volume and mix; routing rules decide what flows to Central.</p>
        <div className="flex gap-4 flex-wrap items-end">
          <Field label="Site name"><input className={inputCls + " w-44"} value={site.name} onChange={e => upd("name", e.target.value)} /></Field>
          <Field label="Total cases / month"><input type="number" className={inputCls + " w-28"} value={site.volume} onChange={e => upd("volume", +e.target.value)} /></Field>
          <Field label={`Analog %: ${site.analogPct} · Digital %: ${100 - site.analogPct}`}><input type="range" min="0" max="100" value={site.analogPct} onChange={e => upd("analogPct", +e.target.value)} className="w-44" /></Field>
          {data.acquired.length > 1 && <button className="ml-auto flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50" onClick={del}><Trash2 className="h-3.5 w-3.5" />Delete</button>}
        </div>
      </div>
      <div className={card}>
        <div className="flex justify-between mb-2"><h3 className="text-[13px] font-bold text-slate-800">Category mix {badge(catTotal)}</h3></div>
        {CATS.map(c => (
          <div key={c} className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-sm text-slate-700">{c}</span><span className="flex items-center gap-1.5"><input type="number" className={inputCls + " w-16 text-right"} value={site.catMix[c] || 0} onChange={e => updCat(c, +e.target.value)} />%</span>
          </div>
        ))}
      </div>
      {CATS.map(cat => (
        <div className={card} key={cat}>
          <div className="flex justify-between mb-2"><h3 className="text-[13px] font-bold text-slate-800">{cat} — SKU mix {badge(finishTotal(cat))}</h3></div>
          {CB_SKUS.filter(s => s.cat === cat).map(s => (
            <div key={s.id} className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-sm text-slate-700">{s.name} <span className="text-[11px] text-slate-400">· {s.finish}</span></span>
              <span className="flex items-center gap-1.5"><input type="number" className={inputCls + " w-16 text-right"} value={site.finishMix[cat]?.[s.id] || 0} onChange={e => updFinish(cat, s.id, +e.target.value)} />%</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
