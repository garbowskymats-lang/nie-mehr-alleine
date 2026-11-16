/* =====================================================================
   KUNDENKARTE – Mitarbeiterbereich (team.html), nur für Admins
   Alles Wichtige zu einem Kunden auf einen Blick – für Rückfragen und Unstimmigkeiten:
   Stammdaten, Registrierung, erste Zahlung, Name laut Zahlungsanbieter, E-Mail, letzter Login,
   letzte Nachricht, Coins (mit Korrektur), alle Buchungen, Notizen, Häkchen.

   PASSWORT: wird NICHT angezeigt. Passwörter speichert der Server nur verschlüsselt (Hash,
   z. B. bcrypt/argon2) – niemand kann sie lesen, auch der Admin nicht. Stattdessen:
   „Link zum Zurücksetzen senden“.
   Demo: Daten im Browser. Server: Tabellen kunden, buchungen (vom Zahlungsanbieter), korrekturen.
   ===================================================================== */
(() => {
  const T = window.TEAM; if (!T) return;
  const S = NMA.store, esc = NMA.esc, $ = id => document.getElementById(id);
  const eur = n => (n || 0).toLocaleString("de-DE", { style: "currency", currency: "EUR" });
  const dt = t => t ? new Date(t).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "–";
  const d = t => t ? new Date(t).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) : "–";
  const parseDE = s => { const m = String(s || "").match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/); return m ? new Date(+m[3], +m[2] - 1, +m[1], 12).getTime() : null; };
  const hash = s => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
  const age = b => { if (!b) return null; const x = new Date(b + "T00:00"), n = new Date(); let a = n.getFullYear() - x.getFullYear(); const m = n.getMonth() - x.getMonth(); if (m < 0 || (m === 0 && n.getDate() < x.getDate())) a--; return a; };

  /* ---------- Demo-Daten ergänzen (nur fehlende Felder; erfundene Beispielwerte) ---------- */
  const demoFill = () => {
    const me = NMA.user().nick; let ch = false;
    Object.entries(T.customers).forEach(([nick, c]) => {
      if (nick === me) return;                                  /* der Test-Kunde hat echte Demo-Werte */
      const h = hash(nick);
      const reg = c.reg || parseDE(c.since) || Date.now() - (h % 200 + 5) * 864e5;
      if (!c.reg) { c.reg = reg; ch = true; }
      if (!c.mail) { c.mail = nick.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "") + "@beispiel.de"; ch = true; }
      if (!c.birth && c.age) { const y = new Date().getFullYear() - c.age - 1; c.birth = `${y}-${String(h % 12 + 1).padStart(2, "0")}-${String(h % 27 + 1).padStart(2, "0")}`; ch = true; }
      if (!c.lastLogin) { c.lastLogin = Date.now() - (h % 96 + 1) * 36e5; ch = true; }
      if (!c.buchungen) {
        c.buchungen = [];
        if (c.st === "K") {
          const n = h % 3 + 1;
          for (let i = 0; i < n; i++) { const p = NMA.packs[(h >>> i) % 4]; c.buchungen.push({ t: reg + (i * 9 + 2) * 864e5 + (h % 5000) * 1000, coins: p.coins, eur: p.price, art: ["Kreditkarte", "Online-Überweisung", "Vorkasse"][(h >>> (i + 2)) % 3], nr: "B-" + String(h % 900000 + i * 37).padStart(6, "0") }); }
          c.buchungen = c.buchungen.filter(b => b.t < Date.now());
        }
        ch = true;
      }
      if (c.st === "K" && !c.payName) { c.payName = (c.vorname || nick) + " Muster"; ch = true; }
      if (c.buchungen.length && !c.firstPay) { c.firstPay = c.buchungen[0].t; ch = true; }
    });
    if (ch) T.saveAll();
  };

  /* letzte Nachricht, die der Kunde bekommen hat (Antwort, Massenversand) */
  const lastMsg = nick => {
    let best = null;
    T.sent.forEach(s => { if (s.cust === nick && (!best || s.t > best.t)) best = s; });
    const p = best && T.profiles.find(x => x.id === best.pid);
    return best ? { t: best.t, von: p ? p.name : "?", mass: !!best.mass } : null;
  };
  const umsatz = c => (c.buchungen || []).reduce((a, b) => a + b.eur, 0);

  const css = document.createElement("style");
  css.textContent = `
  .kd-list td{cursor:pointer}.kd-list tr:hover td{background:#ffffff07}
  .modal .card.kd-card{width:min(1150px,100%);max-width:none;max-height:94svh;overflow:auto;padding:24px 26px}
  .kd-checks label input{flex:none}
  .kd-kv b .btn{white-space:nowrap}
  .kd-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:22px}
  @media(max-width:860px){.kd-grid{grid-template-columns:1fr}}
  .kd-kv{display:grid;grid-template-columns:minmax(110px,170px) minmax(0,1fr);gap:7px 14px;font-size:15px}
  .kd-kv span{color:var(--muted)}.kd-kv b{font-weight:600;overflow-wrap:anywhere}
  .kd-box{padding:14px;border:1px solid var(--line);border-radius:12px;margin-bottom:14px}
  .kd-box h4{margin:0 0 10px;font-size:13px;letter-spacing:.02em;color:var(--muted)}
  .kd-coins{font:700 34px/1 var(--serif);color:var(--gold)}
  .kd-checks label{display:flex;gap:8px;align-items:center;min-height:36px}
  .kd-checks input{accent-color:var(--accent);width:18px;height:18px}
  .kd-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:16px}
  .kd-head h2{font-size:28px}
  table.kd-b{width:100%;border-collapse:collapse;font-size:14px}
  .kd-b th{text-align:left;color:var(--muted);font-weight:600;font-size:12px;padding:6px 8px;border-bottom:1px solid var(--line)}
  .kd-b td{padding:7px 8px;border-bottom:1px solid var(--line)}.kd-b td.num,.kd-b th.num{text-align:right;white-space:nowrap}
  .kd-b tfoot td{font-weight:700;border-bottom:0}
  `;
  document.head.appendChild(css);

  let q = "", stf = "";
  const render = () => {
    const sec = $("kunden"); if (!sec) return;
    if (!T.isAdmin()) { sec.innerHTML = ""; return; }
    demoFill();
    const ql = q.toLowerCase();
    const list = Object.entries(T.customers).filter(([n, c]) => (!stf || c.st === stf) &&
      (!ql || n.toLowerCase().includes(ql) || String(c.nr).includes(ql) || (c.mail || "").toLowerCase().includes(ql) || (c.payName || "").toLowerCase().includes(ql) || (c.vorname || "").toLowerCase().includes(ql)))
      .sort((a, b) => (b[1].lastLogin || 0) - (a[1].lastLogin || 0));
    sec.innerHTML = `<div class="toolbar"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <label class="search"><span aria-hidden="true">⌕</span><input type="search" id="kdQ" placeholder="Nickname, Kunden-Nr., E-Mail, Name" value="${esc(q)}" aria-label="Kunden suchen"></label>
        <select class="input" id="kdSt" style="width:auto"><option value="">Alle</option><option value="K" ${stf === "K" ? "selected" : ""}>Kunden (haben bezahlt)</option><option value="T" ${stf === "T" ? "selected" : ""}>Testmitglieder</option></select></div>
        <span class="hint">${list.length} von ${Object.keys(T.customers).length} · Klick öffnet die Kundenkarte</span></div>
      <div class="card pad" style="padding-top:8px"><table class="staff kd-list"><thead><tr><th>Kunden-Nr.</th><th>Nickname</th><th>Status</th><th>Wohnort</th><th class="num">Coins</th><th class="num">Umsatz</th><th>Letzter Login</th></tr></thead><tbody>
      ${list.map(([n, c]) => `<tr data-k="${esc(n)}"><td data-l="Kunden-Nr.">#${c.nr || "–"}</td><td data-l="Nickname"><b>${esc(n)}</b>${c.gesperrt ? ' <small class="muted">· gesperrt</small>' : ""}</td><td data-l="Status">${c.st === "K" ? "Kunde" : "Tester"}</td><td data-l="Wohnort">${esc(c.ort || "–")} <small class="muted">${c.land || "DE"}</small></td><td data-l="Coins" class="num">${c.coins ?? 0}</td><td data-l="Umsatz" class="num">${eur(umsatz(c))}</td><td data-l="Letzter Login">${dt(c.lastLogin)}</td></tr>`).join("") || '<tr><td colspan="7" class="empty">Keine Kunden gefunden.</td></tr>'}
      </tbody></table></div>`;
    const qi = $("kdQ"); qi.addEventListener("input", () => { q = qi.value; render(); const n = $("kdQ"); n.focus(); n.setSelectionRange(n.value.length, n.value.length); });
    $("kdSt").addEventListener("change", e => { stf = e.target.value; render(); });
    sec.querySelectorAll("[data-k]").forEach(tr => tr.addEventListener("click", () => open(tr.dataset.k)));
  };

  /* ---------- Kundenkarte ---------- */
  const open = nick => {
    if (!T.isAdmin()) return;
    demoFill();
    const c = T.customers[nick]; if (!c) { NMA.toast("Kunde nicht gefunden."); return; }
    const lm = lastMsg(nick), a = age(c.birth), sup = S.get("support", []).filter(t => t.nick === nick);
    const bu = (c.buchungen || []).slice().sort((x, y) => y.t - x.t), plz = (String(c.ort || "").match(/\d{4,5}/) || [])[0];
    const m = document.createElement("div"); m.className = "modal form-modal";
    m.innerHTML = `<div class="card kd-card" role="dialog" aria-modal="true" aria-label="Kundenkarte ${esc(nick)}">
      <div class="kd-head"><div><h2>${esc(nick)}</h2><small class="muted">Kunden-Nr. #${c.nr || "–"} · ${c.st === "K" ? "Kunde (hat bezahlt)" : "Testmitglied (noch nie gekauft)"}${c.gesperrt ? " · <b style='color:var(--danger)'>gesperrt</b>" : ""}</small></div>
        <button class="btn ghost sm" data-x>Schließen</button></div>
      <div class="kd-grid"><div>
        <div class="kd-box"><h4>STAMMDATEN</h4><div class="kd-kv">
          <span>Nickname</span><b>${esc(nick)}</b>
          <span>Vorname</span><b>${esc(c.vorname || "–")}</b>
          <span>Geburtsdatum</span><b>${c.birth ? d(new Date(c.birth + "T12:00").getTime()) + (a !== null ? ` · <span style="color:var(--accent)">${a} Jahre</span>` : "") : "–"}</b>
          <span>Geschlecht · sucht</span><b>${c.sex === "w" ? "Frau" : "Mann"} · ${esc(c.look || "–")}</b>
          <span>Wohnort</span><b>${esc(c.ort || "–")} (${NMA.LAND[c.land || "DE"].name})</b>
          <span>PLZ-Bereich</span><b>${esc(NMA.region(c.land || "DE", plz) || "–")}</b>
          <span>E-Mail</span><b>${esc(c.mail || "–")}</b>
          <span>Passwort</span><b><span class="muted" style="font-weight:400">verschlüsselt gespeichert – nicht einsehbar</span> <button class="btn sm" data-pw style="margin-left:6px;min-height:30px">Link zum Zurücksetzen senden</button></b>
        </div></div>
        <div class="kd-box"><h4>KONTO &amp; AKTIVITÄT</h4><div class="kd-kv">
          <span>Registriert am</span><b>${dt(c.reg)}</b>
          <span>Kunde seit</span><b>${c.firstPay ? dt(c.firstPay) + ' <small class="muted">(erste Zahlung)</small>' : "– noch keine Zahlung"}</b>
          <span>Name laut Zahlung</span><b>${c.payName ? esc(c.payName) : `– <small class="muted" style="font-weight:400">(liefert der Zahlungsanbieter)</small>`}</b>
          <span>Letzter Login</span><b>${dt(c.lastLogin)}</b>
          <span>Letzte Nachricht erhalten</span><b>${lm ? `${dt(lm.t)} · von <span style="color:var(--accent)">${esc(lm.von)}</span>${lm.mass ? " (Massenversand)" : ""}` : "–"}</b>
          <span>Support-Anfragen</span><b>${sup.length ? `${sup.length} (${sup.filter(t => t.status === "offen").length} offen)` : "keine"}</b>
        </div></div>
        <div class="kd-box"><h4>NOTIZEN</h4>
          <div class="field"><label for="kdNote">Interne Notiz (nur Chef)</label><textarea class="input" id="kdNote" rows="3" placeholder="z. B. Absprachen, Kulanz, Rückfragen">${esc(c.adminNote || "")}</textarea></div>
          <div class="field" style="margin-bottom:0"><label for="kdTeam">Notiz für das Team (sehen alle Mitarbeiter im Chat)</label><textarea class="input" id="kdTeam" rows="3">${esc(T.notes[nick] || "")}</textarea></div>
        </div>
      </div><div>
        <div class="kd-box"><h4>COINS</h4>
          <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><span class="kd-coins" id="kdCoins">${c.coins ?? 0}</span><span class="muted">Coins aktuell</span></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;align-items:center">
            <input class="input" id="kdAdd" type="number" step="1" placeholder="+/- Coins" style="width:120px;min-height:40px">
            <input class="input" id="kdWhy" placeholder="Grund (Pflicht)" style="flex:1;min-width:160px;min-height:40px">
            <button class="btn sm" id="kdBook">Buchen</button></div>
          ${(c.korrekturen || []).length ? `<p class="hint" style="margin:10px 0 0">Korrekturen: ${(c.korrekturen || []).slice(-3).reverse().map(k => `${d(k.t)} ${k.n > 0 ? "+" : ""}${k.n} (${esc(k.grund)})`).join(" · ")}</p>` : ""}
        </div>
        <div class="kd-box"><h4>EINSTELLUNGEN</h4><div class="kd-checks">
          <label><input type="checkbox" id="kdNews" ${c.newsletter !== false ? "checked" : ""}> Newsletter erlaubt</label>
          <label><input type="checkbox" id="kdNoMass" ${c.noMass ? "checked" : ""}> Keine Massennachrichten an diesen Kunden</label>
          <label><input type="checkbox" id="kdLock" ${c.gesperrt ? "checked" : ""}> Konto gesperrt</label>
        </div></div>
        <div class="kd-box"><h4>BUCHUNGEN</h4>
          ${bu.length ? `<table class="kd-b"><thead><tr><th>Datum</th><th>Buchung</th><th>Zahlungsart</th><th class="num">Coins</th><th class="num">Betrag</th></tr></thead><tbody>
            ${bu.map(b => `<tr><td>${dt(b.t)}</td><td>${esc(b.nr || "–")}</td><td>${esc(b.art || "–")}</td><td class="num">${b.coins}</td><td class="num">${eur(b.eur)}</td></tr>`).join("")}
            </tbody><tfoot><tr><td colspan="3">Umsatz gesamt (${bu.length} ${bu.length === 1 ? "Kauf" : "Käufe"})</td><td class="num">${bu.reduce((s, b) => s + b.coins, 0)}</td><td class="num">${eur(umsatz(c))}</td></tr></tfoot></table>`
            : '<p class="muted" style="margin:0">Noch keine Buchungen.</p>'}
        </div>
      </div></div>
      <div class="row" style="margin-top:6px"><span class="hint" style="margin-right:auto">Änderungen werden sofort gespeichert. Server: jede Änderung mit Admin und Uhrzeit protokollieren.</span><button class="btn primary" data-x>Fertig</button></div>
    </div>`;
    document.body.appendChild(m);
    m.addEventListener("click", e => { if (e.target === m || e.target.hasAttribute("data-x")) { m.remove(); render(); } });
    const save = () => { T.saveAll(); };
    m.querySelector("#kdNote").addEventListener("input", e => { c.adminNote = e.target.value; save(); });
    m.querySelector("#kdTeam").addEventListener("input", e => { T.notes[nick] = e.target.value; save(); });
    m.querySelector("#kdNews").addEventListener("change", e => { c.newsletter = e.target.checked; save(); });
    m.querySelector("#kdNoMass").addEventListener("change", e => { c.noMass = e.target.checked; save(); NMA.toast(c.noMass ? "Kunde wird beim Massenversand übersprungen." : "Kunde bekommt wieder Massennachrichten."); });
    m.querySelector("#kdLock").addEventListener("change", e => { c.gesperrt = e.target.checked; save(); NMA.toast(c.gesperrt ? `${nick} ist gesperrt.` : `${nick} ist wieder freigeschaltet.`); });
    m.querySelector("[data-pw]").addEventListener("click", () => NMA.toast(`Link zum Zurücksetzen an ${c.mail || "die E-Mail-Adresse"} gesendet (Demo).`));
    m.querySelector("#kdBook").addEventListener("click", () => {
      const n = Math.round(+m.querySelector("#kdAdd").value), grund = m.querySelector("#kdWhy").value.trim();
      if (!n) { NMA.toast("Bitte eine Anzahl Coins eingeben (z. B. 10 oder -5)."); return; }
      if (grund.length < 3) { NMA.toast("Bitte einen Grund angeben – wichtig bei Unstimmigkeiten."); return; }
      c.coins = Math.max(0, (c.coins || 0) + n); (c.korrekturen = c.korrekturen || []).push({ t: Date.now(), n, grund, von: T.meKey() });
      if (nick === NMA.user().nick) NMA.setCoins(c.coins);
      save(); m.remove(); open(nick); NMA.toast(`${n > 0 ? "+" : ""}${n} Coins gebucht.`);
    });
  };

  document.addEventListener("click", e => { const b = e.target.closest("[data-kcard]"); if (b) open(b.dataset.kcard); });
  window.KD = { render, open };
  render();
})();
