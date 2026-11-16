/* =====================================================================
   SUPPORT – Mitarbeiterbereich (team.html), nur für Admins
   Kunden schreiben kostenlos über „Hilfe & Kontakt“ (hilfe.html).
   Hier beantwortet der Admin die Anfragen und ändert bei Bedarf Nickname oder
   Vorname des Kunden – Kunden selbst können beides nicht ändern.
   Demo: localStorage "support". Server: Tabelle support_tickets, Änderungen protokollieren.
   ===================================================================== */
(() => {
  const T = window.TEAM; if (!T) return;
  const S = NMA.store, esc = NMA.esc, $ = id => document.getElementById(id);
  const TOP = { frage: "Allgemeine Frage", name: "Nickname oder Vorname ändern", coins: "Coins & Zahlung", technik: "Technisches Problem", konto: "Konto löschen", datenschutz: "Datenschutz" };
  const fmt = t => new Date(t).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  /* Demo-Anfragen, damit der Bereich nicht leer ist */
  if (!S.get("support", null)) S.set("support", [
    { id: "t1", nick: "Rolf_Kassel", vorname: "Rolf", topic: "name", wish: "Vorname: Rudolf", msg: "Ich habe mich beim Vornamen vertippt, ich heiße Rudolf.", t: Date.now() - 36e5 * 5, status: "offen", replies: [] },
    { id: "t2", nick: "Wanderfreund", vorname: "Günter", topic: "coins", wish: "", msg: "Ich habe Coins gekauft, aber sie sind noch nicht da.", t: Date.now() - 36e5 * 26, status: "offen", replies: [] }
  ]);

  let filter = "offen", cur = null;
  const all = () => S.get("support", []);
  const saveAll = list => S.set("support", list);

  const css = document.createElement("style");
  css.textContent = `
  .sup{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:20px}
  @media(max-width:900px){.sup{grid-template-columns:1fr}}
  .sup-item{width:100%;display:grid;gap:3px;padding:14px 16px;border:0;border-bottom:1px solid var(--line);background:transparent;text-align:left;cursor:pointer;color:var(--ink);font:inherit}
  .sup-item:hover{background:#ffffff07}.sup-item.on{background:#0f2a2b}
  .sup-item .top{display:flex;justify-content:space-between;gap:8px}.sup-item small{color:var(--muted);font-size:13px}
  .sup-st{font-size:12px;font-weight:700;padding:3px 9px;border-radius:20px;background:#2a2112;color:#f6d79f}.sup-st.erledigt{background:#123a2a;color:#9be8bf}
  .sup-msg{padding:12px 14px;border-radius:12px;background:var(--card-2);white-space:pre-wrap;margin:10px 0}
  .sup-ans{padding:10px 12px;border-radius:12px;background:#0d5f5a;margin:8px 0;white-space:pre-wrap}
  .sup-box{padding:14px;border:1px solid var(--line);border-radius:12px;margin:14px 0}
  `;
  document.head.appendChild(css);

  const badge = () => { const n = all().filter(t => t.status === "offen").length; const b = $("supBadge"); if (b) { b.textContent = n; b.hidden = !n; } };

  const render = () => {
    badge();
    const sec = $("support"); if (!sec) return;
    if (!T.isAdmin()) { sec.innerHTML = ""; return; }
    const list = all().filter(t => filter === "alle" || t.status === filter).sort((a, b) => b.t - a.t);
    const t = all().find(x => x.id === cur);
    sec.innerHTML = `<div class="toolbar"><div class="chips" id="supF" style="padding:0">
        ${[["offen", "Offen"], ["erledigt", "Erledigt"], ["alle", "Alle"]].map(([v, l]) => `<button class="chip ${filter === v ? "on" : ""}" data-f="${v}">${l}</button>`).join("")}</div>
        <span class="hint">Support-Nachrichten sind für Kunden kostenlos.</span></div>
      <div class="sup"><div class="card" style="overflow:hidden">${list.length ? list.map(x => `<button class="sup-item ${x.id === cur ? "on" : ""}" data-t="${x.id}"><span class="top"><b>${esc(x.nick)}</b><span class="sup-st ${x.status}">${x.status}</span></span><small>${esc(TOP[x.topic] || x.topic)} · ${fmt(x.t)}</small><small>${esc(x.msg.slice(0, 70))}${x.msg.length > 70 ? " …" : ""}</small></button>`).join("") : '<p class="empty">Keine Anfragen.</p>'}</div>
      <div class="card pad">${t ? detail(t) : '<p class="empty">Anfrage links auswählen.</p>'}</div></div>`;
    $("supF").addEventListener("click", e => { const b = e.target.closest("[data-f]"); if (b) { filter = b.dataset.f; render(); } });
    sec.querySelectorAll("[data-t]").forEach(b => b.addEventListener("click", () => { cur = b.dataset.t; render(); }));
    if (t) bind(t);
  };

  const detail = t => {
    const c = T.customers[t.nick] || {};
    return `<h3 style="font-size:22px">${esc(TOP[t.topic] || t.topic)}</h3>
      <small class="muted">von <b>${esc(t.nick)}</b>${c.nr ? " · Kunden-Nr. #" + c.nr : ""} · ${fmt(t.t)}</small>
      <div class="sup-msg">${esc(t.msg)}${t.wish ? `<br><br><b>Gewünscht:</b> ${esc(t.wish)}` : ""}</div>
      ${(t.replies || []).map(r => `<div class="sup-ans"><small style="color:#bfe0dc">${esc(r.by)} · ${fmt(r.t)}</small><br>${esc(r.text)}</div>`).join("")}
      <div class="sup-box"><b>Name des Kunden ändern</b><p class="hint" style="margin:4px 0 10px">Nur der Admin kann Nickname und Vorname ändern. Jeder Nickname existiert nur einmal, ohne Leerzeichen.</p>
        <div class="form-grid"><div class="field"><label for="supNick">Nickname</label><input class="input" id="supNick" maxlength="30" value="${esc(t.nick)}"></div>
        <div class="field"><label for="supVn">Vorname</label><input class="input" id="supVn" maxlength="30" value="${esc(c.vorname || t.vorname || "")}"></div></div>
        <button class="btn sm" id="supName">Namen speichern</button></div>
      <div class="field"><label for="supReply">Antwort an den Kunden</label><textarea class="input" id="supReply" rows="3"></textarea></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" id="supSend">Antworten</button>
        <button class="btn ghost" id="supDone">${t.status === "offen" ? "Als erledigt markieren" : "Wieder öffnen"}</button></div>`;
  };

  const bind = t => {
    const upd = fn => { const list = all(); const x = list.find(y => y.id === t.id); fn(x, list); saveAll(list); render(); };
    $("supSend").addEventListener("click", () => {
      const text = $("supReply").value.trim(); if (text.length < 2) { NMA.toast("Bitte eine Antwort schreiben."); return; }
      upd(x => { (x.replies = x.replies || []).push({ by: "Support", text, t: Date.now() }); x.status = "erledigt"; });
      NMA.toast("Antwort gesendet – der Kunde sieht sie unter „Hilfe & Kontakt“.");
    });
    $("supDone").addEventListener("click", () => upd(x => { x.status = x.status === "offen" ? "erledigt" : "offen"; }));
    $("supName").addEventListener("click", () => {
      const nn = $("supNick").value.trim(), vn = $("supVn").value.replace(/\s+/g, " ").trim();
      if (!NMA.nickOk(nn)) { NMA.toast("Nickname: 3–30 Zeichen, keine Leerzeichen (nur Buchstaben, Ziffern, _ - .)."); return; }
      if (!/^[\p{L}][\p{L}' -]*[\p{L}]$/u.test(vn)) { NMA.toast("Der Vorname braucht mindestens 2 Buchstaben."); return; }
      const old = t.nick, changed = nn.toLowerCase() !== old.toLowerCase();
      if (changed && (!NMA.nickFree(nn) || Object.keys(T.customers).some(k => k.toLowerCase() === nn.toLowerCase()) || T.profiles.some(p => p.name.toLowerCase() === nn.toLowerCase()))) { NMA.toast(`„${nn}“ ist schon vergeben.`); return; }
      /* Kundendaten im Mitarbeiterbereich */
      const c = T.customers[old] || {}; c.vorname = vn;
      if (changed) { delete T.customers[old]; T.customers[nn] = c; T.items.forEach(i => { if (i.cust === old) i.cust = nn; }); T.sent.forEach(i => { if (i.cust === old) i.cust = nn; }); }
      else T.customers[old] = c;
      T.saveAll();
      /* Demo: wenn es der angemeldete Test-Kunde ist, auch dessen Konto ändern */
      const u = NMA.user(); if (u.nick === old) S.set("user", Object.assign(u, { nick: nn, vorname: vn }));
      upd((x, list) => { list.forEach(y => { if (y.nick === old) y.nick = nn; }); x.vorname = vn; (x.replies = x.replies || []).push({ by: "Support", text: `Erledigt: Nickname „${nn}“, Vorname „${vn}“.`, t: Date.now() }); x.status = "erledigt"; });
      T.renderQueue(); NMA.toast("Name geändert.");
    });
  };

  addEventListener("storage", e => { if (e.key === "nma_support") render(); });
  setInterval(badge, 20000);
  window.SUP = { render };
  render();
})();
