/* =====================================================================
   ARCHIV DER CHATVERLÄUFE – Mitarbeiterbereich (team.html), Reiter „🔒 Verläufe“ (nur Admin + Code)
   - Jede Nachricht (Kunde, Antwort des Mitarbeiters, Massenversand) wird mit Datum, Uhrzeit,
     Profil und Mitarbeiter archiviert. Mitarbeiter und Kunden können Archiv-Einträge NICHT löschen.
   - Aufbewahrungsdauer stellt der Chef ein (Standard 10 Jahre, wie gewünscht). Danach wird automatisch
     gelöscht – außer bei einer „Löschsperre“ (z. B. laufender Streit), die pro Kunde in der Kundenkarte gesetzt wird.
   - Export eines Verlaufs als Textdatei mit Prüfsumme (SHA-256) als Nachweis.
   SERVER: Archiv unveränderbar speichern (nur anhängen, keine Updates/Deletes; z. B. Hash-Kette je Nachricht
   oder WORM-Speicher), Zugriffe protokollieren, Löschlauf täglich nach Frist + Löschsperre.
   ===================================================================== */
(() => {
  const T = window.TEAM; if (!T) return;
  const S = NMA.store, esc = NMA.esc, $ = id => document.getElementById(id);
  const YEAR = 365.25 * 864e5;
  const fmt = t => new Date(t).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const h = s => { let x = 0; for (const ch of s) x = (x * 31 + ch.charCodeAt(0)) >>> 0; return x.toString(36); };

  let cfg = Object.assign({ years: 10 }, S.get("archivCfg", {}));
  let arch = S.get("archiv", []);                      /* [{id, cust, pid, profile, d:"c"|"m", x, t, by, mass}] */
  const ids = new Set(arch.map(a => a.id));
  const save = () => { S.set("archiv", arch); S.set("archivCfg", cfg); };
  const push = e => { if (ids.has(e.id)) return false; ids.add(e.id); arch.push(e); return true; };

  /* Antwort im Posteingang: bisherigen Verlauf archivieren (die Antwort kommt über sync aus „Gesendet“) */
  const addConv = (cust, p, hist, reply, by, t0) => {
    if (!p) return;
    const now = Date.now();
    (hist || []).forEach((m, i) => push({ id: "h-" + h(cust + "|" + p.id + "|" + i + "|" + m[1]), cust, pid: p.id, profile: p.name, d: m[0] === "m" ? "m" : "c", x: m[1], t: Math.min(now - 1000 * (hist.length - i), t0 || now), by: m[0] === "m" ? (m[2] ? T.ownerName(m[2]) : "") : "" }));
    sync();                                            /* die Antwort selbst steht schon in „Gesendet“ */
    save();
  };
  /* alles Gesendete (auch Massenversand) übernehmen */
  const sync = () => {
    let ch = false;
    T.sent.forEach(s => { const p = T.profiles.find(x => x.id === s.pid); if (push({ id: "s-" + s.id, cust: s.cust, pid: s.pid, profile: p ? p.name : "?", d: "m", x: s.text, t: s.t, by: s.mass ? "Massenversand A-" + String(s.mass).padStart(3, "0") : T.ownerName(s.by), mass: !!s.mass })) ch = true; });
    if (ch) save();
  };
  /* Frist: ältere Einträge löschen, außer Löschsperre */
  const purge = () => {
    const limit = Date.now() - cfg.years * YEAR, before = arch.length;
    arch = arch.filter(a => a.t >= limit || (T.customers[a.cust] || {}).legalHold);
    if (arch.length !== before) save();
  };

  /* Gesprächsliste für den Reiter „Verläufe“: Demo-Verläufe + Archiv */
  const convs = demo => {
    sync();
    const map = new Map();
    (demo || []).forEach(l => map.set(l.cust + "|" + l.profile, { id: l.id, cust: l.cust, profile: l.profile, msgs: l.msgs.slice(), last: 0, demo: true }));
    arch.slice().sort((a, b) => a.t - b.t).forEach(a => {
      const k = a.cust + "|" + a.profile;
      if (!map.has(k)) map.set(k, { id: "a-" + h(k), cust: a.cust, profile: a.profile, msgs: [], last: 0 });
      const c = map.get(k); c.msgs.push([a.d, a.x, fmt(a.t), a.by || ""]); c.last = Math.max(c.last, a.t);
    });
    return [...map.values()].sort((a, b) => b.last - a.last);
  };

  const exportText = l => {
    const c = T.customers[l.cust] || {};
    return [`Chatverlauf – Nie mehr alleine (Archiv)`, `Kunde: ${l.cust}${c.nr ? " (Kunden-Nr. " + c.nr + ")" : ""}`, `Profil: ${l.profile}`, `Exportiert: ${fmt(Date.now())} durch Admin`, `Aufbewahrung: ${cfg.years} Jahre${c.legalHold ? " · LÖSCHSPERRE aktiv" : ""}`, "".padEnd(60, "-"),
      ...l.msgs.map(m => `[${m[2]}] ${m[0] === "m" ? l.profile + (m[3] ? " (" + m[3] + ")" : "") : l.cust}: ${m[1]}`)].join("\n");
  };
  const sha = async s => { try { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join(""); } catch (e) { return "(nur auf der echten Seite mit https verfügbar)"; } };

  const tools = l => `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px"><button class="btn sm" data-arch-exp="${esc(l.id)}">⬇ Als Datei exportieren</button><button class="btn sm ghost" data-arch-copy="${esc(l.id)}">Kopieren</button>
    ${(T.customers[l.cust] || {}).legalHold ? '<span class="tb-tag" style="margin:0;align-self:center">🔒 Löschsperre</span>' : ""}</div>`;

  document.addEventListener("click", async e => {
    const ex = e.target.closest("[data-arch-exp]"), cp = e.target.closest("[data-arch-copy]");
    if (!ex && !cp) return;
    const l = convs(T.logs).find(x => x.id === (ex || cp).dataset[ex ? "archExp" : "archCopy"]);
    if (!l) { NMA.toast("Verlauf nicht gefunden."); return; }
    const txt = exportText(l), sum = await sha(txt), full = txt + "\n" + "".padEnd(60, "-") + "\nPrüfsumme (SHA-256): " + sum + "\n";
    if (ex) {
      try { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([full], { type: "text/plain;charset=utf-8" })); a.download = `Verlauf_${l.cust}_${l.profile}_${new Date().toISOString().slice(0, 10)}.txt`; document.body.appendChild(a); a.click(); a.remove(); NMA.toast("Verlauf exportiert."); }
      catch (err) { NMA.toast("Download hier nicht möglich – bitte „Kopieren“ nutzen."); }
    } else {
      try { await navigator.clipboard.writeText(full); NMA.toast("Verlauf mit Prüfsumme kopiert."); } catch (err) { NMA.toast("Kopieren nicht möglich."); }
    }
  });

  /* Einstellungen oben im Reiter „Verläufe“ */
  const renderCfg = () => {
    const box = $("archCfg"); if (!box) return;
    const holds = Object.entries(T.customers).filter(([, c]) => c.legalHold).map(([n]) => n);
    const oldest = arch.reduce((m, a) => Math.min(m, a.t), Date.now());
    box.innerHTML = `<div class="card pad" style="margin-bottom:16px;display:grid;gap:10px">
      <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center">
        <div><b>Archiv der Chatverläufe</b><br><small class="muted">${arch.length} archivierte Nachrichten · älteste vom ${fmt(oldest)} · nichts davon kann von Mitarbeitern oder Kunden gelöscht werden</small></div>
        <label class="small">Aufbewahren für <select class="input" id="archYears" style="width:auto;min-height:38px;margin-left:6px">${[3, 6, 8, 10].map(y => `<option value="${y}" ${cfg.years === y ? "selected" : ""}>${y} Jahre</option>`).join("")}</select></label></div>
      <small class="muted">Danach wird automatisch gelöscht – außer bei Kunden mit <b>Löschsperre</b> (setzt du in der Kundenkarte, z. B. bei Streit oder Anwaltsschreiben)${holds.length ? `: aktiv bei ${holds.map(esc).join(", ")}` : ""}. Die Dauer muss in der Datenschutzerklärung stehen – bitte vom Anwalt bestätigen lassen.</small></div>`;
    $("archYears").addEventListener("change", e => {
      const y = +e.target.value;
      const go = () => { cfg.years = y; save(); purge(); renderCfg(); T.renderLogs(); NMA.toast(`Aufbewahrung: ${y} Jahre.`); };
      if (y < cfg.years) NMA.modal({ title: `Auf ${y} Jahre verkürzen?`, text: `Verläufe, die älter als ${y} Jahre sind, werden sofort gelöscht (außer Löschsperre).`, cancel: "Abbrechen", ok: "Verkürzen", onOk: go });
      else go();
      e.target.value = cfg.years;
    });
  };

  purge(); sync();
  new MutationObserver(() => { if (!$("logView").hidden) renderCfg(); }).observe($("logView"), { attributes: true, attributeFilter: ["hidden"] });

  /* Kundenkarte → Verlauf öffnen */
  const openFor = nick => { document.querySelector('[data-tab="logs"]').click(); $("lq").value = nick; T.renderLogs(); NMA.toast("Bitte Admin-Code eingeben – dann siehst du die Verläufe dieses Kunden."); };

  window.ARCH = { addConv, convs, tools, openFor, sync };
})();
