/* =====================================================================
   BEISPIEL für den Server: Vollautomatik der Profil-Fabrik
   (für den Server-Kollegen – ungetestet, als Vorlage gedacht)

   Die Profil-Fabrik im Team-Portal schickt pro Person:
     POST <NMA.fabrikConfig.url>/bilder
     { num, folder, rules, person, shots: [{ file: "01.jpg", scene: "Selfie im Garten …" }, …] }
   und erwartet zurück:
     { images: [{ file: "01.jpg", url: "https://…/bilder/Frau_57_0042/01.jpg" }, …] }

   Ablauf hier:
   - Bild 01 wird neu erzeugt (Bild-KI, z. B. OpenAI-Bild-API).
   - Bild 02 … 08 werden mit Bild 01 als Vorlage erzeugt („dieselbe Person“), damit das Gesicht gleich bleibt.
   - Bilder werden unter <folder>/<file> gespeichert (hier: lokaler Ordner, besser: Objektspeicher).

   Wichtig:
   - API-Schlüssel NUR auf dem Server (Umgebungsvariable OPENAI_API_KEY), nie im Browser.
   - Nur angemeldete Admins dürfen diesen Endpunkt aufrufen (Session prüfen).
   - Kosten: Jedes Bild kostet bei der Bild-KI Geld – Obergrenze pro Tag einbauen.
   - Modellname und Endpunkte bei Einrichtung in der aktuellen Doku des Anbieters prüfen.
   - Bilder vor dem Freischalten von einem Menschen ansehen lassen (FSK16, keine echten Personen).
   - KI-Bilder kennzeichnen, soweit rechtlich nötig (mit dem Anwalt klären).

   npm install express
   ===================================================================== */
const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
app.use(express.json({ limit: "1mb" }));

const KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.BILD_MODELL || "gpt-image-1";        // bei Einrichtung prüfen
const ABLAGE = process.env.BILD_ORDNER || "./profilbilder";
const OEFFENTLICH = process.env.BILD_URL || "https://api.tippelclub.de/profilbilder";
const TAGES_LIMIT = +process.env.BILD_LIMIT || 300;
let heute = { tag: "", zahl: 0 };

const nurAdmin = (req, res, next) => {
  // TODO: echte Session-Prüfung des Team-Portals einsetzen
  if (!req.headers.cookie) return res.status(401).json({ error: "nicht angemeldet" });
  next();
};

async function neuesBild(prompt) {
  const r = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Authorization": `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt, size: "1024x1536", n: 1 })
  });
  if (!r.ok) throw new Error("Bild-KI: " + (await r.text()));
  const j = await r.json();
  return Buffer.from(j.data[0].b64_json, "base64");
}

async function bildMitVorlage(vorlage, prompt) {
  const fd = new FormData();
  fd.append("model", MODEL);
  fd.append("prompt", prompt);
  fd.append("size", "1024x1536");
  fd.append("image", new Blob([vorlage], { type: "image/png" }), "vorlage.png");
  const r = await fetch("https://api.openai.com/v1/images/edits", { method: "POST", headers: { "Authorization": `Bearer ${KEY}` }, body: fd });
  if (!r.ok) throw new Error("Bild-KI: " + (await r.text()));
  const j = await r.json();
  return Buffer.from(j.data[0].b64_json, "base64");
}

app.post("/fabrik/bilder", nurAdmin, async (req, res) => {
  const { folder, rules, person, shots } = req.body || {};
  if (!/^(Frauen|Maenner)\/(Abenteuer|Beziehung)\/(Frau|Mann)_\d{2}_\d{3,5}$/.test(folder || "") || !Array.isArray(shots) || !shots.length || shots.length > 8)
    return res.status(400).json({ error: "ungültige Anfrage" });

  const tag = new Date().toISOString().slice(0, 10);
  if (heute.tag !== tag) heute = { tag, zahl: 0 };
  if (heute.zahl + shots.length > TAGES_LIMIT) return res.status(429).json({ error: "Tageslimit erreicht" });

  try {
    const ziel = path.join(ABLAGE, folder);
    await fs.mkdir(ziel, { recursive: true });
    const images = [];
    let erstes = null;
    for (const s of shots) {
      if (!/^\d{2}(_freigabe)?\.jpg$/.test(s.file)) continue;
      const prompt = `${rules}\nPerson: ${person}.\nSzene: ${s.scene}.`;
      const buf = erstes
        ? await bildMitVorlage(erstes, `Genau dieselbe Person wie auf dem Vorlagebild (gleiches Gesicht, gleiche Haare, gleiche Figur). ${prompt}`)
        : await neuesBild(prompt);
      if (!erstes) erstes = buf;
      const datei = s.file.replace(/\.jpg$/, ".png");
      await fs.writeFile(path.join(ziel, datei), buf);
      heute.zahl++;
      images.push({ file: s.file, url: `${OEFFENTLICH}/${folder}/${datei}` });
    }
    res.json({ images });
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: "Bild-KI nicht erreichbar oder Anfrage abgelehnt" });
  }
});

app.listen(process.env.PORT || 3100, () => console.log("Profil-Fabrik läuft"));
