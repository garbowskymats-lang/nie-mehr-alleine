/* =====================================================================
   MASSENVERSAND – Mitarbeiterbereich (team.html)
   Demo: alles läuft im Browser (localStorage). Für den echten Betrieb muss
   der Server die Empfänger berechnen, die Rechte prüfen und versenden.

   Ablauf
   1. Zielgruppe wählen   2. Text/Vorlage   3. Empfänger & Umkreis   4. Vorschau → senden
   - Für jeden Empfänger sucht das System das NÄCHSTGELEGENE passende Profil
     (nach PLZ), das diesen Kunden noch nie angeschrieben hat.
   - Rechte pro Mitarbeiter (nur der Chef stellt das ein):
       aus        = darf keinen Massenversand
       kontrolle  = darf vorbereiten, der Chef muss jede Aussendung freigeben
       frei       = darf selbst senden
   - Moderatoren schreiben nur mit ihren eigenen Profilen, der Chef mit allen.
     Antworten landen wie gewohnt beim Mitarbeiter, dem das Profil gehört.
   - Pause pro Kunde (Chef-Einstellung): Kunde bekommt höchstens 1 Massennachricht
     in diesem Zeitraum. Dieselbe Massenvorlage geht nie zweimal an denselben Kunden.
   ===================================================================== */
(() => {
  const T = window.TEAM; if (!T) return;
  const S = NMA.store, esc = NMA.esc, $ = id => document.getElementById(id);
  const DAY = 864e5;

  /* ---------- Zielgruppen (früher WAA / WAB / WABF / WA-Testmitglied) ---------- */
  const GROUPS = [
    { id: "abenteuer-m", name: "Abenteuer · Männer", icon: "🔥",
      desc: "Männer, die ein Abenteuer suchen. Es schreiben Frauen-Profile aus der Rubrik Abenteuer.",
      tip: "Text für einen Mann schreiben, der ein Abenteuer sucht.",
      who: c => c.sex === "m" && c.look === "Abenteuer", from: () => ({ sex: "w", looking: "Abenteuer" }) },
    { id: "beziehung-fm", name: "Beziehung · Frau sucht Mann", icon: "💞",
      desc: "Männer, die eine Beziehung suchen. Es schreiben Frauen-Profile aus der Rubrik Beziehung.",
      tip: "Text aus Sicht einer Frau an einen Mann, der eine feste Beziehung sucht.",
      who: c => c.sex === "m" && c.look === "Beziehung", from: () => ({ sex: "w", looking: "Beziehung" }) },
    { id: "beziehung-mf", name: "Beziehung · Mann sucht Frau", icon: "🌹",
      desc: "Frauen, die eine Beziehung suchen. Es schreiben Männer-Profile aus der Rubrik Beziehung.",
      tip: "Text aus Sicht eines Mannes an eine Frau, die eine feste Beziehung sucht.",
      who: c => c.sex === "w" && c.look === "Beziehung", from: () => ({ sex: "m", looking: "Beziehung" }) },
    { id: "tester", name: "Testmitglieder", icon: "🆕", fixedSt: true,
      desc: "Alle Registrierten, die noch nie gekauft haben – Mann oder Frau. Es schreibt das andere Geschlecht, passend zur gesuchten Rubrik.",
      tip: "Allgemeiner Text, der für Männer und Frauen passt.",
      who: c => c.st === "T", from: c => ({ sex: c.sex === "w" ? "m" : "w", looking: c.look || null }) }
  ];
  const grp = id => GROUPS.find(g => g.id === id) || GROUPS[0];
  const PERM = { aus: "Nicht erlaubt", kontrolle: "Mit Kontrolle durch den Chef", frei: "Selbstständig" };

  /* Orte & Entfernungen kommen aus app.js (NMA.geoOf, NMA.km, NMA.kontaktOrt) */
  const geo = NMA.geoOf, km = NMA.km;
  const custPlz = c => (String(c.ort || "").match(/\d{4,5}/) || [])[0];
  const custCity = c => String(c.ort || "").replace(/\d{4,5}/, "").trim();
  const custLand = c => c.land || "DE";

  /* ---------- Demo-Kunden ergänzen (Geschlecht + ein paar mehr für die Vorschau) ---------- */
  {
    const extra = {
      "Heidi_HH":            { nr: 10544, st: "T", age: 59, ort: "22041 Hamburg",     job: "Friseurin",   coins: 5,  since: "10.11.2026", look: "Beziehung", sex: "w" },
      "Rosi_Celle":      { nr: 10322, st: "K", age: 64, ort: "29221 Celle",       job: "Rentnerin",   coins: 31, since: "04.10.2026", look: "Beziehung", sex: "w" },
      "Gisela60":            { nr: 10561, st: "T", age: 60, ort: "23552 Lübeck",      job: "Verkäuferin", coins: 5,  since: "14.11.2026", look: "Beziehung", sex: "w" },
      "SeebärUwe":          { nr: 10498, st: "T", age: 62, ort: "21680 Stade",       job: "Kapitän a. D.", coins: 5, since: "11.11.2026", look: "Abenteuer", sex: "m" },
      "Jens_N":              { nr: 10276, st: "K", age: 54, ort: "22846 Norderstedt", job: "Mechaniker",  coins: 64, since: "29.09.2026", look: "Abenteuer", sex: "m" },
      "Hafenkapitän":        { nr: 10533, st: "T", age: 66, ort: "20457 Hamburg",     job: "Rentner",     coins: 5,  since: "13.11.2026", look: "Beziehung", sex: "m" },
      "KlausL":            { nr: 10467, st: "T", age: 58, ort: "21335 Lüneburg",    job: "Koch",        coins: 9,  since: "07.11.2026", look: "Beziehung", sex: "m" },
      "Peter_Pinneberg": { nr: 10301, st: "K", age: 61, ort: "25421 Pinneberg",   job: "Maler",       coins: 17, since: "01.10.2026", look: "Abenteuer", sex: "m" },
      "Norbert65":           { nr: 10552, st: "T", age: 65, ort: "25335 Elmshorn",    job: "",            coins: 5,  since: "15.11.2026", look: "Abenteuer", sex: "m" },
      "Wiener_Franz":        { nr: 10570, st: "T", age: 63, ort: "1100 Wien",         land: "AT", job: "Straßenbahnfahrer", coins: 5, since: "14.11.2026", look: "Beziehung", sex: "m", vorname: "Franz" },
      "Tiroler_Sepp":        { nr: 10571, st: "T", age: 58, ort: "6020 Innsbruck",    land: "AT", job: "Skilehrer", coins: 5, since: "15.11.2026", look: "Abenteuer", sex: "m", vorname: "Josef" },
      "Grazerin_Maria":      { nr: 10572, st: "K", age: 61, ort: "8010 Graz",         land: "AT", job: "Apothekerin", coins: 26, since: "20.10.2026", look: "Beziehung", sex: "w", vorname: "Maria" },
      "Ruedi_ZH":            { nr: 10573, st: "T", age: 60, ort: "8004 Zürich",       land: "CH", job: "Banker", coins: 5, since: "13.11.2026", look: "Abenteuer", sex: "m", vorname: "Rudolf" },
      "Berner_Hans":         { nr: 10574, st: "K", age: 66, ort: "3011 Bern",         land: "CH", job: "Rentner", coins: 40, since: "05.10.2026", look: "Beziehung", sex: "m", vorname: "Hans" },
      "DieterK":           { nr: 10489, st: "T", age: 57, ort: "24103 Kiel",        job: "Hausmeister", coins: 5,  since: "09.11.2026", look: "Beziehung", sex: "m" }
    };
    let ch = false;
    Object.entries(extra).forEach(([n, c]) => { if (!T.customers[n]) { T.customers[n] = c; ch = true; } });
    const vn = { "MichaelNordlicht": "Michael", "Sonnenschein63": "Werner", "Rolf_Kassel": "Rolf", "Wanderfreund": "Günter", "Berti_K": "Bertram", "Kalle58": "Karl",
      "Heidi_HH": "Heidi", "Rosi_Celle": "Rosemarie", "Gisela60": "Gisela", "SeebärUwe": "Uwe", "Jens_N": "Jens", "Hafenkapitän": "Horst", "KlausL": "Klaus",
      "Peter_Pinneberg": "Peter", "Norbert65": "Norbert", "DieterK": "Dieter" };
    Object.entries(T.customers).forEach(([n, c]) => { if (!c.sex) { c.sex = "m"; ch = true; } if (!c.vorname && vn[n]) { c.vorname = vn[n]; ch = true; } });
    /* angemeldeter Demo-Kunde (Kundenseite) */
    const u = NMA.user();
    if (u && u.nick) {
      const c = T.customers[u.nick] || (T.customers[u.nick] = { nr: 10600, st: "T", coins: NMA.coins(), since: new Date().toLocaleDateString("de-DE") });
      Object.assign(c, { vorname: u.vorname || c.vorname, age: u.age || c.age, job: u.job || c.job || "", look: u.looking || c.look || "Beziehung", radius: +u.radius || 50,
        mail: u.mail || c.mail, birth: u.birth || c.birth, reg: u.registered || c.reg, lastLogin: u.lastLogin || c.lastLogin, coins: NMA.coins(),
        buchungen: NMA.store.get("buchungen", c.buchungen || []),
        sex: /^eine Frau/.test(u.sex || "") ? "w" : "m", land: u.land || "DE", ort: ((u.plz || "") + " " + (u.city || "")).trim() || c.ort });
      if (c.buchungen.length) { c.st = "K"; c.firstPay = c.firstPay || c.buchungen[0].t; }
      ch = true;
    }
    if (ch) T.saveAll();
  }

  /* ---------- Speicher ---------- */
  let cfg   = Object.assign({ radius: 50, fallback: true, pause: 1, wohnort: "kontakt" }, S.get("mvCfg", {}));
  const kontakt = () => cfg.wohnort !== "fest";
  const custRef = (nick, c) => ({ nick, plz: custPlz(c), radius: c.radius || 50, city: custCity(c), land: custLand(c) });
  let tpls  = S.get("mvTpls", null) || [
    { nr: 1, group: "abenteuer-m",  owner: "chef",  name: "Neugierig",       text: "Hallo {vorname}, dein Profil ist mir gerade aufgefallen 😊 Ich wohne gar nicht weit weg und bin für ein kleines Abenteuer immer zu haben. Schreibst du mir?" },
    { nr: 2, group: "beziehung-fm", owner: "chef",  name: "Sonntagsfrage",   text: "Hallo {vorname}, ich bin {profil} aus {ort}. Ich suche jemanden für gemütliche Sonntage und ehrliche Gespräche – vielleicht ja dich?" },
    { nr: 3, group: "beziehung-mf", owner: "chef",  name: "Kaffee",          text: "Hallo {name}, ich habe dein Profil gelesen und musste lächeln. Wie wäre es mit einem virtuellen Kaffee und ein paar Zeilen?" },
    { nr: 4, group: "tester",       owner: "marco", name: "Willkommen",      text: "Hallo {vorname}, schön, dass du neu hier bist! Ich bin {profil} und würde mich freuen, dich ein bisschen kennenzulernen." }
  ];
  let jobs  = S.get("mvJobs", []);
  let msent = S.get("mvSent", {});           /* Kunde → [{pid, t, job, tpl}] */
  const save = () => { S.set("mvCfg", cfg); S.set("mvTpls", tpls); S.set("mvJobs", jobs); S.set("mvSent", msent); };
  const mNo = n => "M-" + String(n).padStart(3, "0");
  const aNo = n => "A-" + String(n).padStart(3, "0");
  const fmt = t => new Date(t).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  /* ---------- Rechte ---------- */
  const permOf = user => { const s = T.staff.find(x => x.user === user); return !s || !s.active ? "aus" : s.role === "Admin" ? "frei" : (s.mass || "aus"); };
  const myPerm = () => T.isAdmin() ? "frei" : permOf(T.me);
  const allowed = () => myPerm() !== "aus";
  const visTpl = t => T.isAdmin() || t.owner === T.meKey() || t.owner === "chef";
  const canEditTpl = t => T.isAdmin() || t.owner === T.meKey();

  /* ---------- Empfänger + Profil-Zuordnung berechnen ---------- */
  const fill = (text, nick, p, c, ort) => text.replace(/\{vorname\}/g, (c && c.vorname) || nick).replace(/\{name\}/g, nick).replace(/\{profil\}/g, p.name).replace(/\{ort\}/g, ort || p.city || "");
  const contacted = () => {              /* Kunde → Set(Profil-IDs), die schon Kontakt hatten */
    const m = {}; const add = (c, p) => (m[c] = m[c] || new Set()).add(p);
    Object.entries(msent).forEach(([c, a]) => a.forEach(x => add(c, x.pid)));
    T.sent.forEach(x => add(x.cust, x.pid));
    T.items.forEach(x => { if (x.hist && x.hist.some(h => h[0] === "m")) add(x.cust, x.pid); });
    return m;
  };
  const plan = job => {
    const G = grp(job.group), byKey = job.by === "chef" ? "chef" : job.by;
    const pool = T.profiles.filter(p => byKey === "chef" || p.owner === byKey);
    const done = contacted(), now = Date.now(), pauseMs = (+cfg.pause || 0) * DAY;
    const rows = [], skip = [], load = {};
    Object.entries(T.customers).forEach(([nick, c]) => {
      if (!G.who(c)) return;
      if (!G.fixedSt && job.st && c.st !== job.st) return;
      if (c.noMass) { skip.push({ nick, c, why: "möchte keine Massennachrichten (Kundenkarte)" }); return; }
      if (c.gesperrt) { skip.push({ nick, c, why: "Konto gesperrt" }); return; }
      const hist = msent[nick] || [];
      const last = hist.reduce((a, x) => Math.max(a, x.t), 0);
      if (pauseMs && last && now - last < pauseMs) { skip.push({ nick, c, why: `hatte am ${fmt(last)} schon eine Massennachricht (Pause ${cfg.pause} Tag${cfg.pause == 1 ? "" : "e"})` }); return; }
      if (job.tpl && hist.some(x => x.tpl === job.tpl)) { skip.push({ nick, c, why: `hat ${mNo(job.tpl)} schon bekommen` }); return; }
      const cg = geo(custPlz(c), custCity(c), custLand(c));
      if (!cg) { skip.push({ nick, c, why: "PLZ unbekannt" }); return; }
      const f = G.from(c), had = done[nick] || new Set();
      const fit = pool.filter(p => p.sex === f.sex && (!f.looking || p.looking === f.looking) && !had.has(p.id));
      if (!fit.length) { skip.push({ nick, c, why: pool.length ? "alle passenden Profile hatten schon Kontakt" : "keine passenden Profile" }); return; }
      if (kontakt()) {
        /* Profil wohnt für diesen Kunden in seinem Umkreis – gleichmäßig auf die Profile verteilen */
        const ref = custRef(nick, c);
        const pick = fit.map(p => ({ p, k: NMA.kontaktOrt(p, ref, true) })).filter(x => x.k)
          .sort((a, b) => (load[a.p.id] || 0) - (load[b.p.id] || 0) || a.k.km - b.k.km)[0];
        if (!pick) { skip.push({ nick, c, why: "PLZ unbekannt" }); return; }
        load[pick.p.id] = (load[pick.p.id] || 0) + 1;
        rows.push({ nick, c, p: pick.p, d: pick.k.km, ort: pick.k.ort, far: false });
        return;
      }
      const cands = fit.filter(p => (p.land || "DE") === custLand(c)).map(p => ({ p, d: km(cg, geo(p.plz, p.city, p.land || "DE")) })).filter(x => x.d !== null).sort((a, b) => a.d - b.d);
      if (!cands.length) { skip.push({ nick, c, why: "keine Profile mit bekanntem Ort" }); return; }
      let pick = cands.find(x => x.d <= job.radius);
      if (!pick) {
        if (job.fallback) pick = cands[0];
        else { skip.push({ nick, c, why: `kein freies Profil im Umkreis von ${job.radius} km (nächstes: ${cands[0].d} km)` }); return; }
      }
      rows.push({ nick, c, p: pick.p, d: pick.d, ort: pick.p.city, far: pick.d > job.radius });
    });
    rows.sort((a, b) => a.d - b.d);
    return { rows, skip };
  };
  const execute = job => {
    const { rows, skip } = plan(job), t = Date.now();
    const me = NMA.user().nick, inbox = S.get("custMsgs", []);
    rows.forEach((r, i) => {
      if (kontakt()) NMA.kontaktOrt(r.p, custRef(r.nick, r.c));      /* Ort jetzt fest für dieses Paar */
      if (r.nick === me) inbox.push({ to: me, pid: r.p.id, text: fill(job.text, r.nick, r.p, r.c, r.ort), t, read: false });
      (msent[r.nick] = msent[r.nick] || []).push({ pid: r.p.id, t, job: job.nr, tpl: job.tpl || null });
      T.sent.push({ id: "m" + t + "_" + i, cust: r.nick, pid: r.p.id, text: fill(job.text, r.nick, r.p, r.c, r.ort), t, by: job.by, tpl: null, mass: job.nr });
    });
    S.set("custMsgs", inbox);
    job.status = "gesendet"; job.sentAt = t; job.result = { sent: rows.length, skipped: skip.length, profiles: new Set(rows.map(r => r.p.id)).size };
    save(); T.saveAll(); T.renderQueue();
    return rows.length;
  };

  /* ---------- Oberfläche ---------- */
  const css = document.createElement("style");
  css.textContent = `
  .mv-top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px}
  .mv-top .chips{padding:0}
  .mv-perm{font-size:13px;padding:6px 12px;border-radius:20px;background:#10292a;color:#bdf3ee}
  .mv-perm.kontrolle{background:#2a2112;color:#f6d79f}
  .mv-steps{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;font-size:13px}
  .mv-steps span{padding:6px 12px;border-radius:20px;border:1px solid var(--line);color:var(--muted)}
  .mv-steps span.on{border-color:var(--accent);color:var(--accent);font-weight:700}
  .mv-steps span.ok{color:var(--ink)}
  .mv-groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px}
  .mv-g{padding:18px;text-align:left;cursor:pointer;display:grid;gap:8px;color:var(--ink);font:inherit}
  .mv-g:hover{border-color:#2d5a5a}.mv-g.on{border-color:var(--accent);background:#0f2a2b}
  .mv-g b{font-size:18px}.mv-g small{color:var(--muted);font-size:14px;line-height:1.4}
  .mv-g .cnt{font-size:13px;color:var(--accent);font-weight:700}
  .mv-tpls{display:grid;gap:10px;margin-bottom:16px}
  .mv-t{display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:start;padding:12px 14px;border:1px solid var(--line);border-radius:12px;cursor:pointer}
  .mv-t:has(input:checked){border-color:var(--accent);background:#0f2a2b}
  .mv-t input{margin-top:4px;accent-color:var(--accent)}
  .mv-t p{margin:4px 0 0;color:#cfe3e1;font-size:14px}
  .mv-ph{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 4px}
  .mv-ph button{min-height:30px;padding:0 10px;border-radius:8px;border:1px solid var(--line);background:transparent;color:var(--ink);cursor:pointer;font-size:13px}
  .mv-warn{padding:12px 14px;border-radius:12px;background:#2a1714;color:#ffc2b8;font-size:14px;margin:0 0 14px}
  .mv-info{padding:12px 14px;border-radius:12px;background:#10292a;color:#bdf3ee;font-size:14px;margin:0 0 14px}
  .mv-nav{display:flex;gap:8px;justify-content:space-between;flex-wrap:wrap;margin-top:18px}
  .mv-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:16px}
  .mv-kpis .card{padding:14px 16px}.mv-kpis small{color:var(--muted);font-size:13px}.mv-kpis strong{display:block;font:700 28px/1.1 var(--serif)}
  table.mv{width:100%;border-collapse:collapse;font-size:14px}
  .mv th{text-align:left;color:var(--muted);font-weight:600;font-size:12px;padding:8px 10px;border-bottom:1px solid var(--line)}
  .mv td{padding:9px 10px;border-bottom:1px solid var(--line);vertical-align:top}
  .mv td.num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
  .mv .far{color:var(--gold)}
  .mv-prev{margin:0 0 16px;padding:12px 14px;border-radius:14px;background:#0d5f5a;max-width:520px;font-size:15px}
  .mv-prev small{display:block;color:#bfe0dc;font-size:12px;margin-bottom:3px}
  details.mv-skip{margin-top:14px}details.mv-skip summary{cursor:pointer;color:var(--muted);font-size:14px}
  .mv-job{padding:16px 0;border-bottom:1px solid var(--line)}.mv-job:last-child{border-bottom:0}
  .mv-job .top{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .mv-job p{margin:8px 0;color:#cfe3e1;font-size:14px;white-space:pre-wrap}
  .mv-st{font-size:12px;font-weight:700;padding:3px 9px;border-radius:20px;background:#10292a;color:#bdf3ee}
  .mv-st.wartet{background:#2a2112;color:#f6d79f}.mv-st.abgelehnt{background:#2a1714;color:#ffc2b8}.mv-st.gesendet{background:#123a2a;color:#9be8bf}
  .mv-acts{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
  .mv-perms td select{min-height:38px;font-size:14px}
  @media(max-width:700px){.mv-kpis{grid-template-columns:1fr 1fr 1fr}.mv-kpis strong{font-size:22px}.mv .hide-sm{display:none}}
  `;
  document.head.appendChild(css);

  let view = "new";
  let W = null;                                  /* Assistent: {step, group, tpl, text, saveTpl, tplName, st, radius, fallback} */
  const resetW = () => { W = { step: 1, group: null, tpl: null, text: "", saveTpl: false, tplName: "", st: "", radius: +cfg.radius || 50, fallback: !!cfg.fallback }; };
  resetW();

  const pendingFor = () => jobs.filter(j => j.status === "wartet" && (T.isAdmin() || j.by === T.meKey()));
  const stBadge = c => `<span class="kst ${c.st === "K" ? "k" : "t"}" title="${c.st === "K" ? "Kunde – hat bezahlt" : "Testmitglied – hat noch nie gekauft"}">${c.st}</span>`;
  const draftJob = () => ({ group: W.group, text: W.text, tpl: W.tpl, st: W.st, radius: W.radius, fallback: W.fallback, by: T.meKey() });

  const render = () => {
    const tab = $("tabMass"), sec = $("mass"); if (!tab || !sec) return;
    const ok = allowed();
    tab.hidden = !ok;
    const pend = jobs.filter(j => j.status === "wartet").length;
    $("mvBadge").textContent = pend; $("mvBadge").hidden = !(T.isAdmin() && pend);
    if (!ok) { if (tab.classList.contains("on")) document.querySelector('[data-tab="inbox"]').click(); sec.innerHTML = ""; return; }
    if (view === "settings" && !T.isAdmin()) view = "new";
    const p = myPerm(), np = pendingFor().length;
    sec.innerHTML = `<div class="mv-top">
        <div class="chips" id="mvNav">
          <button class="chip ${view === "new" ? "on" : ""}" data-v="new">Neue Aussendung</button>
          <button class="chip ${view === "tpls" ? "on" : ""}" data-v="tpls">Massenvorlagen</button>
          <button class="chip ${view === "pending" ? "on" : ""}" data-v="pending">${T.isAdmin() ? "Freigaben" : "Wartet auf Freigabe"} ${np ? `<b>${np}</b>` : ""}</button>
          <button class="chip ${view === "log" ? "on" : ""}" data-v="log">Verlauf</button>
          ${T.isAdmin() ? `<button class="chip ${view === "settings" ? "on" : ""}" data-v="settings">⚙ Rechte &amp; Regeln</button>` : ""}
        </div>
        <span class="mv-perm ${p}">${T.isAdmin() ? "Chef: darf alles, sieht alle Profile" : p === "frei" ? "Du darfst selbst senden" : "Deine Aussendungen prüft erst der Chef"}</span>
      </div><div id="mvBody"></div>`;
    $("mvNav").addEventListener("click", e => { const b = e.target.closest("[data-v]"); if (b) { view = b.dataset.v; render(); } });
    ({ new: viewNew, tpls: viewTpls, pending: viewPending, log: viewLog, settings: viewSettings })[view]($("mvBody"));
  };

  /* ===== 1–4: Neue Aussendung ===== */
  const viewNew = el => {
    const steps = ["Zielgruppe", "Text", "Empfänger", "Vorschau & Senden"];
    const head = `<div class="mv-steps">${steps.map((s, i) => `<span class="${W.step === i + 1 ? "on" : W.step > i + 1 ? "ok" : ""}">${W.step > i + 1 ? "✓" : (i + 1) + "."} ${s}</span>`).join("")}</div>`;
    const G = W.group && grp(W.group);

    if (W.step === 1) {
      el.innerHTML = head + `<div class="mv-groups">${GROUPS.map(g => {
        const all = Object.values(T.customers).filter(g.who), t = all.filter(c => c.st === "T").length;
        return `<button class="card mv-g ${W.group === g.id ? "on" : ""}" data-g="${g.id}"><b>${g.icon} ${g.name}</b><small>${g.desc}</small><span class="cnt">${all.length} Empfänger · ${t} Test / ${all.length - t} zahlend</span></button>`;
      }).join("")}</div>`;
      el.querySelectorAll("[data-g]").forEach(b => b.addEventListener("click", () => {
        if (W.group !== b.dataset.g) { W.tpl = null; W.text = ""; }
        W.group = b.dataset.g; W.step = 2; render();
      }));
      return;
    }

    if (W.step === 2) {
      const list = tpls.filter(t => t.group === W.group && visTpl(t));
      if (!W.tpl && !W.text && list.length) { W.tpl = list[0].nr; W.text = list[0].text; }
      el.innerHTML = head + `<div class="card pad">
        <h2 style="font-size:22px;margin-bottom:4px">${G.icon} ${G.name}</h2><p class="hint" style="margin:0 0 14px">${G.tip}</p>
        ${list.length ? `<div class="mv-tpls">${list.map(t => `<label class="mv-t"><input type="radio" name="mvT" value="${t.nr}" ${W.tpl === t.nr ? "checked" : ""}><span><b>${mNo(t.nr)} · ${esc(t.name || "Vorlage")}</b> <small class="muted">· ${esc(T.ownerName(t.owner))}</small><p>${esc(t.text)}</p></span></label>`).join("")}
          <label class="mv-t"><input type="radio" name="mvT" value="" ${!W.tpl ? "checked" : ""}><span><b>Eigenen Text schreiben</b></span></label></div>`
          : `<p class="mv-warn">Für diese Zielgruppe ist noch keine Massenvorlage hinterlegt. Schreib unten einen Text – du kannst ihn gleich als Vorlage speichern.</p>`}
        <div class="field"><label for="mvText">Text</label>
          <div class="mv-ph"><span class="hint">Platzhalter einfügen:</span><button type="button" data-ph="{vorname}">{vorname} = Vorname des Kunden</button><button type="button" data-ph="{name}">{name} = Nickname des Kunden</button><button type="button" data-ph="{profil}">{profil} = Profilname</button><button type="button" data-ph="{ort}">{ort} = Wohnort des Profils (für diesen Kunden)</button></div>
          <textarea class="input" id="mvText" rows="5" placeholder="Hallo {name}, …">${esc(W.text)}</textarea><span class="hint" id="mvLen"></span></div>
        <label class="small" style="display:flex;gap:8px;align-items:center" id="mvSaveRow"><input type="checkbox" id="mvSaveTpl" ${W.saveTpl ? "checked" : ""}> Als Massenvorlage speichern <input class="input" id="mvTplName" maxlength="40" placeholder="Kurzname" value="${esc(W.tplName)}" style="max-width:220px;min-height:38px"></label>
        <div class="mv-nav"><button class="btn ghost" data-back>Zurück</button><button class="btn primary" data-next>Weiter</button></div></div>`;
      const ta = $("mvText"), upd = () => { $("mvLen").textContent = ta.value.length + " Zeichen"; $("mvSaveRow").hidden = !!W.tpl; };
      el.querySelectorAll("input[name=mvT]").forEach(r => r.addEventListener("change", () => {
        W.tpl = r.value ? +r.value : null; const t = tpls.find(x => x.nr === W.tpl); if (t) ta.value = t.text; else if (!r.value) ta.value = ""; W.text = ta.value; upd();
      }));
      ta.addEventListener("input", () => { W.text = ta.value; const t = tpls.find(x => x.nr === W.tpl); if (t && ta.value.trim() !== t.text) { W.tpl = null; el.querySelector('input[name=mvT][value=""]') && (el.querySelector('input[name=mvT][value=""]').checked = true); } upd(); });
      el.querySelectorAll("[data-ph]").forEach(b => b.addEventListener("click", () => {
        const s = ta.selectionStart ?? ta.value.length; ta.value = ta.value.slice(0, s) + b.dataset.ph + ta.value.slice(ta.selectionEnd ?? s); ta.focus(); ta.dispatchEvent(new Event("input"));
      }));
      upd();
      el.querySelector("[data-back]").addEventListener("click", () => { W.step = 1; render(); });
      el.querySelector("[data-next]").addEventListener("click", () => {
        W.text = ta.value.trim(); W.saveTpl = $("mvSaveTpl").checked; W.tplName = $("mvTplName").value.trim();
        if (W.text.length < 10) { NMA.toast("Kein Text hinterlegt – bitte eine Vorlage wählen oder mind. 10 Zeichen schreiben."); return; }
        if (!W.tpl && W.saveTpl) {
          const nr = Math.max(0, ...tpls.map(t => t.nr)) + 1;
          tpls.push({ nr, group: W.group, owner: T.meKey(), name: W.tplName, text: W.text }); W.tpl = nr; W.saveTpl = false; save();
          NMA.toast(`Massenvorlage ${mNo(nr)} gespeichert.`);
        }
        W.step = 3; render();
      });
      return;
    }

    if (W.step === 3) {
      const mine = T.isAdmin() ? T.profiles : T.profiles.filter(p => p.owner === T.meKey());
      el.innerHTML = head + `<div class="card pad">
        <h2 style="font-size:22px;margin-bottom:12px">Empfänger &amp; Profile</h2>
        ${G.fixedSt ? `<p class="mv-info">Es gehen nur Nachrichten an Testmitglieder (registriert, noch nie gekauft).</p>` : `
        <div class="field"><span class="label">Wer soll die Nachricht bekommen?</span>
          <div class="seg" style="grid-template-columns:repeat(3,1fr)"><label><input type="radio" name="mvSt" value="" ${!W.st ? "checked" : ""}> Alle</label><label><input type="radio" name="mvSt" value="T" ${W.st === "T" ? "checked" : ""}> Nur Testmitglieder</label><label><input type="radio" name="mvSt" value="K" ${W.st === "K" ? "checked" : ""}> Nur zahlende Kunden</label></div></div>`}
        ${kontakt() ? `<p class="mv-info"><b>Wohnort der Profile:</b> Jedes Profil wohnt für den jeweiligen Kunden in dessen Umkreis (laut seiner Angabe bei der Registrierung) und bleibt dort für ihn. Es schreiben Profile, die den Kunden noch nie angeschrieben haben – gleichmäßig verteilt.</p>` : `<div class="form-grid">
          <div class="field"><label for="mvRad">Umkreis um den Kunden</label><select class="input" id="mvRad">${[25, 50, 75, 100, 200].map(r => `<option value="${r}" ${W.radius === r ? "selected" : ""}>${r} km</option>`).join("")}</select><span class="hint">Das System nimmt das nächstgelegene passende Profil, das diesen Kunden noch nie angeschrieben hat.</span></div>
          <div class="field"><span class="label">Kein freies Profil im Umkreis?</span><label class="small" style="display:flex;gap:8px;align-items:center;min-height:46px"><input type="checkbox" id="mvFb" ${W.fallback ? "checked" : ""}> Trotzdem das nächstgelegene Profil nehmen</label><span class="hint">Sonst wird der Kunde diesmal übersprungen.</span></div>
        </div>`}
        <p class="mv-info">${T.isAdmin() ? `Es schreiben <b>alle passenden Profile</b> (${T.profiles.length}). Antworten landen beim Mitarbeiter, dem das jeweilige Profil gehört.` : `Es schreiben nur <b>deine eigenen Profile</b> (${mine.length}). Antworten landen in deinem Posteingang.`}
          ${+cfg.pause ? `<br>Regel vom Chef: jeder Kunde bekommt höchstens 1 Massennachricht in ${cfg.pause} Tag${cfg.pause == 1 ? "" : "en"}.` : ""}</p>
        <div class="mv-nav"><button class="btn ghost" data-back>Zurück</button><button class="btn primary" data-next>Vorschau anzeigen</button></div></div>`;
      el.querySelectorAll("input[name=mvSt]").forEach(r => r.addEventListener("change", () => W.st = r.value));
      if ($("mvRad")) { $("mvRad").addEventListener("change", e => W.radius = +e.target.value); $("mvFb").addEventListener("change", e => W.fallback = e.target.checked); }
      el.querySelector("[data-back]").addEventListener("click", () => { W.step = 2; render(); });
      el.querySelector("[data-next]").addEventListener("click", () => { W.step = 4; render(); });
      return;
    }

    /* Schritt 4 */
    const job = draftJob(), pl = plan(job), p = myPerm();
    el.innerHTML = head + `<div class="card pad">${planHtml(job, pl)}
      <div class="mv-nav"><button class="btn ghost" data-back>Zurück</button>
        <span class="mv-acts"><button class="btn ghost" data-reset>Verwerfen</button>
        ${p === "frei" ? `<button class="btn primary" data-send ${pl.rows.length ? "" : "disabled"}>📣 An alle senden (${pl.rows.length})</button>` : `<button class="btn gold" data-ask ${pl.rows.length ? "" : "disabled"}>Zur Freigabe an den Chef senden</button>`}</span></div></div>`;
    el.querySelector("[data-back]").addEventListener("click", () => { W.step = 3; render(); });
    el.querySelector("[data-reset]").addEventListener("click", () => { resetW(); render(); });
    const mk = status => { const nr = Math.max(0, ...jobs.map(j => j.nr)) + 1; const j = Object.assign(draftJob(), { nr, id: "j" + Date.now(), created: Date.now(), status }); jobs.unshift(j); return j; };
    const sb = el.querySelector("[data-send]");
    if (sb) sb.addEventListener("click", () => NMA.modal({ title: `An ${pl.rows.length} Empfänger senden?`, text: `Zielgruppe <b>${esc(grp(job.group).name)}</b>. ${pl.rows.length} Nachrichten von ${new Set(pl.rows.map(r => r.p.id)).size} Profilen. Das lässt sich nicht zurückholen.`, cancel: "Abbrechen", ok: "Jetzt senden",
      onOk: () => { const j = mk("neu"); const n = execute(j); resetW(); view = "log"; render(); NMA.toast(`${aNo(j.nr)}: ${n} Nachrichten gesendet.`); } }));
    const ab = el.querySelector("[data-ask]");
    if (ab) ab.addEventListener("click", () => { const j = mk("wartet"); save(); resetW(); view = "pending"; render(); NMA.toast(`${aNo(j.nr)} wartet jetzt auf die Freigabe vom Chef.`); });
  };

  const planHtml = (job, pl) => {
    const G = grp(job.group), first = pl.rows[0], np = new Set(pl.rows.map(r => r.p.id)).size, far = pl.rows.filter(r => r.far).length;
    return `<h2 style="font-size:22px;margin-bottom:4px">${G.icon} ${G.name}</h2>
      <p class="hint" style="margin:0 0 14px">${G.fixedSt ? "Nur Testmitglieder" : job.st === "T" ? "Nur Testmitglieder" : job.st === "K" ? "Nur zahlende Kunden" : "Alle"} · ${kontakt() ? "Wohnort pro Kunde in seinem Umkreis" : `Umkreis ${job.radius} km${job.fallback ? " (sonst nächstes Profil)" : ""}`}${job.tpl ? " · Vorlage " + mNo(job.tpl) : " · eigener Text"}</p>
      <div class="mv-kpis"><div class="card"><small>Empfänger</small><strong>${pl.rows.length}</strong></div><div class="card"><small>Profile beteiligt</small><strong>${np}</strong></div><div class="card"><small>Übersprungen</small><strong>${pl.skip.length}</strong></div></div>
      ${far ? `<p class="mv-warn">${far} Empfänger ${far === 1 ? "bekommt" : "bekommen"} eine Nachricht von einem Profil außerhalb von ${job.radius} km (gelb markiert).</p>` : ""}
      ${first ? `<div class="mv-prev"><small>Beispiel: „${esc(first.p.name)}“ an ${esc(first.nick)}</small>${esc(fill(job.text, first.nick, first.p, first.c, first.ort))}</div>` : `<p class="mv-warn">Aktuell gibt es keinen Empfänger für diese Auswahl.</p>`}
      ${pl.rows.length ? `<table class="mv"><thead><tr><th>Kunde</th><th class="hide-sm">Wohnort</th><th>schreibt an ihn/sie</th><th class="num">${kontakt() ? "wohnt für ihn/sie" : "Entfernung"}</th>${T.isAdmin() ? `<th class="hide-sm">Profil gehört</th>` : ""}</tr></thead><tbody>
        ${pl.rows.slice(0, 100).map(r => `<tr><td>${esc(r.nick)} ${stBadge(r.c)}</td><td class="hide-sm">${esc(r.c.ort || "–")}${r.c.land && r.c.land !== "DE" ? ` <small class="muted">${r.c.land}</small>` : ""}</td><td>${esc(r.p.name)}${kontakt() ? "" : `<br><small class="muted">${esc(r.p.city || "")}</small>`}</td><td class="num ${r.far ? "far" : ""}">${kontakt() ? `${esc(r.ort)}<br><small class="muted">${r.d} km</small>` : r.d + " km"}</td>${T.isAdmin() ? `<td class="hide-sm">${esc(T.ownerName(r.p.owner))}</td>` : ""}</tr>`).join("")}
        </tbody></table>${pl.rows.length > 100 ? `<p class="hint">… und ${pl.rows.length - 100} weitere.</p>` : ""}` : ""}
      ${pl.skip.length ? `<details class="mv-skip"><summary>${pl.skip.length} übersprungen – warum?</summary><table class="mv"><tbody>${pl.skip.map(s => `<tr><td>${esc(s.nick)} ${stBadge(s.c)}</td><td>${esc(s.why)}</td></tr>`).join("")}</tbody></table></details>` : ""}`;
  };

  /* ===== Massenvorlagen ===== */
  let editT = null;
  const viewTpls = el => {
    const list = tpls.filter(visTpl).sort((a, b) => b.nr - a.nr);
    el.innerHTML = `<div class="two">
      <form class="card pad" id="mvTForm"><h2 style="font-size:22px;margin-bottom:6px">${editT ? "Vorlage " + mNo(editT.nr) + " bearbeiten" : "Neue Massenvorlage"}</h2>
        <p class="hint" style="margin:0 0 12px">Massenvorlagen haben eigene Nummern (M-…). Dieselbe Massenvorlage geht nie zweimal an denselben Kunden.</p>
        <div class="field"><label for="mtG">Zielgruppe</label><select class="input" id="mtG">${GROUPS.map(g => `<option value="${g.id}" ${(editT ? editT.group : W.group) === g.id ? "selected" : ""}>${g.name}</option>`).join("")}</select><span class="hint" id="mtTip"></span></div>
        <div class="field"><label for="mtN">Kurzname</label><input class="input" id="mtN" maxlength="40" value="${esc(editT ? editT.name : "")}"></div>
        <div class="field"><label for="mtX">Text</label><textarea class="input" id="mtX" rows="5" placeholder="Hallo {name}, …">${esc(editT ? editT.text : "")}</textarea><span class="hint">Platzhalter: {vorname} = Vorname des Kunden · {name} = Nickname · {profil} = Profilname · {ort} = Ort des Profils</span></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary">${editT ? "Speichern" : "Vorlage speichern"}</button>${editT ? `<button type="button" class="btn ghost" id="mtCancel">Abbrechen</button>` : ""}</div></form>
      <div class="card pad"><h2 style="font-size:22px;margin-bottom:12px">${T.isAdmin() ? "Alle Massenvorlagen" : "Massenvorlagen"}</h2>
        ${list.length ? list.map(t => { const uses = Object.values(msent).filter(a => a.some(x => x.tpl === t.nr)).length;
          return `<article class="tpl"><div class="tpl-top"><span class="tpl-nr">${mNo(t.nr)}</span><b>${esc(t.name || "Vorlage")}</b><small class="muted">· ${esc(grp(t.group).name)} · ${esc(T.ownerName(t.owner))}</small><small class="muted" style="margin-left:auto">an ${uses} Kunde${uses === 1 ? "" : "n"}</small></div><p>${esc(t.text)}</p>
          ${canEditTpl(t) ? `<div class="tpl-acts"><button class="btn sm" data-te="${t.nr}">Bearbeiten</button><button class="btn sm ghost" data-td="${t.nr}">Löschen</button></div>` : ""}</article>`; }).join("") : '<p class="empty">Noch keine Massenvorlagen.</p>'}</div></div>`;
    const tip = () => $("mtTip").textContent = grp($("mtG").value).tip; tip(); $("mtG").addEventListener("change", tip);
    if ($("mtCancel")) $("mtCancel").addEventListener("click", () => { editT = null; render(); });
    $("mvTForm").addEventListener("submit", e => { e.preventDefault();
      const text = $("mtX").value.trim(), name = $("mtN").value.trim(), group = $("mtG").value;
      if (text.length < 10) { NMA.toast("Der Text ist zu kurz (mind. 10 Zeichen)."); return; }
      const dup = tpls.find(t => t !== editT && t.text.trim().toLowerCase() === text.toLowerCase());
      if (dup) { NMA.toast(`Diesen Text gibt es schon als ${mNo(dup.nr)}.`); return; }
      if (editT) { Object.assign(editT, { text, name, group }); NMA.toast(`${mNo(editT.nr)} gespeichert.`); editT = null; }
      else { const nr = Math.max(0, ...tpls.map(t => t.nr)) + 1; tpls.push({ nr, group, owner: T.meKey(), name, text }); NMA.toast(`Massenvorlage ${mNo(nr)} angelegt.`); }
      save(); render();
    });
    el.querySelectorAll("[data-te]").forEach(b => b.addEventListener("click", () => { editT = tpls.find(t => t.nr == b.dataset.te); render(); $("mtX").focus(); }));
    el.querySelectorAll("[data-td]").forEach(b => b.addEventListener("click", () => { const t = tpls.find(x => x.nr == b.dataset.td);
      NMA.modal({ title: `${mNo(t.nr)} löschen?`, text: "Die Nummer wird nicht neu vergeben. Wer die Vorlage schon bekommen hat, bekommt sie auch künftig nicht noch einmal.", cancel: "Abbrechen", ok: "Löschen", onOk: () => { tpls = tpls.filter(x => x !== t); save(); render(); } }); }));
  };

  /* ===== Freigaben ===== */
  const jobHead = j => `<div class="top"><span class="tpl-nr">${aNo(j.nr)}</span><b>${esc(grp(j.group).name)}</b><span class="mv-st ${j.status}">${j.status === "wartet" ? "wartet auf Freigabe" : j.status}</span><small class="muted">von ${esc(T.ownerName(j.by))} · ${fmt(j.created)}</small></div>`;
  const viewPending = el => {
    const list = pendingFor();
    el.innerHTML = `<div class="card pad">${list.length ? list.map(j => { const pl = plan(j);
      return `<div class="mv-job">${jobHead(j)}<p>${esc(j.text)}</p>
        <div class="hint" style="margin-bottom:8px">${j.st === "T" ? "Nur Testmitglieder · " : j.st === "K" ? "Nur zahlende Kunden · " : ""}${kontakt() ? "Wohnort pro Kunde" : `Umkreis ${j.radius} km`} · würde jetzt an <b>${pl.rows.length}</b> gehen (${pl.skip.length} übersprungen)</div>
        <div class="mv-acts"><button class="btn sm" data-pv="${j.id}">Vorschau</button>
        ${T.isAdmin() ? `<button class="btn sm primary" data-ok="${j.id}" ${pl.rows.length ? "" : "disabled"}>Freigeben &amp; senden</button><input class="input" id="note_${j.id}" placeholder="Grund bei Ablehnung (optional)" style="max-width:260px;min-height:38px"><button class="btn sm ghost" data-no="${j.id}">Ablehnen</button>`
          : `<button class="btn sm ghost" data-back="${j.id}">Zurückziehen</button>`}</div></div>`; }).join("")
      : `<p class="empty">${T.isAdmin() ? "Keine Aussendungen warten auf deine Freigabe." : "Nichts wartet auf Freigabe."}</p>`}</div>`;
    const J = id => jobs.find(j => j.id === id);
    el.querySelectorAll("[data-pv]").forEach(b => b.addEventListener("click", () => {
      const j = J(b.dataset.pv), m = document.createElement("div"); m.className = "modal form-modal";
      m.innerHTML = `<div class="card" style="max-height:92svh;overflow:auto;max-width:860px;width:100%">${planHtml(j, plan(j))}<div class="row"><button class="btn primary" data-x>Schließen</button></div></div>`;
      document.body.appendChild(m); m.addEventListener("click", e => { if (e.target === m || e.target.hasAttribute("data-x")) m.remove(); });
    }));
    el.querySelectorAll("[data-ok]").forEach(b => b.addEventListener("click", () => { const j = J(b.dataset.ok), n = plan(j).rows.length;
      NMA.modal({ title: `${aNo(j.nr)} freigeben?`, text: `Die Aussendung von ${esc(T.ownerName(j.by))} geht sofort an ${n} Empfänger.`, cancel: "Abbrechen", ok: "Freigeben & senden",
        onOk: () => { j.decidedBy = T.meKey(); j.decidedAt = Date.now(); const s = execute(j); render(); NMA.toast(`${aNo(j.nr)} freigegeben – ${s} Nachrichten gesendet.`); } }); }));
    el.querySelectorAll("[data-no]").forEach(b => b.addEventListener("click", () => { const j = J(b.dataset.no);
      j.status = "abgelehnt"; j.note = ($("note_" + j.id).value || "").trim(); j.decidedBy = T.meKey(); j.decidedAt = Date.now(); save(); render(); NMA.toast(`${aNo(j.nr)} abgelehnt.`); }));
    el.querySelectorAll("[data-back]").forEach(b => b.addEventListener("click", () => { jobs = jobs.filter(j => j.id !== b.dataset.back); save(); render(); NMA.toast("Aussendung zurückgezogen."); }));
  };

  /* ===== Verlauf ===== */
  const viewLog = el => {
    const list = jobs.filter(j => j.status !== "wartet" && (T.isAdmin() || j.by === T.meKey()));
    el.innerHTML = `<div class="card pad">${list.length ? list.map(j => `<div class="mv-job">${jobHead(j)}<p>${esc(j.text)}</p>
      <div class="hint">${j.status === "gesendet" ? `${fmt(j.sentAt)}: <b>${j.result.sent}</b> Nachrichten von ${j.result.profiles} Profilen gesendet, ${j.result.skipped} übersprungen${j.decidedBy ? ` · freigegeben von ${esc(T.ownerName(j.decidedBy))}` : ""}`
        : `Abgelehnt von ${esc(T.ownerName(j.decidedBy))} am ${fmt(j.decidedAt)}${j.note ? ` – „${esc(j.note)}“` : ""}`}</div>
      ${j.status === "abgelehnt" && j.by === T.meKey() ? `<div class="mv-acts" style="margin-top:8px"><button class="btn sm" data-re="${j.id}">Überarbeiten</button></div>` : ""}</div>`).join("")
      : '<p class="empty">Noch keine Aussendungen.</p>'}</div>`;
    el.querySelectorAll("[data-re]").forEach(b => b.addEventListener("click", () => { const j = jobs.find(x => x.id === b.dataset.re);
      W = { step: 2, group: j.group, tpl: null, text: j.text, saveTpl: false, tplName: "", st: j.st || "", radius: j.radius, fallback: j.fallback }; view = "new"; render(); }));
  };

  /* ===== Rechte & Regeln (nur Chef) ===== */
  const viewSettings = el => {
    const mods = T.staff.filter(s => s.role === "Moderator");
    el.innerHTML = `<div class="two">
      <div class="card pad"><h2 style="font-size:22px;margin-bottom:4px">Wer darf Massenversand?</h2>
        <p class="hint" style="margin:0 0 12px">Neue Mitarbeiter am besten erst „Mit Kontrolle“ – dann prüfst du jede Aussendung vor dem Versand. Wer erfahren ist, darf „Selbstständig“ senden.</p>
        <table class="mv mv-perms"><thead><tr><th>Mitarbeiter</th><th>Massenversand</th></tr></thead><tbody>
        ${mods.map(s => `<tr><td><b>${esc(s.name)}</b>${s.active ? "" : ' <small class="muted">· gesperrt</small>'}<br><small class="muted">${T.profiles.filter(p => p.owner === s.user).length} eigene Profile</small></td>
          <td><select class="input" data-perm="${s.user}" ${s.active ? "" : "disabled"}>${Object.entries(PERM).map(([v, t]) => `<option value="${v}" ${(s.mass || "aus") === v ? "selected" : ""}>${t}</option>`).join("")}</select></td></tr>`).join("")}
        </tbody></table></div>
      <div class="card pad"><h2 style="font-size:22px;margin-bottom:12px">Regeln für alle</h2>
        <div class="field"><label for="mvPause">Pause pro Kunde</label><select class="input" id="mvPause">${[[0, "Keine Pause"], [1, "1 Massennachricht pro Tag"], [2, "höchstens alle 2 Tage"], [3, "höchstens alle 3 Tage"], [7, "höchstens 1× pro Woche"]].map(([v, t]) => `<option value="${v}" ${+cfg.pause === v ? "selected" : ""}>${t}</option>`).join("")}</select><span class="hint">Schützt Kunden vor zu vielen Massennachrichten – egal von welchem Mitarbeiter.</span></div>
        <div class="field"><label for="mvW">Wohnort der Profile</label><select class="input" id="mvW"><option value="kontakt" ${kontakt() ? "selected" : ""}>Pro Kunde in seiner Nähe (Kontakt-Ort)</option><option value="fest" ${kontakt() ? "" : "selected"}>Fest – Ort/PLZ aus dem Profil</option></select><span class="hint">Kontakt-Ort: Das Profil wohnt für jeden Kunden in dessen Umkreis und bleibt dort für ihn. Fest: Umkreis-Suche nach PLZ des Profils.</span></div>
        <div class="field" id="mvRF"><label for="mvR">Standard-Umkreis</label><select class="input" id="mvR">${[25, 50, 75, 100, 200].map(r => `<option value="${r}" ${+cfg.radius === r ? "selected" : ""}>${r} km</option>`).join("")}</select></div>
        <label class="small" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="mvF" ${cfg.fallback ? "checked" : ""}> Standard: kein Profil im Umkreis → nächstgelegenes nehmen</label>
        <p class="hint" style="margin-top:14px">Profile ohne PLZ werden über den Ort zugeordnet. Für genaue Entfernungen bei jedem Profil die PLZ eintragen (Profile → Bearbeiten).</p></div></div>`;
    el.querySelectorAll("[data-perm]").forEach(s => s.addEventListener("change", () => {
      const st = T.staff.find(x => x.user === s.dataset.perm); st.mass = s.value; T.persistStaff();
      NMA.toast(`${st.name}: Massenversand ${PERM[s.value].toLowerCase()}.`);
    }));
    $("mvPause").addEventListener("change", e => { cfg.pause = +e.target.value; save(); NMA.toast("Gespeichert."); });
    $("mvW").addEventListener("change", e => { cfg.wohnort = e.target.value; save(); NMA.toast(kontakt() ? "Profile wohnen jetzt pro Kunde in seiner Nähe." : "Profile haben jetzt einen festen Ort."); render(); });
    $("mvR").addEventListener("change", e => { cfg.radius = +e.target.value; save(); if (W.step === 1) W.radius = cfg.radius; NMA.toast("Gespeichert."); });
    $("mvF").addEventListener("change", e => { cfg.fallback = e.target.checked; save(); if (W.step === 1) W.fallback = cfg.fallback; NMA.toast("Gespeichert."); });
  };

  /* beim Wechsel der Demo-Ansicht neu anfangen */
  let lastMe = T.me;
  window.MV = {};
  window.MV.render = () => { if (T.me !== lastMe) { lastMe = T.me; resetW(); editT = null; view = "new"; } render(); };
  addEventListener("storage", e => { if (e.key && e.key.startsWith("nma_mv")) { jobs = S.get("mvJobs", []); msent = S.get("mvSent", {}); render(); } });
  window.MV.render();
})();
