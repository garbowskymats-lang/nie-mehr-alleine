/* Nie mehr alleine – Bearbeitungsmodus
   Texte ändern, Elemente verschieben, Größe ziehen, Elemente ausblenden.
   Änderungen werden pro Seite im Browser gespeichert (localStorage). */
{
const KEY = "nma_edit_" + (location.pathname.split("/").pop() || "index.html");
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
const save = d => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} };
let data = load();               // { path: {t:html, x, y, w, h, hide} }
let mode = null;                 // null | text | move | size | hide

/* Eindeutiger Pfad eines Elements ab <body> */
const pathOf = el => {
  const parts = [];
  while (el && el !== document.body) {
    const i = Array.prototype.indexOf.call(el.parentNode.children, el) + 1;
    parts.unshift(el.tagName.toLowerCase() + ":nth-child(" + i + ")");
    el = el.parentNode;
  }
  return "body>" + parts.join(">");
};
const find = p => { try { return document.querySelector(p); } catch (e) { return null; } };
const locked = el => !!el.closest(".notice, #nmaEdit, .tabbar, .modal, .toast");
const TEXT = "h1,h2,h3,p,li,label,summary,small,strong,b,span,a,button,time,.btn,.stat span";
const BLOCK = ".card,.btn,.field,.photo,.person,.stat,.list-row,.tag,.chip,h1,h2,h3,p,img,.brand,.coins,.pack,.bubble";

/* Gespeicherte Änderungen anwenden */
const apply = () => {
  Object.entries(data).forEach(([p, c]) => {
    const el = find(p); if (!el || locked(el)) return;
    if (c.t != null) el.innerHTML = c.t;
    if (c.x || c.y) { el.style.transform = `translate(${c.x || 0}px,${c.y || 0}px)`; el.style.position = el.style.position || "relative"; el.style.zIndex = 5; }
    if (c.w) el.style.width = c.w + "px";
    if (c.h) el.style.height = c.h + "px";
    if (c.hide) el.style.display = "none";
  });
};
const rec = (el, patch) => { const p = pathOf(el); data[p] = Object.assign(data[p] || {}, patch); save(data); };

/* ---------- Werkzeugleiste ---------- */
const css = document.createElement("style");
css.textContent = `
#nmaEditBtn{position:fixed;left:14px;bottom:14px;z-index:90;min-height:44px;padding:0 16px;border-radius:30px;border:1px solid #2d5a5a;background:#0e1b1d;color:#eefcfb;font:600 14px var(--sans,system-ui);cursor:pointer;box-shadow:0 6px 20px #0008}
#nmaEdit{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:95;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:calc(100vw - 20px);padding:8px;border-radius:16px;background:#0e1b1df7;border:1px solid #2d5a5a;box-shadow:0 10px 30px #000a;font:14px var(--sans,system-ui)}
#nmaEdit button{min-height:40px;padding:0 12px;border-radius:10px;border:1px solid #24494a;background:#081315;color:#eefcfb;cursor:pointer;font:inherit}
#nmaEdit button.on{background:#21d4c3;color:#03201d;border-color:#21d4c3;font-weight:700}
#nmaEdit .tip{flex-basis:100%;text-align:center;color:#9db8b6;font-size:13px;padding:2px 4px}
@media(max-width:860px){#nmaEditBtn{bottom:84px}#nmaEdit{bottom:80px}}
body.ed-text [contenteditable=true]{outline:1px dashed #21d4c388;outline-offset:2px;cursor:text}
body.ed-text [contenteditable=true]:focus{outline:2px solid #21d4c3;background:#21d4c311}
body.ed-move .ed-hover{outline:2px dashed #e3b26a;cursor:move}
body.ed-size .ed-hover{outline:2px dashed #21d4c3;cursor:nwse-resize}
body.ed-hide .ed-hover{outline:2px solid #ff7a6b;background:#ff7a6b22;cursor:not-allowed}
.ed-sizing{resize:both!important;overflow:auto!important;outline:2px solid #21d4c3!important}
`;
document.head.appendChild(css);

const btn = document.createElement("button");
btn.id = "nmaEditBtn"; btn.type = "button"; btn.textContent = "✎ Bearbeiten";
const bar = document.createElement("div");
bar.id = "nmaEdit"; bar.hidden = true;
bar.innerHTML = `
  <button type="button" data-m="text">Text</button>
  <button type="button" data-m="move">Verschieben</button>
  <button type="button" data-m="size">Größe</button>
  <button type="button" data-m="hide">Ausblenden</button>
  <button type="button" data-a="reset">Seite zurücksetzen</button>
  <button type="button" data-a="copy">Änderungen kopieren</button>
  <button type="button" data-a="done">Fertig</button>
  <span class="tip" id="nmaTip">Wähle ein Werkzeug.</span>`;
document.body.append(btn, bar);

const tips = {
  text: "Text anklicken und direkt tippen oder löschen.",
  move: "Element mit gedrückter Maus (oder Finger) verschieben.",
  size: "Element anklicken, dann an der unteren rechten Ecke ziehen.",
  hide: "Element anklicken, um es auszublenden."
};

const textEls = () => [...document.querySelectorAll(TEXT)].filter(el => !locked(el) && !el.querySelector("input,select,textarea") && el.textContent.trim());
const setMode = m => {
  mode = m;
  document.body.classList.remove("ed-text", "ed-move", "ed-size", "ed-hide");
  bar.querySelectorAll("[data-m]").forEach(b => b.classList.toggle("on", b.dataset.m === m));
  document.querySelectorAll("[contenteditable]").forEach(el => el.removeAttribute("contenteditable"));
  document.querySelectorAll(".ed-sizing").forEach(el => el.classList.remove("ed-sizing"));
  if (!m) return;
  document.body.classList.add("ed-" + m);
  document.getElementById("nmaTip").textContent = tips[m];
  if (m === "text") textEls().forEach(el => el.setAttribute("contenteditable", "true"));
};

btn.addEventListener("click", () => { bar.hidden = false; btn.hidden = true; setMode("text"); });
bar.addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.m) return setMode(mode === b.dataset.m ? null : b.dataset.m);
  if (b.dataset.a === "done") { setMode(null); bar.hidden = true; btn.hidden = false; window.NMA && NMA.toast("Änderungen gespeichert."); }
  if (b.dataset.a === "reset") { if (window.NMA) NMA.modal({ title: "Seite zurücksetzen?", text: "Alle Änderungen auf dieser Seite werden verworfen.", cancel: "Abbrechen", ok: "Zurücksetzen", onOk: () => { localStorage.removeItem(KEY); location.reload(); } }); }
  if (b.dataset.a === "copy") {
    const out = JSON.stringify({ seite: KEY.replace("nma_edit_", ""), aenderungen: data }, null, 2);
    navigator.clipboard && navigator.clipboard.writeText(out).then(() => NMA.toast("Änderungen kopiert – z. B. an den Entwickler schicken."), () => NMA.toast("Kopieren wurde vom Browser blockiert."));
  }
});

/* Klicks auf Links/Knöpfe im Bearbeitungsmodus nicht auslösen */
document.addEventListener("click", e => {
  if (!mode || e.target.closest("#nmaEdit,#nmaEditBtn")) return;
  if (e.target.closest("a,button,label,summary")) { e.preventDefault(); }
  if (mode === "hide") {
    const el = e.target.closest(BLOCK); if (!el || locked(el)) return;
    el.style.display = "none"; rec(el, { hide: true });
    NMA.toast("Ausgeblendet. „Seite zurücksetzen“ holt alles zurück.");
  }
  if (mode === "size") {
    const el = e.target.closest(BLOCK); if (!el || locked(el)) return;
    document.querySelectorAll(".ed-sizing").forEach(x => x !== el && x.classList.remove("ed-sizing"));
    el.classList.add("ed-sizing");
  }
}, true);

/* Hervorhebung beim Überfahren */
let hov = null;
document.addEventListener("mouseover", e => {
  if (!mode || mode === "text") return;
  const el = e.target.closest(BLOCK);
  if (hov && hov !== el) hov.classList.remove("ed-hover");
  if (el && !locked(el)) { el.classList.add("ed-hover"); hov = el; }
});

/* Text speichern */
document.addEventListener("input", e => {
  const el = e.target.closest("[contenteditable=true]"); if (el) rec(el, { t: el.innerHTML });
});

/* Größe speichern */
const ro = new ResizeObserver(es => es.forEach(en => { const el = en.target; if (el.classList.contains("ed-sizing")) rec(el, { w: Math.round(el.offsetWidth), h: Math.round(el.offsetHeight) }); }));
new MutationObserver(ms => ms.forEach(m => { if (m.target.classList && m.target.classList.contains("ed-sizing")) ro.observe(m.target); }))
  .observe(document.body, { attributes: true, attributeFilter: ["class"], subtree: true });

/* Verschieben */
let drag = null;
document.addEventListener("pointerdown", e => {
  if (mode !== "move") return;
  const el = e.target.closest(BLOCK); if (!el || locked(el)) return;
  e.preventDefault();
  const c = data[pathOf(el)] || {};
  drag = { el, sx: e.clientX, sy: e.clientY, x: c.x || 0, y: c.y || 0 };
  el.style.position = el.style.position || "relative"; el.style.zIndex = 5;
  el.setPointerCapture && el.setPointerCapture(e.pointerId);
});
document.addEventListener("pointermove", e => {
  if (!drag) return;
  const x = drag.x + e.clientX - drag.sx, y = drag.y + e.clientY - drag.sy;
  drag.el.style.transform = `translate(${x}px,${y}px)`; drag.nx = x; drag.ny = y;
});
document.addEventListener("pointerup", () => {
  if (!drag) return;
  if (drag.nx != null) rec(drag.el, { x: Math.round(drag.nx), y: Math.round(drag.ny) });
  drag = null;
});

/* Nach dem Aufbau der Seite anwenden */
if (document.readyState === "complete") setTimeout(apply, 50);
else addEventListener("load", () => setTimeout(apply, 50));
}
