/* Service Worker: macht die Seite installierbar und hält die Grunddateien offline bereit.
   Außerdem empfängt er Push-Benachrichtigungen („neue Nachricht“) – siehe push.js und server/push-beispiel.js. */
const CACHE = "nma-v6";
const FILES = ["./","index.html","uebersicht.html","chat.html","postfach.html","suche.html","style.css","app.js","assets/icon-192.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});

/* ---------- Push: neue Nachricht ----------
   Der Server schickt JSON: { title, body, url, tag }  (siehe server/push-beispiel.js) */
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "Nie mehr alleine", {
    body: d.body || "Du hast eine neue Nachricht.",
    icon: "assets/icon-192.png", badge: "assets/icon-192.png",
    tag: d.tag || "nma-chat", renotify: true,
    data: { url: d.url || "chat.html" }
  }));
});
/* Tippen auf die Mitteilung: offene App nach vorne holen oder Chat öffnen */
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL(e.notification.data && e.notification.data.url || "chat.html", self.registration.scope).href;
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) if (c.url.startsWith(self.registration.scope)) { c.navigate(url).catch(() => {}); return c.focus(); }
    return clients.openWindow(url);
  }));
});
