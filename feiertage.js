/* =====================================================================
   FEIERTAGE Deutschland · Österreich · Schweiz (Mitarbeiterbereich)
   - Oben im Team-Portal: Hinweis auf Feiertage heute und morgen.
   - Öffnet ein Mitarbeiter ein Gespräch mit einem Kunden aus einem Land, in dem heute Feiertag ist,
     erscheint ein Pop-up „Heute Feiertag in Österreich: …“ (einmal pro Gespräch und Tag).
   - Bewegliche Feiertage werden aus dem Osterdatum berechnet – gilt für jedes Jahr automatisch.
   - Regionale Feiertage (einzelne Bundesländer/Kantone) sind gekennzeichnet.
   Testen mit anderem Datum: team.html?datum=2026-10-26
   ===================================================================== */
(() => {
  const LAND = { DE: "Deutschland", AT: "Österreich", CH: "der Schweiz" }, FLAG = { DE: "🇩🇪", AT: "🇦🇹", CH: "🇨🇭" };
  const easter = y => { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1; return new Date(y, mo - 1, da); };
  const key = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const plus = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const cache = {};
  const list = y => {
    if (cache[y]) return cache[y];
    const E = easter(y), F = (m, d) => new Date(y, m - 1, d);
    /* Buß- und Bettag: Mittwoch vor dem 23. November */
    let bb = F(11, 22); while (bb.getDay() !== 3) bb = plus(bb, -1);
    const L = [
      ["DE", F(1, 1), "Neujahr"], ["DE", plus(E, -2), "Karfreitag"], ["DE", plus(E, 1), "Ostermontag"], ["DE", F(5, 1), "Tag der Arbeit"],
      ["DE", plus(E, 39), "Christi Himmelfahrt"], ["DE", plus(E, 50), "Pfingstmontag"], ["DE", F(10, 3), "Tag der Deutschen Einheit"],
      ["DE", F(12, 25), "1. Weihnachtstag"], ["DE", F(12, 26), "2. Weihnachtstag"],
      ["DE", F(1, 6), "Heilige Drei Könige", "Baden-Württemberg, Bayern, Sachsen-Anhalt"],
      ["DE", F(3, 8), "Internationaler Frauentag", "Berlin, Mecklenburg-Vorpommern"],
      ["DE", plus(E, 60), "Fronleichnam", "BW, Bayern, Hessen, NRW, Rheinland-Pfalz, Saarland, Teile Sachsen/Thüringen"],
      ["DE", F(8, 15), "Mariä Himmelfahrt", "Saarland, Teile Bayerns"],
      ["DE", F(9, 20), "Weltkindertag", "Thüringen"],
      ["DE", F(10, 31), "Reformationstag", "BB, HB, HH, MV, NI, SN, ST, SH, TH"],
      ["DE", F(11, 1), "Allerheiligen", "BW, Bayern, NRW, Rheinland-Pfalz, Saarland"],
      ["DE", bb, "Buß- und Bettag", "Sachsen"],
      ["AT", F(1, 1), "Neujahr"], ["AT", F(1, 6), "Heilige Drei Könige"], ["AT", plus(E, 1), "Ostermontag"], ["AT", F(5, 1), "Staatsfeiertag"],
      ["AT", plus(E, 39), "Christi Himmelfahrt"], ["AT", plus(E, 50), "Pfingstmontag"], ["AT", plus(E, 60), "Fronleichnam"],
      ["AT", F(8, 15), "Mariä Himmelfahrt"], ["AT", F(10, 26), "Nationalfeiertag"], ["AT", F(11, 1), "Allerheiligen"],
      ["AT", F(12, 8), "Mariä Empfängnis"], ["AT", F(12, 25), "Christtag"], ["AT", F(12, 26), "Stefanitag"],
      ["CH", F(1, 1), "Neujahr"], ["CH", F(1, 2), "Berchtoldstag", "viele Kantone"], ["CH", plus(E, -2), "Karfreitag", "fast alle Kantone"],
      ["CH", plus(E, 1), "Ostermontag", "fast alle Kantone"], ["CH", plus(E, 39), "Auffahrt"], ["CH", plus(E, 50), "Pfingstmontag", "fast alle Kantone"],
      ["CH", F(8, 1), "Bundesfeier (Nationalfeiertag)"], ["CH", F(12, 25), "Weihnachten"], ["CH", F(12, 26), "Stephanstag", "fast alle Kantone"]
    ];
    return (cache[y] = L.map(([land, d, name, region]) => ({ land, key: key(d), name, region: region || "" })));
  };
  const heute = () => { const p = NMA.param && NMA.param("datum"); const d = p && /^\d{4}-\d{2}-\d{2}$/.test(p) ? new Date(p + "T12:00") : new Date(); return d; };
  const am = (d, land) => list(d.getFullYear()).filter(h => h.key === key(d) && (!land || h.land === land));
  const txt = h => `${h.name}${h.region ? ` <small class="muted">(regional: ${h.region})</small>` : ""}`;

  /* Leiste oben: heute / morgen */
  const banner = () => {
    const d = heute(), t = am(d), m = am(plus(d, 1));
    let bar = document.getElementById("ftBar");
    if (!t.length && !m.length) { bar && bar.remove(); return; }
    if (!bar) { bar = document.createElement("div"); bar.id = "ftBar"; bar.className = "card"; bar.style.cssText = "padding:10px 14px;margin:0 0 16px;display:flex;gap:10px 18px;flex-wrap:wrap;align-items:center;font-size:14px;border-color:#5a4a1e;background:#1c1810";
      const host = document.querySelector("main") || document.body; host.insertBefore(bar, host.firstChild); }
    const grp = (arr, w) => Object.entries(arr.reduce((o, h) => ((o[h.land] = o[h.land] || []).push(h), o), {})).map(([l, hs]) => `<span><b>${w}</b> ${FLAG[l]} Feiertag in ${LAND[l]}: ${hs.map(txt).join(", ")}</span>`).join("");
    bar.innerHTML = `<span style="font-size:18px">🎉</span>${grp(t, "Heute")}${grp(m, "Morgen")}`;
  };

  /* Pop-up beim Öffnen eines Gesprächs */
  const shown = new Set();
  const check = (custNick, land) => {
    land = land || "DE"; const d = heute(), hs = am(d, land), k = custNick + "|" + key(d);
    if (!hs.length || shown.has(k)) return;
    shown.add(k);
    const regional = hs.every(h => h.region);
    NMA.modal({ title: `${FLAG[land]} Heute Feiertag in ${LAND[land]}`,
      text: `${hs.map(txt).join("<br>")}<br><br>${regional ? "Das ist ein regionaler Feiertag – je nach Wohnort des Kunden hat er frei. " : "Der Kunde hat heute sehr wahrscheinlich frei. "}Gut für ein persönliches „Schönen Feiertag!“ – und nicht nach der Arbeit fragen.`, ok: "Alles klar" });
  };
  /* kurzer Hinweis für die Infospalte */
  const info = land => { const hs = am(heute(), land || "DE"); return hs.length ? `🎉 Heute Feiertag: ${hs.map(h => h.name + (h.region ? " (regional)" : "")).join(", ")}` : ""; };

  window.FEIERTAGE = { list, am, check, info, banner, heute };
  banner(); setInterval(banner, 30 * 60 * 1000);
})();
