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


App installieren (PWA)
- manifest.webmanifest, sw.js und die Icons in assets/ machen die Seite installierbar (Startbildschirm).
- Funktioniert nur über https auf eurer echten Domain (nicht in der Claude-Vorschau).
- Android/Chrome/Edge: Knopf "App installieren" öffnet den echten Installationsdialog.
  iPhone: Safari kann das nicht automatisch – der Knopf zeigt die Anleitung (Teilen → Zum Home-Bildschirm).
- Push-Benachrichtigungen bei neuen Nachrichten werden später im sw.js ergänzt (Server nötig).
- app-installieren.html: Anleitung getrennt nach Android, iPhone/iPad, PC – inkl. Hinweis, dass Firefox am PC nicht installieren kann.

Mitarbeiterbereich
- mitarbeiter-login.html → team.html: Statistik (Nachrichten, Antwortzeiten, Auslastung nach Uhrzeit)
  und Mitarbeiterverwaltung (anlegen, bearbeiten, sperren, Rollen Admin/Moderator).
- Posteingang: wartende Kundennachrichten (älteste zuerst, Wartezeit farbig), Antwort als Profil,
  Kunden-Infos + gemeinsame Notizen, Profil-Infos. Moderator sieht nur seine eigene Warteschlange, der Chef alle.
- Statistik je Rolle: Moderator sieht nur eigene Nachrichten, Antwortzeit, Warteschlange und Uhrzeit-Verteilung
  seiner Profile. Nur der Chef sieht "Mitarbeiter online", Nachrichten und Antwortzeit pro Mitarbeiter.
- Reiter "Verläufe": nur für Admins, zusätzlich mit Admin-Code geschützt; zeigt Chatverläufe mit dem Namen
  des Mitarbeiters an jeder Antwort. Zugriffe werden protokolliert (serverseitig umsetzen!).
- Alles Demo-Daten; Login, Rollenrechte und Zahlen müssen serverseitig umgesetzt werden.

Stand 16.11.2026 – Mitarbeiterbereich erweitert
- Grundregel: Kunden sehen und schreiben NUR mit den angelegten Profilen. Kunden sehen niemals andere Kunden
  und können nie miteinander schreiben. Der Server darf Kunden-Konten nie in Suche/Chat ausliefern.
- Meine Profile: Jedes Profil gehört genau einem Mitarbeiter (Feld owner). Nur dieser schreibt damit.
  Gruppiert nach Frau/Mann × Beziehung/Abenteuer. Nur der Chef (Admin) kann Profile verschieben – zu einem
  anderen Mitarbeiter oder zu sich. Profilnamen sind einmalig (auch gegenüber Kunden-Nicknames).
- Nachrichten: Ordner Ungelesen / Gelesen / Gesendet / ♥ Herzchen, Filter Rubrik Beziehung/Abenteuer.
  Kopf zeigt Kunden-Nr., Status T (Tester) / K (Kunde, hat bezahlt) und Coins.
- Herzchen: Kunde kann max. 5 Herzen pro Tag verschicken (serverseitig erzwingen!). Das Herz landet beim
  Mitarbeiter, dem das Profil gehört ("hat dir ein Herzchen geschickt") – er kann den Kunden anschreiben.
- Vorlagen: fortlaufende Nummer (V-001 …). Das System speichert, welcher Kunde welche Vorlage bekommen hat,
  und blockiert dieselbe Vorlage an denselben Kunden – auch von anderen Profilen und auch, wenn der Text
  per Hand eingefügt wird. Serverseitig ebenfalls prüfen.

Stand 16.11.2026 – Massenversand (massenversand.js, Reiter „📣 Massenversand“ in team.html)
- Zielgruppen (früher WAA/WAB/WABF/WA-Testmitglied):
  Abenteuer · Männer (Frauen-Profile Abenteuer schreiben Männer an, die Abenteuer suchen) ·
  Beziehung · Frau sucht Mann · Beziehung · Mann sucht Frau ·
  Testmitglieder (alle Registrierten, die noch nie gekauft haben; es schreibt das andere Geschlecht).
- Ablauf: Zielgruppe → Text/Massenvorlage (Platzhalter {name}, {profil}, {ort}) → Empfänger (alle / nur Tester /
  nur zahlende) + Umkreis → Vorschau mit Zuordnung Kunde → Profil + Entfernung → senden.
- Profil-Zuordnung: für jeden Kunden das nächstgelegene passende Profil (PLZ), das ihn noch nie angeschrieben hat
  (keine Massennachricht, keine normale Nachricht, kein Chat). Optional: kein Profil im Umkreis → nächstes nehmen.
- Rechte pro Mitarbeiter (nur Chef, unter „Rechte & Regeln“ oder Mitarbeiter → Bearbeiten):
  Nicht erlaubt / Mit Kontrolle (jede Aussendung geht erst in „Freigaben“ an den Chef) / Selbstständig.
  Moderatoren schreiben nur mit ihren eigenen Profilen, der Chef mit allen. Antworten landen beim Profil-Besitzer.
- Regeln: Pause pro Kunde (z. B. höchstens 1 Massennachricht pro Tag), dieselbe Massenvorlage (M-…) nie zweimal
  an denselben Kunden. Aussendungen haben Nummern (A-…) und stehen im Verlauf (wer, wann, wie viele, wer freigegeben hat).
- Profile haben jetzt ein Feld PLZ. Entfernungen in der Demo sind Näherungen über die ersten 2 Stellen der PLZ.
- SERVER: Empfänger serverseitig berechnen (echte PLZ-Geodaten), Rechte und Pause serverseitig prüfen,
  Versand als Hintergrund-Job, Nachrichten in Postfach/Chat der Kunden zustellen. Profile müssen für Kunden
  als moderierte Profile gekennzeichnet bleiben (AGB/Hinweis).

GEPLANT (Konzept 16.11.2026) – Wohnort der Profile pro Kunde („Kontakt-Ort“)
- Ziel: Ein Profil wohnt für JEDEN Kunden fest in dessen Nähe – Susi für den Berliner Kunden in Spandau,
  für den Münchner Kunden in Dachau – und bleibt dort für diesen Kunden für immer.
- Pflichtangaben bei der Registrierung (schon vorhanden): PLZ, Umkreis, wer sucht wen, Beziehung/Abenteuer.
- Neue Tabelle kontakt_ort (profil_id, kunde_id, ort, plz, entfernung_km, festgelegt_am).
  Beim ERSTEN Mal, wenn ein Kunde ein Profil sieht oder von ihm angeschrieben wird (Suche, Profilseite, Herz,
  Massenversand, Chat), würfelt der Server einen echten Ort im Umkreis des Kunden (mind. 5 km, höchstens sein
  gewählter Umkreis) und speichert ihn. Danach wird für dieses Paar immer genau dieser Ort angezeigt.
- Moderator sieht im Chat rechts „Wohnt für diesen Kunden in: Spandau (12 km)“, damit er nicht danebenliegt.
- Umzug des Kunden: festgelegte Orte bleiben (Hinweis für den Moderator), nur neue Kontakte bekommen den neuen Raum.
- Profiltexte ortsneutral schreiben oder Platzhalter {ort} verwenden; keine festen Städte im „Über mich“.
- Massenversand: Umkreis-Suche nach Profil-PLZ entfällt. Es schreiben passende Profile, die den Kunden noch nie
  angeschrieben haben (gleichmäßig verteilt); der Ort wird dabei wie oben im Umkreis des Kunden festgelegt.
- Ortsdaten: OpenPLZ / OpenGeoDB (PLZ, Ortsname, Koordinaten).
- AGB/Hinweis muss ausdrücklich sagen, dass Angaben der Profile (auch der Wohnort) erfunden sind und Treffen nicht möglich sind.

Stand 16.11.2026 – Registrierung, Vorname, Support
- Pflichtangaben bei der Registrierung: Nickname (einmalig), Vorname (nur Buchstaben, mind. 2), E-Mail, Passwort,
  wer sucht wen, Beziehung/Abenteuer, Geburtsdatum (ab 18), PLZ + Umkreis.
- Nickname und Vorname kann der Kunde NICHT selbst ändern (Mein Profil zeigt sie gesperrt) – nur der Admin im
  Mitarbeiterbereich unter „🛟 Support“. Server: Änderungen protokollieren, Nickname-Eindeutigkeit serverseitig prüfen.
- Support: Kunde schreibt unter „Hilfe & Kontakt“ kostenlos (keine Coins), sieht dort seine Anfragen und Antworten.
  Admin-Reiter „🛟 Support“: offene/erledigte Anfragen, antworten, Namen ändern. (support.js)
- Massenversand: neuer Platzhalter {vorname}.
- Hilfe-FAQ: Hinweis „Profile werden von Moderatoren geführt, Angaben (auch Wohnort) erfunden, Treffen nicht möglich“.

GEPLANT – Profile wachsen mit den Regionen („Region aufbauen“)
- Profil-Pool: viele Blanko-Profile (Bild + Alter + Rubrik + Grundtext, noch ohne Ort). Bilder nur mit
  Nutzungsrechten (lizenzierte Fotos mit Model-Release oder KI-generiert) – nie Fotos echter Privatpersonen.
  KI-Bilder: Kennzeichnungspflichten (EU-KI-Verordnung) vom Anwalt prüfen lassen.
- Admin sieht neue Registrierungen nach PLZ-Bereich und klickt „Region aufbauen“: PLZ-Bereich, Anzahl, Altersklasse,
  Rubrik (z. B. 20 × Frauen 50–60 · Abenteuer). Das System nimmt Profile aus dem Pool, gibt ihnen echte Orte im
  Umkreis (5 km bis Kunden-Umkreis), teilt sie Mitarbeitern zu und schaltet sie stückweise frei (z. B. 5 pro Tag).
- KI darf Profiltexte als Entwurf vorschlagen (Mitarbeiter prüft). Grundlage: Region, Altersklasse, Rubrik –
  NICHT das persönliche Profil eines einzelnen Kunden.
- Zusammen mit „Kontakt-Ort“ (oben): einmal festgelegte Orte bleiben für den jeweiligen Kunden gleich.
