import { useState, useMemo, useRef, useLayoutEffect } from "react";
import { X, Info, GitBranch, RotateCcw, Check, ChevronDown, Truck, Repeat, Calendar, ArrowRight, Layers } from "lucide-react";

/* ============================================================
   SHARED: department styling
   ============================================================ */
const DEPTS = {
  "Data Capture":        { label:"Data Capture",        color:"#b45309", bg:"#fef3c7", border:"#fcd34d" },
  "Model":               { label:"Model",               color:"#0d9488", bg:"#ccfbf1", border:"#5eead4" },
  "Design":              { label:"Design",              color:"#15803d", bg:"#dcfce7", border:"#86efac" },
  "Machining":           { label:"Machining",           color:"#be123c", bg:"#ffe4e6", border:"#fda4af" },
  "Wax / Metal":         { label:"Wax / Metal",         color:"#1d4ed8", bg:"#dbeafe", border:"#93c5fd" },
  "Finishing":           { label:"Finishing",           color:"#7c3aed", bg:"#ede9fe", border:"#c4b5fd" },
  "Denture Set Up":      { label:"Denture Set Up",      color:"#1d4ed8", bg:"#dbeafe", border:"#93c5fd" },
  "Denture Processing":  { label:"Denture Processing",  color:"#c2410c", bg:"#ffedd5", border:"#fdba74" },
  "Framework Processing":{ label:"Framework Processing",color:"#9333ea", bg:"#f3e8ff", border:"#d8b4fe" },
  "Denture Assembly":    { label:"Denture Assembly",    color:"#0891b2", bg:"#cffafe", border:"#67e8f9" },
  "Denture Finishing":   { label:"Denture Finishing",   color:"#db2777", bg:"#fce7f3", border:"#f9a8d4" },
  "Shipping":            { label:"Shipping",            color:"#4f46e5", bg:"#e0e7ff", border:"#a5b4fc" },
};

/* ============================================================
   DENTURES DATA
   ============================================================ */
const D_STEP = {
  "Case Entry":{dept:"Data Capture",desc:"The order is entered into the lab system: patient, dentist, arch, shade and mould. The case begins here."},
  "Import Impressions":{dept:"Data Capture",desc:"Digital impression / scan files are imported and validated."},
  "Pour Models":{dept:"Model",desc:"Stone models are poured from the physical impressions."},
  "Pour Impression":{dept:"Model",desc:"The impression is poured up to create a working model."},
  "Trim Models":{dept:"Model",desc:"The poured models are trimmed and based."},
  "Articulate Models":{dept:"Model",desc:"The upper and lower models are mounted on an articulator to capture the bite relationship."},
  "Block Out Undercuts":{dept:"Model",desc:"Undercuts on the model are blocked out so the appliance seats and releases correctly."},
  "Duplicate Model":{dept:"Model",desc:"The model is duplicated for framework fabrication."},
  "Refractory Model":{dept:"Model",desc:"A refractory (heat-resistant) model is produced to cast the metal framework on."},
  "Scan Models":{dept:"Design",desc:"The physical model is digitized for CAD design."},
  "Design Denture":{dept:"Design",desc:"The denture is designed in CAD — base, tooth arrangement and contours."},
  "Design Tray":{dept:"Design",desc:"The custom tray is designed in CAD to the arch."},
  "Nest Denture":{dept:"Machining",desc:"The denture is nested on the print build plate."},
  "Print Denture":{dept:"Machining",desc:"The denture is 3D-printed in denture resin."},
  "Nest Tray":{dept:"Machining",desc:"The custom tray is nested for printing."},
  "Print Tray":{dept:"Machining",desc:"The custom tray is 3D-printed."},
  "Fabricate Wax Rim":{dept:"Denture Set Up",desc:"A wax occlusion rim is built on the base for the dentist to record the bite."},
  "Tooth Set Up in Wax":{dept:"Denture Set Up",desc:"Carded denture teeth are set into the wax rim for the try-in / setup."},
  "Wax Design":{dept:"Denture Set Up",desc:"The Valplast/flexible denture is designed and waxed up."},
  "Attach Framework":{dept:"Denture Set Up",desc:"The finished framework is incorporated into the denture setup."},
  "Flasking":{dept:"Denture Processing",desc:"The waxed denture is enclosed in a flask with investment to create the processing mold."},
  "Boil Out":{dept:"Denture Processing",desc:"The flask is boiled to melt and wash out the wax before packing acrylic."},
  "Pack Acrylic":{dept:"Denture Processing",desc:"Heat-cure acrylic is packed into the flask mold."},
  "Heat Cure":{dept:"Denture Processing",desc:"The flasked acrylic is heat-cured to polymerize the denture base."},
  "DeFlask":{dept:"Denture Processing",desc:"The cured denture is recovered from the flask."},
  "Invest":{dept:"Denture Processing",desc:"The pattern is encased in investment material to form the mold."},
  "Burnout":{dept:"Denture Processing",desc:"The invested mold is heated to burn out the wax/pattern, leaving a cavity."},
  "Heat Nylon Cartridge":{dept:"Denture Processing",desc:"The nylon cartridge is heated to flow temperature ready for injection."},
  "Inject Nylon":{dept:"Denture Processing",desc:"Flexible nylon (Valplast) is injected into the mold under heat and pressure."},
  "Cool":{dept:"Denture Processing",desc:"The injected appliance is allowed to cool before removal."},
  "Wax Metal Framework":{dept:"Framework Processing",desc:"The metal framework pattern is waxed up on the refractory model."},
  "Spru Framework":{dept:"Framework Processing",desc:"Sprues are attached to the framework pattern to channel molten metal during casting."},
  "Cast Metal":{dept:"Framework Processing",desc:"The metal framework is cast from the invested pattern."},
  "Divest":{dept:"Framework Processing",desc:"The investment is broken away to recover the cast framework."},
  "Sandblast":{dept:"Framework Processing",desc:"The casting is sandblasted to clean off investment residue and oxide."},
  "Metal Finishing":{dept:"Framework Processing",desc:"The metal framework is ground, smoothed and polished."},
  "Framework Fit Check":{dept:"Framework Processing",desc:"The finished framework is checked for accurate fit on the model."},
  "Clean Denture":{dept:"Denture Assembly",desc:"The printed denture is washed of uncured resin."},
  "Match Denture":{dept:"Denture Assembly",desc:"The printed parts are matched back to their case."},
  "Teeth Fitting":{dept:"Denture Assembly",desc:"Denture teeth are fitted into the base sockets."},
  "Fuse 2":{dept:"Denture Assembly",desc:"Components are fused (bonding/processing stage for printed dentures)."},
  "Patient Name":{dept:"Denture Assembly",desc:"The patient's name is embedded/marked into the denture."},
  "Fuse 3 + Oven":{dept:"Denture Assembly",desc:"A further fuse step followed by oven processing."},
  "Remove Supports":{dept:"Denture Assembly",desc:"Print supports are removed from the printed denture."},
  "Trim":{dept:"Denture Finishing",desc:"Excess material is trimmed from the denture borders."},
  "Polish":{dept:"Denture Finishing",desc:"The denture is polished to a smooth, hygienic high shine."},
  "QC":{dept:"Denture Finishing",desc:"Quality check of the work against the prescription."},
  "Finish":{dept:"Denture Finishing",desc:"Final finishing of the denture surfaces and borders."},
  "Final QC":{dept:"Denture Finishing",desc:"Final inspection of fit, occlusion, extension and esthetics."},
  "Invoice":{dept:"Shipping",desc:"The finished case is billed to the practice."},
  "Ship":{dept:"Shipping",desc:"The case is packed and shipped back to the dental office."},
};

const D_PRODUCTS = [
  {name:"Acrylic Denture",group:"Full / Conventional",steps:["Case Entry","Pour Models","Trim Models","Articulate Models","Fabricate Wax Rim","Tooth Set Up in Wax","Flasking","Boil Out","Pack Acrylic","Heat Cure","DeFlask","Trim","Polish","QC","Invoice","Ship"]},
  {name:"Valplast Denture",group:"Flexible",steps:["Case Entry","Trim Models","Block Out Undercuts","Wax Design","Invest","Burnout","Heat Nylon Cartridge","Inject Nylon","Cool","DeFlask","Trim","Polish","QC","Invoice","Ship"]},
  {name:"Metal Framework Denture",group:"Partial / Metal",steps:["Case Entry","Pour Models","Duplicate Model","Refractory Model","Wax Metal Framework","Spru Framework","Invest","Burnout","Cast Metal","Divest","Sandblast","Metal Finishing","Framework Fit Check","Attach Framework","Fabricate Wax Rim","Tooth Set Up in Wax","Flasking","Pack Acrylic","Heat Cure","DeFlask","Finish","Polish","QC","Invoice","Ship"]},
  {name:"Printed Denture from Digital",group:"Printed",steps:["Case Entry","Import Impressions","Design Denture","Nest Denture","Print Denture","Clean Denture","Match Denture","Teeth Fitting","Fuse 2","Patient Name","Fuse 3 + Oven","Remove Supports","Polish","Final QC","Invoice","Ship"]},
  {name:"Printed Denture from Analog",group:"Printed",steps:["Case Entry","Pour Models","Scan Models","Design Denture","Nest Denture","Print Denture","Clean Denture","Match Denture","Teeth Fitting","Fuse 2","Patient Name","Fuse 3 + Oven","Remove Supports","Polish","Final QC","Invoice","Ship"]},
  {name:"Custom Tray",group:"Appliance / Stage",steps:["Case Entry","Pour Impression","Design Tray","Nest Tray","Print Tray","QC","Invoice","Ship"]},
  {name:"Bite Block / Wax Rim",group:"Appliance / Stage",steps:["Case Entry","Pour Models","Trim Models","Articulate Models","Fabricate Wax Rim","QC","Invoice","Ship"]},
  {name:"Set Up - Acrylic",group:"Appliance / Stage",steps:["Case Entry","Tooth Set Up in Wax","QC","Invoice","Ship"]},
  {name:"Finish - Acrylic",group:"Appliance / Stage",steps:["Case Entry","Flasking","Boil Out","Pack Acrylic","Heat Cure","DeFlask","Trim","Polish","QC","Invoice","Ship"]},
  {name:"Metal Framework Only",group:"Partial / Metal",steps:["Case Entry","Pour Models","Duplicate Model","Refractory Model","Wax Metal Framework","Spru Framework","Invest","Burnout","Cast Metal","Divest","Sandblast","Metal Finishing","Framework Fit Check","QC","Invoice","Ship"]},
];

const CONVENTIONAL = [
  {appt:"Appt 1 — Preliminary Impression",stageName:"Custom Tray",purpose:"Establish a more accurate impression with a patient-specific tray.",product:"Custom Tray"},
  {appt:"Appt 2 — Final Impression",stageName:"Bite Block",purpose:"Capture vertical dimension (VDO), midline and smile-line characteristics to guide tooth setup.",product:"Bite Block / Wax Rim"},
  {appt:"Appt 3 — Bite Registration",stageName:"Set Up",purpose:"Carded teeth set in wax, returned to the office to try into the patient's mouth for fit and esthetics.",product:"Set Up - Acrylic"},
  {appt:"Appt 4 — Wax Try-In",stageName:"Finishing",purpose:"Approved wax try-in returned to the lab for final processing into the finished denture.",product:"Finish - Acrylic"},
  {appt:"Appt 5 — Delivery",stageName:null,purpose:"Finished denture delivered and seated for the patient.",product:null},
];
const DIGITAL = [
  {appt:"Appt 1 — Digital Scan & Records",stageName:"Design & Print",purpose:"Intra-oral scan plus bite and esthetic records captured in one visit; denture designed and printed digitally.",product:"Printed Denture from Digital"},
  {appt:"Appt 2 — Delivery",stageName:null,purpose:"Finished printed denture delivered and seated.",product:null},
];

/* ============================================================
   CROWN & BRIDGE DATA
   ============================================================ */
const CB_STEP = {
  "Disinfect":{dept:"Data Capture",receipt:"analog",desc:"Incoming physical impressions are disinfected before anyone handles them. Physical-mail cases only."},
  "Case Entry":{dept:"Data Capture",receipt:"both",desc:"The order is entered into the lab system: patient, dentist, tooth number, material and shade."},
  "Import Files":{dept:"Data Capture",receipt:"digital",desc:"Digital scan files are imported and validated. Digital-scan cases only."},
  "Case Review / Case Planning":{dept:"Data Capture",receipt:"both",desc:"A technician checks the case is workable before any production begins."},
  "Pour Model / Articulate / Trim / Base":{dept:"Model",receipt:"analog",desc:"A stone model is poured, mounted, trimmed and based. Analog cases only."},
  "Die Trim":{dept:"Model",receipt:"analog",desc:"The tooth 'die' is trimmed so the margin is clearly readable. Analog cases only."},
  "Scan Model":{dept:"Design",receipt:"analog",desc:"The physical model is digitized for CAD design. Analog cases only."},
  "Design":{dept:"Design",receipt:"both",desc:"The restoration is designed in CAD to the prescribed shape, margins and contacts."},
  "Nest Model":{dept:"Machining",receipt:"both",desc:"The working model is nested on a print build plate."},
  "Print Model":{dept:"Machining",receipt:"both",desc:"The working model is 3D-printed."},
  "Nest Crown":{dept:"Machining",receipt:"both",desc:"The restoration is nested in the material disc/block ready to mill."},
  "Mill Crown":{dept:"Machining",receipt:"both",desc:"A milling machine carves the restoration from the solid block of material."},
  "De-Spru Crown":{dept:"Machining",receipt:"both",desc:"The support tabs left from milling are cut away."},
  "Sinter Crown":{dept:"Machining",receipt:"both",desc:"Zirconia is fired in a furnace to harden it to full strength and final size."},
  "Seal Margins":{dept:"Wax / Metal",receipt:"both",desc:"The wax pattern's edges are sealed in preparation for pressing or casting."},
  "Press":{dept:"Wax / Metal",receipt:"both",desc:"The wax is burned out and replaced with pressed ceramic."},
  "Cast":{dept:"Wax / Metal",receipt:"both",desc:"The wax is burned out and replaced with molten metal to form the coping."},
  "Finish Metal":{dept:"Wax / Metal",receipt:"both",desc:"The cast metal is cleaned up, adjusted and fitted to the model."},
  "Opaque":{dept:"Wax / Metal",receipt:"both",desc:"An opaque layer is applied over metal to mask it before porcelain."},
  "Polish Crown":{dept:"Finishing",receipt:"both",desc:"The restoration is polished to a smooth, glossy final surface."},
  "Stain and Glaze":{dept:"Finishing",receipt:"both",desc:"Surface stains and a glaze firing give the final natural color and shine."},
  "Layer":{dept:"Finishing",receipt:"both",desc:"Porcelain is built up in layers by hand for maximum esthetics."},
  "Final QC":{dept:"Finishing",receipt:"both",desc:"Final inspection of fit, contacts, occlusion and appearance."},
  "Invoice":{dept:"Shipping",receipt:"both",desc:"The finished case is billed to the practice."},
  "Ship":{dept:"Shipping",receipt:"both",desc:"The case is packed and shipped back to the dental office."},
};

const CB_SKUS = [
  {name:"Mill and Sinter Zirconia Crown",category:"Crown",material:"Zirconia",finish:"Mill and Sinter",core:["Case Entry","Case Review / Case Planning","Design","Nest Crown","Mill Crown","De-Spru Crown","Sinter Crown","Final QC","Invoice","Ship"]},
  {name:"Polished Crown",category:"Crown",material:"Zirconia",finish:"Polish",core:["Case Entry","Case Review / Case Planning","Design","Nest Crown","Mill Crown","De-Spru Crown","Sinter Crown","Polish Crown","Final QC","Invoice","Ship"]},
  {name:"Full Contour Zirconia",category:"Crown",material:"Zirconia",finish:"Stain and Glaze",core:["Case Entry","Case Review / Case Planning","Design","Nest Crown","Mill Crown","De-Spru Crown","Sinter Crown","Stain and Glaze","Final QC","Invoice","Ship"]},
  {name:"PFZ (Porcelain Fused to Zirconia)",category:"Crown",material:"Zirconia",finish:"Layer",core:["Case Entry","Case Review / Case Planning","Design","Nest Crown","Mill Crown","De-Spru Crown","Sinter Crown","Layer","Final QC","Invoice","Ship"]},
  {name:"eMax Veneer Stain and Glaze",category:"Veneer",material:"Lithium Disilicate",finish:"Stain and Glaze",core:["Case Entry","Case Review / Case Planning","Design","Nest Crown","Mill Crown","De-Spru Crown","Seal Margins","Press","Stain and Glaze","Final QC","Invoice","Ship"]},
  {name:"eMax Veneer Layered",category:"Veneer",material:"Lithium Disilicate",finish:"Layer",core:["Case Entry","Case Review / Case Planning","Design","Nest Crown","Mill Crown","De-Spru Crown","Seal Margins","Press","Layer","Final QC","Invoice","Ship"]},
  {name:"Feldspathic Veneer",category:"Veneer",material:"Feldspathic",finish:"Layer",core:["Case Entry","Case Review / Case Planning","Design","Final QC","Invoice","Ship"]},
  {name:"eMax Crown",category:"Crown",material:"Lithium Disilicate",finish:"Stain and Glaze",core:["Case Entry","Case Review / Case Planning","Design","Nest Crown","Mill Crown","De-Spru Crown","Seal Margins","Press","Stain and Glaze","Final QC","Invoice","Ship"]},
  {name:"eMax Layered Crown",category:"Crown",material:"Lithium Disilicate",finish:"Layer",core:["Case Entry","Case Review / Case Planning","Design","Nest Crown","Mill Crown","De-Spru Crown","Seal Margins","Press","Layer","Final QC","Invoice","Ship"]},
  {name:"Full Cast Crown, Gold Crown",category:"Crown",material:"Metal",finish:"Finish Metal",core:["Case Entry","Case Review / Case Planning","Design","Nest Crown","Mill Crown","De-Spru Crown","Seal Margins","Cast","Finish Metal","Final QC","Invoice","Ship"]},
  {name:"PFM (Porcelain Fused to Metal)",category:"Crown",material:"Metal",finish:"Layer",core:["Case Entry","Case Review / Case Planning","Design","Nest Crown","Mill Crown","De-Spru Crown","Seal Margins","Cast","Opaque","Layer","Final QC","Invoice","Ship"]},
  {name:"Zirconia Inlay, Zirconia Onlay",category:"Inlay/Onlay",material:"Zirconia",finish:"Stain and Glaze",core:["Case Entry","Case Review / Case Planning","Design","Nest Crown","Mill Crown","De-Spru Crown","Sinter Crown","Stain and Glaze","Final QC","Invoice","Ship"]},
  {name:"eMax Inlay, eMax Onlay",category:"Inlay/Onlay",material:"Lithium Disilicate",finish:"Stain and Glaze",core:["Case Entry","Case Review / Case Planning","Design","Nest Crown","Mill Crown","De-Spru Crown","Seal Margins","Press","Stain and Glaze","Final QC","Invoice","Ship"]},
];

const CB_L1 = ["Physical Mail","Digital Scan"];
const CB_L2 = ["Crown","Veneer","Inlay/Onlay"];
const CB_L3 = ["Zirconia","Lithium Disilicate","Metal","Feldspathic"];
const CB_L4 = ["Stain & Glaze","Layered","Polished","Mill and Sinter","Finish Metal"];
const CB_FINISH_MAP = {"Stain & Glaze":"Stain and Glaze","Layered":"Layer","Polished":"Polish","Mill and Sinter":"Mill and Sinter","Finish Metal":"Finish Metal"};

function cbBuildPath(sku, receipt) {
  if (!sku) return [];
  const out = [];
  for (const step of sku.core) {
    if (step === "Case Entry") {
      out.push(step);
      if (receipt === "Digital Scan") out.push("Import Files");
      if (receipt === "Physical Mail") out.push("Disinfect");
      continue;
    }
    if (step === "Case Review / Case Planning") {
      if (receipt === "Physical Mail") out.push("Pour Model / Articulate / Trim / Base","Die Trim");
      out.push(step); continue;
    }
    if (step === "Design") {
      if (receipt === "Physical Mail") out.push("Scan Model");
      out.push(step); continue;
    }
    out.push(step);
  }
  return out;
}

/* ============================================================
   SHARED UI COMPONENTS
   ============================================================ */
function FlowNode({ name, stepTable, onClick, nodeRef }) {
  const s = stepTable[name] || { dept:"Shipping", desc:"" };
  const d = DEPTS[s.dept];
  return (
    <button ref={nodeRef} onClick={onClick}
      className="relative w-60 rounded-xl border-2 bg-white px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderColor:d.border, boxShadow:"0 1px 3px rgba(0,0,0,0.07)" }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color:d.color }}>{d.label}</div>
          <div className="mt-0.5 text-sm font-semibold leading-snug text-slate-800">{name}</div>
        </div>
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />
      </div>
    </button>
  );
}

function Flowchart({ path, stepTable, onSelect }) {
  const containerRef = useRef(null);
  const refs = useRef({});
  const [edges, setEdges] = useState([]);
  const [dims, setDims] = useState({ w:0, h:0 });

  useLayoutEffect(() => { refs.current = {}; }, [path]);
  useLayoutEffect(() => {
    const calc = () => {
      const c = containerRef.current; if (!c) return;
      const cb = c.getBoundingClientRect();
      const e = [];
      for (let i=0;i<path.length-1;i++){
        const a = refs.current[i], b = refs.current[i+1];
        if (!a||!b) continue;
        const ab=a.getBoundingClientRect(), bb=b.getBoundingClientRect();
        e.push({ id:i, x1:ab.left+ab.width/2-cb.left, y1:ab.bottom-cb.top, x2:bb.left+bb.width/2-cb.left, y2:bb.top-cb.top });
      }
      setEdges(e); setDims({ w:c.scrollWidth, h:c.scrollHeight });
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", calc);
    const t = setTimeout(calc, 80);
    return () => { ro.disconnect(); window.removeEventListener("resize", calc); clearTimeout(t); };
  }, [path]);

  return (
    <div ref={containerRef} className="relative mt-5 rounded-xl border border-slate-200 bg-white px-4 py-6"
      style={{ backgroundImage:"radial-gradient(#eef2f7 1px, transparent 1px)", backgroundSize:"22px 22px" }}>
      <svg className="pointer-events-none absolute inset-0" width={dims.w} height={dims.h} style={{ overflow:"visible" }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>
        {edges.map(ed => {
          const midY=(ed.y1+ed.y2)/2;
          return <path key={ed.id} d={`M ${ed.x1} ${ed.y1} C ${ed.x1} ${midY}, ${ed.x2} ${midY}, ${ed.x2} ${ed.y2}`}
            fill="none" stroke="#94a3b8" strokeWidth={2} markerEnd="url(#arrow)" />;
        })}
      </svg>
      <div className="relative flex flex-col items-center gap-7">
        {path.map((name, i) => (
          <FlowNode key={i} name={name} stepTable={stepTable} onClick={() => onSelect(name)} nodeRef={(el)=>{ if(el) refs.current[i]=el; }} />
        ))}
      </div>
    </div>
  );
}

function Legend({ depts }) {
  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Departments</div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {depts.map(dk => (
          <div key={dk} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: DEPTS[dk].color }} />
            {DEPTS[dk].label}
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailPanel({ detail, stepTable, onClose }) {
  if (!detail) return null;
  const s = stepTable[detail] || { dept:"Shipping", desc:"Step detail not yet defined." };
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20" onClick={onClose}>
      <div className="h-full w-full max-w-sm overflow-y-auto bg-white shadow-2xl" onClick={e=>e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <span className="rounded-md px-2 py-1 text-[11px] font-bold" style={{ background: DEPTS[s.dept].bg, color: DEPTS[s.dept].color }}>
            {DEPTS[s.dept].label}
          </span>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-5">
          <h2 className="text-xl font-bold text-slate-800">{detail}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{s.desc}</p>
          {s.receipt && (
            <div className="mt-5">
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Receipt type</div>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {s.receipt==="both"?"Both (analog & digital)":s.receipt==="analog"?"Analog (physical mail) only":"Digital scan only"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DENTURES APP
   ============================================================ */
function CourierLeg({ label }) {
  return (
    <div className="flex items-center justify-center gap-2 py-1.5 text-[11px] font-medium text-amber-700">
      <Truck className="h-3.5 w-3.5" /><span>{label}</span>
    </div>
  );
}

function DentureApp() {
  const [view, setView] = useState("journey");
  const [group, setGroup] = useState(null);
  const [product, setProduct] = useState(null);
  const [detail, setDetail] = useState(null);

  const groups = useMemo(() => [...new Set(D_PRODUCTS.map(p=>p.group))], []);
  const productsInGroup = useMemo(() => D_PRODUCTS.filter(p => p.group === group), [group]);
  const sku = product;
  const path = sku ? sku.steps : [];
  const reset = () => { setGroup(null); setProduct(null); setDetail(null); };
  const pickProductByName = (name) => {
    const p = D_PRODUCTS.find(x => x.name === name);
    if (p) { setGroup(p.group); setProduct(p); setView("flow"); }
  };

  const block = (title, data, appts, accent, bg) => (
    <div className="flex-1 rounded-2xl border p-4" style={{ borderColor:accent, background:bg }}>
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800">{title}</h3>
        <span className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold" style={{ color:accent }}>
          <Calendar className="h-3.5 w-3.5" /> {appts} appointments
        </span>
      </div>
      <div className="mt-3 space-y-1.5">
        {data.map((s, i) => (
          <div key={i}>
            <div className="rounded-xl bg-white p-3 shadow-sm" style={{ border:`1px solid ${accent}33` }}>
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-800">{s.appt}</div>
                {s.product && (
                  <button onClick={() => pickProductByName(s.product)} className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background:accent }}>
                    view lab flow
                  </button>
                )}
              </div>
              {s.stageName && <div className="mt-0.5 text-[11px] font-medium" style={{ color:accent }}>Lab stage: {s.stageName}</div>}
              <div className="mt-1 text-xs leading-relaxed text-slate-500">{s.purpose}</div>
            </div>
            {i < data.length - 1 && (s.stageName
              ? <CourierLeg label="Driver: office → lab → office" />
              : <div className="flex justify-center py-1"><ArrowRight className="h-4 w-4 rotate-90 text-slate-300" /></div>)}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-3 flex gap-1.5">
        {[["journey","Patient Journey"],["flow","Product Lab Flow"]].map(([k,label]) => (
          <button key={k} onClick={() => setView(k)} className="rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all"
            style={{ background: view===k?"#4f46e5":"#fff", color: view===k?"#fff":"#475569", border:`1px solid ${view===k?"#4f46e5":"#e2e8f0"}` }}>
            {label}
          </button>
        ))}
        {view==="flow" && product && (
          <button onClick={reset} className="ml-auto flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        )}
      </div>

      {view === "journey" && (
        <div>
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <Repeat className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs leading-relaxed text-amber-800">
                Each conventional lab stage is returned to the office, tried in the patient's mouth, and sent back — so the five-appointment
                journey depends on repeated courier legs. Repairs and relines add more trips. This is why reliable <span className="font-semibold">local drivers</span> are
                critical, and why a digital denture (two appointments) is such a large reduction in patient chair time and logistics.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row">
            {block("Conventional Denture", CONVENTIONAL, 5, "#c2410c", "#fff7ed")}
            {block("Digital Denture", DIGITAL, 2, "#15803d", "#f0fdf4")}
          </div>
        </div>
      )}

      {view === "flow" && (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold" style={{ background: group?"#4f46e5":"#e2e8f0", color: group?"#fff":"#64748b" }}>{group?<Check className="h-3 w-3" />:1}</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">1 · Product family</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {groups.map(g => { const on=group===g; return (
                <button key={g} onClick={() => { setGroup(g); setProduct(null); }} className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                  style={{ background:on?"#4f46e5":"#f1f5f9", color:on?"#fff":"#334155", border:`1px solid ${on?"#4f46e5":"#e2e8f0"}` }}>{g}</button>
              );})}
            </div>
          </div>

          <div className={`mt-2.5 rounded-xl border p-3 transition-all ${group?"border-slate-200 bg-white":"border-slate-100 bg-slate-50 opacity-60"}`}>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold" style={{ background: product?"#4f46e5":"#e2e8f0", color: product?"#fff":"#64748b" }}>{product?<Check className="h-3 w-3" />:2}</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">2 · Product</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(group?productsInGroup:[]).map(p => { const on=product?.name===p.name; return (
                <button key={p.name} onClick={() => setProduct(p)} className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                  style={{ background:on?"#4f46e5":"#f1f5f9", color:on?"#fff":"#334155", border:`1px solid ${on?"#4f46e5":"#e2e8f0"}` }}>{p.name}</button>
              );})}
              {!group && <span className="text-xs text-slate-400">Select a family first</span>}
            </div>
          </div>

          <div className="mt-4 rounded-xl border p-4" style={{ borderColor: sku?"#a5b4fc":"#e2e8f0", background: sku?"#eef2ff":"#fff" }}>
            {!sku ? (
              <div className="flex items-center gap-2 text-sm text-slate-500"><ChevronDown className="h-4 w-4" /> Choose a product to reveal its production flow.</div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-indigo-500">Product</div>
                  <div className="text-xl font-bold text-slate-800">{sku.name}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{sku.group}</div>
                </div>
                <div className="rounded-lg bg-white px-3 py-2 text-xs text-slate-600 border border-indigo-100">{path.length} production steps</div>
              </div>
            )}
          </div>

          {sku && <Flowchart path={path} stepTable={D_STEP} onSelect={setDetail} />}
          <Legend depts={Object.keys(DEPTS).filter(d => path.some(n => D_STEP[n]?.dept===d) || !sku)} />
        </>
      )}

      <DetailPanel detail={detail} stepTable={D_STEP} onClose={() => setDetail(null)} />
    </div>
  );
}

/* ============================================================
   CROWN & BRIDGE APP
   ============================================================ */
function LayerPicker({ n, title, options, value, onPick, enabled, validValues }) {
  return (
    <div className={`rounded-xl border p-3 transition-all ${enabled?"border-slate-200 bg-white":"border-slate-100 bg-slate-50 opacity-60"}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold" style={{ background: value?"#4f46e5":"#e2e8f0", color: value?"#fff":"#64748b" }}>{value?<Check className="h-3 w-3" />:n}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map(o => { const ok=!validValues||validValues.has(o); const on=value===o; return (
          <button key={o} disabled={!enabled||!ok} onClick={() => onPick(o)} className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed"
            style={{ background:on?"#4f46e5":(enabled&&ok?"#f1f5f9":"#f8fafc"), color:on?"#fff":(enabled&&ok?"#334155":"#cbd5e1"), border:`1px solid ${on?"#4f46e5":"#e2e8f0"}`, textDecoration:(!ok&&enabled)?"line-through":"none" }}>{o}</button>
        );})}
      </div>
    </div>
  );
}

function CrownBridgeApp() {
  const [receipt, setReceipt] = useState(null);
  const [cat, setCat] = useState(null);
  const [mat, setMat] = useState(null);
  const [fin, setFin] = useState(null);
  const [detail, setDetail] = useState(null);

  const optionsValid = (picks) => CB_SKUS.filter(s => {
    if (picks.cat && s.category!==picks.cat) return false;
    if (picks.mat && s.material!==picks.mat) return false;
    if (picks.fin && s.finish!==CB_FINISH_MAP[picks.fin]) return false;
    return true;
  });
  const validMat = useMemo(() => new Set(optionsValid({cat}).map(s=>s.material)), [cat]);
  const validFin = useMemo(() => new Set(CB_L4.filter(f => new Set(optionsValid({cat,mat}).map(s=>s.finish)).has(CB_FINISH_MAP[f]))), [cat,mat]);
  const matched = useMemo(() => (!cat||!mat||!fin)?[]:CB_SKUS.filter(s => s.category===cat&&s.material===mat&&s.finish===CB_FINISH_MAP[fin]), [cat,mat,fin]);
  const sku = matched.length===1?matched[0]:null;
  const path = useMemo(() => (sku&&receipt)?cbBuildPath(sku,receipt):[], [sku,receipt]);
  const reset = () => { setReceipt(null); setCat(null); setMat(null); setFin(null); setDetail(null); };

  return (
    <div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <LayerPicker n={1} title="1 · How is the case received?" options={CB_L1} value={receipt} onPick={setReceipt} enabled={true} />
        <LayerPicker n={2} title="2 · Product category" options={CB_L2} value={cat} onPick={(v)=>{setCat(v);setMat(null);setFin(null);}} enabled={!!receipt} />
        <LayerPicker n={3} title="3 · Base material" options={CB_L3} value={mat} onPick={(v)=>{setMat(v);setFin(null);}} enabled={!!cat} validValues={validMat} />
        <LayerPicker n={4} title="4 · Finishing style" options={CB_L4} value={fin} onPick={setFin} enabled={!!mat} validValues={validFin} />
      </div>

      <div className="mt-4 rounded-xl border p-4" style={{ borderColor: sku?"#a5b4fc":"#e2e8f0", background: sku?"#eef2ff":"#fff" }}>
        {!receipt||!cat||!mat||!fin ? (
          <div className="flex items-center gap-2 text-sm text-slate-500"><ChevronDown className="h-4 w-4" /> Answer all four questions to reveal the product and its flow.</div>
        ) : sku ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-indigo-500">Product SKU</div>
              <div className="text-xl font-bold text-slate-800">{sku.name}</div>
              <div className="mt-0.5 text-xs text-slate-500">{receipt} · {cat} · {mat} · {fin}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-white px-3 py-2 text-xs text-slate-600 border border-indigo-100">{path.length} production steps</div>
              <button onClick={reset} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"><RotateCcw className="h-3.5 w-3.5" /> Reset</button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-rose-600 font-medium">That combination isn't a defined product. Try a different finishing style or material.</div>
        )}
      </div>

      {sku && path.length>0 && <Flowchart path={path} stepTable={CB_STEP} onSelect={setDetail} />}
      <Legend depts={Object.keys(DEPTS).filter(d => path.some(n => CB_STEP[n]?.dept===d) || !sku).filter(d => ["Data Capture","Model","Design","Machining","Wax / Metal","Finishing","Shipping"].includes(d))} />
      <DetailPanel detail={detail} stepTable={CB_STEP} onClose={() => setDetail(null)} />
    </div>
  );
}

/* ============================================================
   ROOT: product-type switcher
   ============================================================ */
export default function App() {
  const [productType, setProductType] = useState("dentures");

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900" style={{ fontFamily:"ui-sans-serif, system-ui, sans-serif" }}>
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600" />
            <h1 className="text-lg font-bold tracking-tight">Dental Lab — Production Flow Reference</h1>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">Pick a product type, then explore its decision tree and step-by-step production flow.</p>
          <div className="mt-3 flex gap-1.5">
            {[["dentures","Dentures"],["cb","Crown & Bridge"]].map(([k,label]) => (
              <button key={k} onClick={() => setProductType(k)} className="rounded-lg px-4 py-1.5 text-sm font-semibold transition-all"
                style={{ background: productType===k?"#0f172a":"#fff", color: productType===k?"#fff":"#475569", border:`1px solid ${productType===k?"#0f172a":"#e2e8f0"}` }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-5">
        {productType === "dentures" ? <DentureApp /> : <CrownBridgeApp />}
      </div>
    </div>
  );
}
