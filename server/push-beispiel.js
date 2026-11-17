/* =====================================================================
   BEISPIEL für den Server-Entwickler: Push-Benachrichtigungen mit Node.js + Express
   Installation:  npm install express web-push
   Schlüssel:     npx web-push generate-vapid-keys   → in .env (VAPID_PUBLIC, VAPID_PRIVATE)
                  den öffentlichen Schlüssel zusätzlich in push.js (vapidPublicKey) eintragen
   Speicher:      hier nur im Arbeitsspeicher – in echt eine Tabelle push_subscriptions
                  (kunde_id, endpoint, p256dh, auth, preview, erstellt_am)
   ===================================================================== */
const express = require("express");
const webpush = require("web-push");

webpush.setVapidDetails("mailto:support@eure-domain.de", process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE);

const app = express();
app.use(express.json());

/* kundeId kommt in echt aus der Anmeldung (Session/Cookie) */
const kundeVon = req => req.session?.kundeId || "demo";
const subs = new Map();            /* kundeId → [{ subscription, preview, mode }] */
const favoritenVon = kundeId => new Set();   /* in echt: Favoriten des Kunden aus der Datenbank */

app.post("/api/push/subscribe", (req, res) => {
  const { subscription, preview, mode } = req.body || {};
  if (!subscription?.endpoint) return res.status(400).end();
  const id = kundeVon(req), list = (subs.get(id) || []).filter(s => s.subscription.endpoint !== subscription.endpoint);
  list.push({ subscription, preview: !!preview, mode: mode === "favoriten" ? "favoriten" : "alle" });
  subs.set(id, list);
  res.status(201).json({ ok: true });
});

app.post("/api/push/unsubscribe", (req, res) => {
  const id = kundeVon(req);
  subs.set(id, (subs.get(id) || []).filter(s => s.subscription.endpoint !== req.body?.endpoint));
  res.json({ ok: true });
});

/* Aufrufen, sobald ein Profil (Moderator oder Massenversand) einem Kunden schreibt.
   Tipp: nicht bei jeder Nachricht pushen, wenn der Kunde gerade im Chat online ist. */
async function neueNachrichtPush(kundeId, { profilName, profilId, text }) {
  const favs = favoritenVon(kundeId);
  const list = (subs.get(kundeId) || []).filter(s => s.mode !== "favoriten" || favs.has(profilId));
  await Promise.all(list.map(async s => {
    const payload = s.preview
      ? { title: `Neue Nachricht von ${profilName}`, body: text.slice(0, 120), url: `chat.html?mit=${profilId}`, tag: "chat-" + profilId }
      : { title: "Nie mehr alleine", body: "Du hast eine neue Nachricht.", url: `chat.html?mit=${profilId}`, tag: "chat" };
    try { await webpush.sendNotification(s.subscription, JSON.stringify(payload), { TTL: 60 * 60 * 24 }); }
    catch (e) {                    /* 404/410 = Gerät abgemeldet → löschen */
      if (e.statusCode === 404 || e.statusCode === 410)
        subs.set(kundeId, (subs.get(kundeId) || []).filter(x => x.subscription.endpoint !== s.subscription.endpoint));
    }
  }));
}

module.exports = { app, neueNachrichtPush };
if (require.main === module) app.listen(3000, () => console.log("Push-Beispiel läuft auf Port 3000"));
