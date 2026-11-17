#!/usr/bin/env bash
# Baut die KUNDEN-Seite (für alle Kunden-Domains / Eingänge) – ohne Mitarbeiterbereich.
# Cloudflare Pages: Build command  "bash build-kunden.sh"   ·   Build output directory  "dist-kunden"
set -e
rm -rf dist-kunden && mkdir -p dist-kunden
cp index.html login.html register.html passwort.html uebersicht.html suche.html profil.html chat.html postfach.html \
   mein-profil.html einstellungen.html coins.html hilfe.html rechtliches.html app-installieren.html mitarbeiter-login.html \
   app.js eingaenge.js push.js lock.js photos.js sw.js style.css manifest.webmanifest \
   apple-touch-icon.png apple-touch-icon-precomposed.png dist-kunden/
cp -r assets dist-kunden/
# alte Adresse des Mitarbeiter-Logins führt auf den Kunden-Domains nur noch zur Kunden-Anmeldung
echo "Kunden-Seite gebaut: dist-kunden"
