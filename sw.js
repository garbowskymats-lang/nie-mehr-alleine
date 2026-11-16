/* Service Worker: macht die Seite installierbar und hält die Grunddateien offline bereit.
   Hier kann der Entwickler später auch Push-Benachrichtigungen ("neue Nachricht") empfangen. */
const CACHE = "nma-v1";
const FILES = ["./","index.html","uebersicht.html","chat.html","postfach.html","suche.html","style.css","app.js","assets/icon-192.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});
