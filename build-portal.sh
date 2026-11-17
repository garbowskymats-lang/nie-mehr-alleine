#!/usr/bin/env bash
# Baut das TEAM-PORTAL (eigene Domain, z. B. tippelclub.de) – ohne Kundenseiten und ohne Liste der Kunden-Domains.
# Cloudflare Pages (zweites Projekt): Build command  "bash build-portal.sh"   ·   Build output directory  "dist-portal"
set -e
rm -rf dist-portal && mkdir -p dist-portal
cp portal.html dist-portal/index.html
cp portal.html team.html app.js photos.js massenversand.js support.js kunden.js archiv.js feiertage.js style.css dist-portal/
cp -r assets dist-portal/
printf 'User-agent: *\nDisallow: /\n' > dist-portal/robots.txt
echo "Team-Portal gebaut: dist-portal"
