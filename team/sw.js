/* Service Worker für die Team-App (Ordner /team/ – eigener Bereich, getrennt von der Kunden-App). Speichert nichts zwischen – Kundendaten bleiben auf dem Server.
   Nur nötig, damit sich das Portal als App installieren lässt. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).catch(() => new Response("<h1 style='font-family:sans-serif'>Keine Verbindung</h1><p style='font-family:sans-serif'>Bitte Internet prüfen.</p>", { headers: { "Content-Type": "text/html; charset=utf-8" } })));
});
