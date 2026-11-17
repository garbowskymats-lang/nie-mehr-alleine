/* =====================================================================
   VERWALTUNG im Team-Portal (admin.js)
   1) 📌 Pinnwand  – für ALLE Mitarbeiter: Team-Infos vom Chef (wichtig/angeheftet), Beiträge vom Team,
                     Laufband-Ticker oben. Gelesen-Bestätigung pro Mitarbeiter.
   2) 📡 Monitor   – nur Chef: Kunden gerade online, laufende Gespräche (wer wartet wie lange, wer bearbeitet),
                     Mitarbeiter online, Login-Zeiten (Kunden der letzten 3 Tage, neue Anmeldungen,
                     An-/Abmeldungen der Mitarbeiter).
   3) Excel-Export – Kunden-/Testerliste als Datei für Excel (Reiter „Kunden“, nur Chef).
   SERVER: Pinnwand, Ticker, Online-Status, Login-Protokoll und Export aus der Datenbank; Export nur für Admins
   und protokollieren (enthält personenbezogene Daten).
   ===================================================================== */
(() => {
  const T = window.TEAM; if (!T) return;
  const S = NMA.store, esc = NMA.esc, $ = id => document.getElementById(id);
  const fmt = t => t ? new Date(t).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "–";
  const ago = t => { const m = Math.round((Date.now() - t) / 6e4); return m < 1 ? "gerade eben" : m < 60 ? `vor ${m} Min.` : m < 1440 ? `vor ${Math.round(m / 60)} Std.` : `vor ${Math.round(m / 1440)} Tg.`; };
  const meName = () => T.isAdmin() ? "Chef" : T.ownerName(T.meKey());

  /* ---------- Daten ---------- */
  let pin = S.get("pinnwand", null) || [
    { id: "p1", by: "Chef", t: Date.now() - 864e5 * 2, title: "Willkommen im neuen Team-Portal", text: "Ab sofort läuft alles hier. Bei Fragen meldet euch in der Pinnwand oder direkt bei mir.", wichtig: true, read: {} },
    { id: "p2", by: "Marco B.", t: Date.now() - 36e5 * 5, title: "", text: "Kalle58 schreibt abends meistens zwischen 20 und 22 Uhr – gute Zeit für Antworten 🙂", wichtig: false, read: {} }
  ];
  let ticker = S.get("ticker", "Bitte keine Telefonnummern oder Treffen vereinbaren – Profile sind moderiert.");
  const savePin = () => S.set("pinnwand", pin);

  /* Demo: ein paar Kunden „gerade online“, damit der Monitor etwas zeigt */
  if (!S.get("monDemo", false)) { ["Kalle58", "Sonnenschein63", "Heidi_HH"].forEach((n, i) => { if (T.customers[n]) T.customers[n].lastLogin = Date.now() - (i * 7 + 2) * 6e4; }); T.saveAll(); S.set("monDemo", true); }
  /* Mitarbeiter-An-/Abmeldungen (Portal schreibt in "staffLog") */
  if (!S.get("staffLog", null)) {
    const n = Date.now(), H = 36e5;
    S.set("staffLog", [{ user: "sandra", in: n - 3 * H, out: null }, { user: "marco", in: n - 5 * H, out: null }, { user: "julia", in: n - 7 * H, out: n - 3 * H }, { user: "tim", in: n - 26 * H, out: n - 19 * H }, { user: "nicole", in: n - 30 * H, out: n - 23 * H }]);
  }

  /* ---------- Oberfläche ---------- */
  const css = document.createElement("style");
  css.textContent = `
  .tick{overflow:hidden;white-space:nowrap;border:1px solid #1f5552;background:#0f2a2b;color:#bdf3ee;border-radius:12px;padding:8px 0;margin:0 0 16px;font-size:14px}
  .tick span{display:inline-block;padding-left:100%;animation:tick 22s linear infinite}
  @keyframes tick{to{transform:translateX(-100%)}}
  @media(prefers-reduced-motion:reduce){.tick span{animation:none;padding-left:14px}}
  .pin-post{padding:16px 0;border-bottom:1px solid var(--line)}.pin-post:last-child{border-bottom:0}
  .pin-post.wichtig{border-left:3px solid var(--gold);padding-left:14px}
  .pin-post p{margin:6px 0;white-space:pre-wrap}
  .pin-meta{font-size:13px;color:var(--muted);display:flex;gap:10px;flex-wrap:wrap;align-items:center}
  .mon-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:16px}
  .mon-grid .card{padding:14px 16px}.mon-grid small{color:var(--muted);font-size:13px}.mon-grid strong{display:block;font:700 30px/1.1 var(--serif)}
  @media(max-width:800px){.mon-grid{grid-template-columns:1fr 1fr}}
  .dot-on{display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--ok);margin-right:6px}
  .dot-off{display:inline-block;width:9px;height:9px;border-radius:50%;background:#56706d;margin-right:6px}
  .wait-long{color:var(--danger);font-weight:700}
  `;
  document.head.appendChild(css);

  /* Laufband oben (alle Mitarbeiter) */
  const drawTicker = () => {
    let el = $("tickBar");
    if (!ticker) { el && el.remove(); return; }
    if (!el) { el = document.createElement("div"); el.id = "tickBar"; el.className = "tick"; el.setAttribute("role", "status"); const host = document.querySelector("main") || document.body; host.insertBefore(el, host.firstChild); }
    el.innerHTML = `<span>📣 ${esc(ticker)}</span>`;
  };

  /* Ungelesene wichtige Team-Infos → Hinweis beim Öffnen */
  const unreadImportant = () => pin.filter(p => p.wichtig && !(p.read || {})[T.meKey()]);
  const badge = () => { const b = $("pinBadge"); if (!b) return; const n = pin.filter(p => !(p.read || {})[T.meKey()]).length; b.textContent = n; b.hidden = !n; };

  /* ===== 📌 Pinnwand ===== */
  const renderPin = () => {
    const sec = $("pinnwand"); if (!sec) return;
    const list = pin.slice().sort((a, b) => (b.wichtig - a.wichtig) || b.t - a.t);
    sec.innerHTML = `<div class="two">
      <form class="card pad" id="pinForm"><h2 style="font-size:22px;margin-bottom:10px">Neuer Beitrag</h2>
        ${T.isAdmin() ? `<div class="field"><label for="pinT">Überschrift (optional)</label><input class="input" id="pinT" maxlength="80"></div>` : ""}
        <div class="field"><label for="pinX">Nachricht ans Team</label><textarea class="input" id="pinX" rows="4" maxlength="1500" placeholder="z. B. Hinweis zu einem Kunden, Frage an alle …"></textarea></div>
        ${T.isAdmin() ? `<label class="small" style="display:flex;gap:8px;align-items:center;margin-bottom:12px"><input type="checkbox" id="pinW"> Wichtig – oben anheften, jeder muss „Gelesen“ bestätigen</label>` : ""}
        <button class="btn primary">Veröffentlichen</button>
        ${T.isAdmin() ? `<hr style="border:0;border-top:1px solid var(--line);margin:20px 0">
          <div class="field"><label for="tickX">Laufband oben (für alle sichtbar)</label><input class="input" id="tickX" maxlength="160" value="${esc(ticker)}" placeholder="leer = kein Laufband"></div>
          <button type="button" class="btn sm" id="tickSave">Laufband speichern</button>` : ""}
      </form>
      <div class="card pad"><h2 style="font-size:22px;margin-bottom:6px">Pinnwand</h2>
        ${list.map(p => { const r = p.read || {}, rc = Object.keys(r).length, me = r[T.meKey()];
          return `<article class="pin-post ${p.wichtig ? "wichtig" : ""}"><div class="pin-meta">${p.wichtig ? '<b style="color:var(--gold)">📌 Team-Info</b>' : ""}<b>${esc(p.by)}</b><span>${fmt(p.t)}</span>${T.isAdmin() ? `<span>· gelesen von ${rc}</span>` : ""}</div>
            ${p.title ? `<h3 style="margin:6px 0 0;font-size:18px">${esc(p.title)}</h3>` : ""}<p>${esc(p.text)}</p>
            <div class="pin-meta">${me ? "✓ gelesen" : `<button class="btn sm" data-read="${p.id}">Gelesen</button>`}${T.isAdmin() || p.by === meName() ? `<button class="btn sm ghost" data-pdel="${p.id}">Löschen</button>` : ""}${T.isAdmin() ? `<button class="btn sm ghost" data-ppin="${p.id}">${p.wichtig ? "Nicht mehr anheften" : "Anheften"}</button>` : ""}</div></article>`; }).join("") || '<p class="empty">Noch keine Beiträge.</p>'}
      </div></div>`;
    $("pinForm").addEventListener("submit", e => { e.preventDefault(); const x = $("pinX").value.trim(); if (x.length < 2) { NMA.toast("Bitte eine Nachricht schreiben."); return; }
      pin.push({ id: "p" + Date.now(), by: meName(), t: Date.now(), title: $("pinT") ? $("pinT").value.trim() : "", text: x, wichtig: !!($("pinW") && $("pinW").checked), read: { [T.meKey()]: Date.now() } }); savePin(); renderPin(); badge(); NMA.toast("Veröffentlicht."); });
    const ts = $("tickSave"); if (ts) ts.addEventListener("click", () => { ticker = $("tickX").value.trim(); S.set("ticker", ticker); drawTicker(); NMA.toast(ticker ? "Laufband gespeichert." : "Laufband ausgeschaltet."); });
    sec.querySelectorAll("[data-read]").forEach(b => b.addEventListener("click", () => { const p = pin.find(x => x.id === b.dataset.read); (p.read = p.read || {})[T.meKey()] = Date.now(); savePin(); renderPin(); badge(); }));
    sec.querySelectorAll("[data-pdel]").forEach(b => b.addEventListener("click", () => NMA.modal({ title: "Beitrag löschen?", text: "Der Beitrag verschwindet für alle.", cancel: "Abbrechen", ok: "Löschen", onOk: () => { pin = pin.filter(x => x.id !== b.dataset.pdel); savePin(); renderPin(); badge(); } })));
    sec.querySelectorAll("[data-ppin]").forEach(b => b.addEventListener("click", () => { const p = pin.find(x => x.id === b.dataset.ppin); p.wichtig = !p.wichtig; savePin(); renderPin(); }));
    badge();
  };

  /* ===== 📡 Monitor + Login-Zeiten (nur Chef) ===== */
  let monView = "live";
  const renderMon = () => {
    const sec = $("monitor"); if (!sec) return;
    if (!T.isAdmin()) { sec.innerHTML = ""; return; }
    const now = Date.now(), C = Object.entries(T.customers);
    const online = C.filter(([, c]) => c.lastLogin && now - c.lastLogin < 30 * 6e4).sort((a, b) => b[1].lastLogin - a[1].lastLogin);
    const waiting = T.items.filter(i => i.kind === "msg").map(i => ({ i, p: T.profiles.find(p => p.id === i.pid) })).filter(x => x.p).sort((a, b) => a.i.t - b.i.t);
    const staffOn = T.staff.filter(s => s.active && s.status !== "offline");
    const neu = C.filter(([, c]) => c.reg && now - c.reg < 7 * 864e5).sort((a, b) => b[1].reg - a[1].reg);
    const logins3 = C.filter(([, c]) => c.lastLogin && now - c.lastLogin < 3 * 864e5).sort((a, b) => b[1].lastLogin - a[1].lastLogin);
    const slog = S.get("staffLog", []).slice().sort((a, b) => b.in - a.in).slice(0, 40);
    sec.innerHTML = `<div class="chips" id="monNav" style="padding:0 0 14px"><button class="chip ${monView === "live" ? "on" : ""}" data-mv="live">Live</button><button class="chip ${monView === "login" ? "on" : ""}" data-mv="login">Login-Zeiten</button><button class="btn sm ghost" id="monRe" style="margin-left:auto">↻ Aktualisieren</button></div>
      ${monView === "live" ? `<div class="mon-grid">
        <div class="card"><small>Kunden online</small><strong>${online.length}</strong></div>
        <div class="card"><small>Warten auf Antwort</small><strong>${waiting.filter(x => !x.i.read).length}</strong></div>
        <div class="card"><small>Mitarbeiter online</small><strong>${staffOn.length}</strong></div>
        <div class="card"><small>Neue Kunden (7 Tage)</small><strong>${neu.length}</strong></div></div>
      <div class="two">
        <div class="card pad"><h3 style="font-size:18px;margin:0 0 10px">Kunden gerade online <small class="muted" style="font-weight:400">(letzte 30 Min.)</small></h3>
          ${online.length ? `<table class="staff"><thead><tr><th>Kunde</th><th>Status</th><th class="num">Coins</th><th>Aktiv</th></tr></thead><tbody>${online.map(([n, c]) => `<tr><td data-l="Kunde"><span class="dot-on"></span><button class="link" data-kcard="${esc(n)}" style="background:none;border:0;color:var(--accent);cursor:pointer;font:inherit;padding:0">${esc(n)}</button></td><td data-l="Status">${c.st === "K" ? "Kunde" : "Tester"}</td><td data-l="Coins" class="num">${c.coins ?? 0}</td><td data-l="Aktiv">${ago(c.lastLogin)}</td></tr>`).join("")}</tbody></table>` : '<p class="muted">Gerade niemand online.</p>'}
          <h3 style="font-size:18px;margin:20px 0 10px">Mitarbeiter</h3>
          ${T.staff.filter(s => s.active).map(s => `<div style="display:flex;justify-content:space-between;gap:8px;padding:6px 0;border-bottom:1px solid var(--line);font-size:14px"><span><span class="${s.status === "offline" ? "dot-off" : "dot-on"}"></span>${esc(s.name)}</span><span class="muted">${esc(s.status || "")} · ${T.items.filter(i => { const p = T.profiles.find(x => x.id === i.pid); return p && p.owner === s.user && !i.read; }).length} wartend</span></div>`).join("")}
        </div>
        <div class="card pad"><h3 style="font-size:18px;margin:0 0 10px">Laufende Gespräche</h3>
          ${waiting.length ? `<table class="staff"><thead><tr><th>Kunde → Profil</th><th>Bearbeitet</th><th>Wartet seit</th></tr></thead><tbody>${waiting.map(({ i, p }) => { const w = Math.round((now - i.t) / 6e4); return `<tr><td data-l="Kunde → Profil">${esc(i.cust)} → ${esc(p.name)}${i.read ? ' <small class="muted">(gelesen)</small>' : ""}</td><td data-l="Bearbeitet">${esc(T.ownerName(p.owner))}</td><td data-l="Wartet seit" class="${!i.read && w > 15 ? "wait-long" : ""}">${ago(i.t)}</td></tr>`; }).join("")}</tbody></table>` : '<p class="muted">Keine offenen Gespräche.</p>'}
          <p class="hint" style="margin-top:10px">Rot = wartet länger als 15 Minuten auf Antwort.</p></div>
      </div>` : `<div class="two">
        <div class="card pad"><h3 style="font-size:18px;margin:0 0 10px">Kunden-Logins der letzten 3 Tage (${logins3.length})</h3>
          <table class="staff"><thead><tr><th>Kunde</th><th>Status</th><th>Letzter Login</th></tr></thead><tbody>${logins3.map(([n, c]) => `<tr><td data-l="Kunde"><button data-kcard="${esc(n)}" style="background:none;border:0;color:var(--accent);cursor:pointer;font:inherit;padding:0">${esc(n)}</button></td><td data-l="Status">${c.st === "K" ? "Kunde" : "Tester"}</td><td data-l="Letzter Login">${fmt(c.lastLogin)}</td></tr>`).join("") || '<tr><td colspan="3" class="muted">Keine.</td></tr>'}</tbody></table>
          <h3 style="font-size:18px;margin:20px 0 10px">Neue Anmeldungen (7 Tage)</h3>
          <table class="staff"><thead><tr><th>Kunde</th><th>Registriert</th><th>Erste Zahlung</th></tr></thead><tbody>${neu.map(([n, c]) => `<tr><td data-l="Kunde"><button data-kcard="${esc(n)}" style="background:none;border:0;color:var(--accent);cursor:pointer;font:inherit;padding:0">${esc(n)}</button></td><td data-l="Registriert">${fmt(c.reg)}</td><td data-l="Erste Zahlung">${c.firstPay ? fmt(c.firstPay) : "–"}</td></tr>`).join("") || '<tr><td colspan="3" class="muted">Keine.</td></tr>'}</tbody></table></div>
        <div class="card pad"><h3 style="font-size:18px;margin:0 0 10px">Mitarbeiter: An- und Abmeldungen</h3>
          <table class="staff"><thead><tr><th>Mitarbeiter</th><th>Angemeldet</th><th>Abgemeldet</th><th class="num">Dauer</th></tr></thead><tbody>${slog.map(l => { const d = Math.round(((l.out || now) - l.in) / 6e4); return `<tr><td data-l="Mitarbeiter">${esc(T.ownerName(l.user))}</td><td data-l="Angemeldet">${fmt(l.in)}</td><td data-l="Abgemeldet">${l.out ? fmt(l.out) : '<span class="dot-on"></span>noch da'}</td><td data-l="Dauer" class="num">${Math.floor(d / 60)}:${String(d % 60).padStart(2, "0")} h</td></tr>`; }).join("")}</tbody></table></div>
      </div>`}`;
    $("monNav").addEventListener("click", e => { const b = e.target.closest("[data-mv]"); if (b) { monView = b.dataset.mv; renderMon(); } });
    $("monRe").addEventListener("click", renderMon);
  };

  /* ===== Excel-Export (CSV mit ; – öffnet direkt in Excel) ===== */
  const csvCell = v => { v = v == null ? "" : String(v); if (/^[=+\-@]/.test(v)) v = "'" + v; return /[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; };
  const exportCSV = (which, eg) => {
    const rows = Object.entries(T.customers).filter(([, c]) => (which === "alle" || c.st === which) && (!eg || (c.eingang && c.eingang.code) === eg));
    const head = ["Kunden-Nr.", "Nickname", "Vorname", "Status", "E-Mail", "Geburtsdatum", "Land", "Wohnort", "Eingang", "Registriert", "Kunde seit", "Letzter Login", "Coins", "Umsatz €", "Newsletter", "Gesperrt"];
    const data = rows.map(([n, c]) => [c.nr, n, c.vorname, c.st === "K" ? "Kunde" : "Tester", c.mail, c.birth, c.land || "DE", c.ort, c.eingang && c.eingang.code, fmt(c.reg), c.firstPay ? fmt(c.firstPay) : "", fmt(c.lastLogin), c.coins ?? 0,
      ((c.buchungen || []).reduce((a, b) => a + b.eur, 0)).toFixed(2).replace(".", ","), c.newsletter === false ? "nein" : "ja", c.gesperrt ? "ja" : "nein"]);
    const csv = "﻿" + [head, ...data].map(r => r.map(csvCell).join(";")).join("\r\n");
    const name = `${which === "T" ? "Testerliste" : which === "K" ? "Kundenliste" : "Alle_Kunden"}${eg ? "_" + eg : ""}_${new Date().toISOString().slice(0, 10)}.csv`;
    try { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); NMA.toast(`${rows.length} Einträge exportiert – öffnet sich in Excel.`); }
    catch (e) { NMA.toast("Download hier nicht möglich – bitte auf der echten Seite."); }
  };
  /* Knöpfe im Reiter „Kunden“ ergänzen (nach jedem Neuzeichnen) */
  const addExport = () => {
    const tb = document.querySelector("#kunden .toolbar"); if (!tb || tb.querySelector("[data-exp]") || !T.isAdmin()) return;
    const box = document.createElement("div"); box.style.cssText = "display:flex;gap:6px;flex-wrap:wrap";
    box.innerHTML = `<button class="btn sm" data-exp="K">⬇ Kundenliste (Excel)</button><button class="btn sm" data-exp="T">⬇ Testerliste (Excel)</button>`;
    tb.appendChild(box);
    box.querySelectorAll("[data-exp]").forEach(b => b.addEventListener("click", () => { const eg = ($("kdEg") || {}).value || ""; exportCSV(b.dataset.exp, eg); }));
  };
  const kSec = $("kunden"); if (kSec) new MutationObserver(addExport).observe(kSec, { childList: true });

  /* Beim Öffnen: ungelesene wichtige Team-Infos anzeigen */
  const nag = () => { const u = unreadImportant(); if (!u.length || document.querySelector(".modal")) return;
    const p = u[0]; NMA.modal({ title: `📌 ${p.title || "Team-Info"}`, text: `${esc(p.text)}<br><br><small>von ${esc(p.by)} · ${fmt(p.t)}</small>`, ok: "Gelesen", onOk: () => { (p.read = p.read || {})[T.meKey()] = Date.now(); savePin(); badge(); renderPin(); setTimeout(nag, 300); } }); };

  const render = () => { drawTicker(); renderPin(); renderMon(); addExport(); badge(); };
  addEventListener("storage", e => { if (e.key === "nma_pinnwand") { pin = S.get("pinnwand", []); renderPin(); badge(); } if (e.key === "nma_ticker") { ticker = S.get("ticker", ""); drawTicker(); } });
  setInterval(() => { if (!$("monitor").hidden) renderMon(); }, 30000);
  window.ADM = { render, exportCSV };
  render(); setTimeout(nag, 900);
})();
