/* =====================================================================
   EINGÄNGE (mehrere Domains → ein Chat)
   Alle Kunden-Domains landen im selben Chat, mit denselben Profilen und Mitarbeitern.
   Jede Domain kann eigenen Namen bekommen. Der Kunde wird mit seinem Eingang gespeichert –
   sehen kann das NUR der Chef (Kundenkarte, Kundenliste). Mitarbeiter sehen keine Domains.
   Diese Datei wird nur auf den Kundenseiten geladen, NIE im Mitarbeiter-Portal.

   Neue Domain: Zeile ergänzen und die Domain bei Cloudflare/dem Hoster auf dieselbe Seite zeigen lassen.
   Testen ohne Domain: an die Adresse ?eingang=FR anhängen (gilt bis der Tab geschlossen wird).
   SERVER: Eingang beim Registrieren aus der aufgerufenen Domain übernehmen (Host-Header), nicht aus dem Browser.
   ===================================================================== */
NMA.EINGAENGE = [
  { code: "NMA", host: "niemehralleine.com",  name: "Nie mehr alleine" },
  { code: "NMD", host: "niemehralleine.de",   name: "Nie mehr alleine" },
  { code: "FR",  host: "feurigeromanze.de",   name: "Feurige Romanze" }
  /* weitere Eingänge hier ergänzen: { code: "XY", host: "beispiel.de", name: "Anzeigename" } */
];
NMA.eingang = (() => {
  const h = location.hostname.replace(/^www\./, "");
  let pick = NMA.EINGAENGE.find(e => e.host === h);
  try {
    const q = new URLSearchParams(location.search).get("eingang");
    if (q) sessionStorage.setItem("nma_eingang", q.toUpperCase());
    const s = sessionStorage.getItem("nma_eingang");
    if (!pick && s) pick = NMA.EINGAENGE.find(e => e.code === s);
  } catch (e) {}
  return pick || { code: "NMA", host: h || "lokal", name: "Nie mehr alleine", test: true };
})();

/* Name der Seite austauschen, wenn der Eingang anders heißt */
{
  const E = NMA.eingang, from = "Nie mehr alleine";
  if (E.name !== from) {
    const swap = root => { const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (n.nodeValue.includes(from)) n.nodeValue = n.nodeValue.split(from).join(E.name); };
    document.title = document.title.split(from).join(E.name);
    const run = () => { document.querySelectorAll(".brand span").forEach(s => { if (!s.classList.contains("tb-tag")) s.textContent = E.name; }); document.querySelectorAll(".brand[aria-label]").forEach(b => b.setAttribute("aria-label", b.getAttribute("aria-label").split(from).join(E.name))); swap(document.body); };
    if (document.readyState === "loading") addEventListener("DOMContentLoaded", run); else run();
    new MutationObserver(m => m.forEach(r => r.addedNodes.forEach(x => x.nodeType === 1 ? swap(x) : x.nodeType === 3 && x.nodeValue.includes(from) && (x.nodeValue = x.nodeValue.split(from).join(E.name))))).observe(document.documentElement, { childList: true, subtree: true });
  }
}
