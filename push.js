/* =====================================================================
   PUSH-BENACHRICHTIGUNGEN (Kundenseite) – „Neue Nachricht im Chat“
   Technik: Web Push. Funktioniert
     - Android (Chrome, Edge, Samsung Internet, Firefox): im Browser und als installierte App
     - iPhone/iPad ab iOS 16.4: NUR wenn die Seite zum Home-Bildschirm hinzugefügt wurde (App-Symbol)
     - PC (Chrome, Edge, Firefox, Safari)
   Voraussetzung: echte Domain mit https (nicht in der Claude-Vorschau, nicht als Datei).

   FÜR DEN SERVER-ENTWICKLER
   1. VAPID-Schlüssel erzeugen:  npx web-push generate-vapid-keys
   2. Öffentlichen Schlüssel unten bei vapidPublicKey eintragen (privater bleibt auf dem Server!)
   3. Endpunkte bauen (Beispiel: server/push-beispiel.js):
        POST /api/push/subscribe    { subscription, preview, mode }  → beim Kunden speichern
                                    (mode: "alle" | "favoriten")
        POST /api/push/unsubscribe  { endpoint }               → löschen
   4. Bei jeder neuen Nachricht an einen Kunden: Push an alle seine Geräte senden.
   Solange vapidPublicKey leer ist, läuft der DEMO-Modus: Die Erlaubnis wird echt abgefragt,
   die Test-Mitteilung kommt aber vom Gerät selbst statt vom Server.
   ===================================================================== */
NMA.pushConfig = {
  vapidPublicKey: "",                       /* <-- hier den öffentlichen VAPID-Schlüssel eintragen */
  subscribeUrl: "/api/push/subscribe",
  unsubscribeUrl: "/api/push/unsubscribe"
};

NMA.push = (() => {
  const cfg = NMA.pushConfig;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const keyBytes = b64 => { const p = "=".repeat((4 - b64.length % 4) % 4), s = atob((b64 + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from([...s].map(c => c.charCodeAt(0))); };
  const reg = async () => {
    if (!("serviceWorker" in navigator)) throw new Error("sw");
    return (await navigator.serviceWorker.getRegistration()) || navigator.serviceWorker.register("sw.js");
  };

  /* Was ist auf diesem Gerät möglich? → {ok, why} */
  const check = () => {
    if (!location.protocol.startsWith("https") && location.hostname !== "localhost") return { ok: false, why: "Benachrichtigungen funktionieren nur auf der echten Seite (https) – nicht in dieser Vorschau." };
    if (isIOS && !standalone()) return { ok: false, ios: true, why: "Auf dem iPhone geht das nur in der App: Erst „Zum Home-Bildschirm“ hinzufügen, dann die App öffnen und hier einschalten." };
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return { ok: false, why: "Dieser Browser kann leider keine Benachrichtigungen. Bitte Chrome, Edge, Firefox oder Safari aktuell verwenden." };
    if (Notification.permission === "denied") return { ok: false, denied: true, why: "Benachrichtigungen sind für diese Seite blockiert. Bitte in den Einstellungen des Handys bzw. Browsers wieder erlauben." };
    return { ok: true };
  };

  const isOn = async () => {
    if (!check().ok || Notification.permission !== "granted") return false;
    if (!cfg.vapidPublicKey) return NMA.store.get("pushDemo", false);
    try { const r = await reg(); return !!(await r.pushManager.getSubscription()); } catch (e) { return false; }
  };

  const enable = async (preview, mode) => {
    mode = mode || NMA.pushMode();
    const c = check(); if (!c.ok) throw new Error(c.why);
    const perm = await Notification.requestPermission();
    if (perm !== "granted") throw new Error("Du hast Benachrichtigungen nicht erlaubt. Du kannst das jederzeit wieder einschalten.");
    const r = await reg(); await navigator.serviceWorker.ready;
    if (!cfg.vapidPublicKey) { NMA.store.set("pushDemo", true); return "demo"; }
    const sub = (await r.pushManager.getSubscription()) || await r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(cfg.vapidPublicKey) });
    const res = await fetch(cfg.subscribeUrl, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ subscription: sub, preview: !!preview, mode }) });
    if (!res.ok) throw new Error("Der Server hat die Anmeldung nicht angenommen. Bitte später noch einmal versuchen.");
    return "ok";
  };

  const disable = async () => {
    NMA.store.set("pushDemo", false);
    if (!cfg.vapidPublicKey || !("serviceWorker" in navigator)) return;
    try {
      const r = await reg(), sub = await r.pushManager.getSubscription(); if (!sub) return;
      await fetch(cfg.unsubscribeUrl, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ endpoint: sub.endpoint }) }).catch(() => {});
      await sub.unsubscribe();
    } catch (e) {}
  };

  /* Test: so sieht die Mitteilung aus (vom Gerät selbst erzeugt) */
  const test = async (preview) => {
    const r = await reg(); await navigator.serviceWorker.ready;
    const p = NMA.profiles[0] || { name: "Lena" };
    await r.showNotification(preview ? `Neue Nachricht von ${p.name}` : "Nie mehr alleine", {
      body: preview ? "Hallo! Ich habe gerade an dich gedacht 😊" : "Du hast eine neue Nachricht.",
      icon: "assets/icon-192.png", badge: "assets/icon-192.png", tag: "nma-chat", renotify: true, data: { url: "chat.html" }
    });
  };

  return { check, isOn, enable, disable, test, isIOS, standalone };
})();
