# Nie mehr alleine – neue Oberfläche (Frontend-Entwurf)
=====================================================

Reines HTML/CSS/JavaScript, ohne Framework. Einfach index.html im Browser öffnen.

Dateien
- style.css   : komplettes Design (Farben als Variablen ganz oben)
- app.js      : Kopfzeile, Handy-Leiste, Demo-Daten, Coins-Zähler, Hilfsfunktionen
- *.html      : je eine Seite (Start, Login, Registrieren, Passwort, Übersicht, Suche,
                Profil, Chat, Postfach, Coins, Mein Profil, Einstellungen, Hilfe, Rechtliches)
- assets/     : Bilder

Für den Server-Entwickler
- Alle Daten sind Demo-Daten im Abschnitt "DATEN" in app.js (NMA.profiles, NMA.chats,
  NMA.mails, NMA.packs). Diese durch API-Aufrufe ersetzen.
- Coins und gesendete Mails liegen nur im localStorage des Browsers (NMA.store) – muss serverseitig werden.
- Chat: Antworten sind simuliert (fakeReply in chat.html). Für Live-Chat WebSocket o. Ä. anbinden;
  Kosten pro Nachricht: NMA.costPerChat.
- Coins kaufen: Knopf "Zahlungspflichtig bestellen" öffnet nur einen Hinweis – hier zum Zahlungsanbieter weiterleiten.
- Registrierung prüft das Alter (ab 18) nur im Browser – zusätzlich serverseitig prüfen.
- Handy-Benachrichtigungen (Einstellungen) brauchen Web-Push bzw. eine App-Hülle (PWA).
- Rechtliches: Platzhaltertexte, vom Betreiber zu ersetzen.

Bearbeitungsmodus (edit.js)
- Knopf "✎ Bearbeiten" unten links: Texte ändern, Elemente verschieben, Größe ziehen, ausblenden.
- Änderungen werden nur im jeweiligen Browser gespeichert. "Änderungen kopieren" liefert sie als Liste
  (Seite, Element, neuer Text/Position/Größe) zum Übernehmen in den Code.
- Für die Live-Seite edit.js entfernen oder nur für Admins laden.

App installieren (PWA)
- manifest.webmanifest, sw.js und die Icons in assets/ machen die Seite installierbar (Startbildschirm).
- Funktioniert nur über https auf eurer echten Domain (nicht in der Claude-Vorschau).
- Android/Chrome/Edge: Knopf "App installieren" öffnet den echten Installationsdialog.
  iPhone: Safari kann das nicht automatisch – der Knopf zeigt die Anleitung (Teilen → Zum Home-Bildschirm).
- Push-Benachrichtigungen bei neuen Nachrichten werden später im sw.js ergänzt (Server nötig).
