/*!
 * Seiten-Editor (bearbeiten.js)
 * Texte und Bilder direkt auf der Website bearbeiten und nach GitHub speichern.
 *
 * Einbinden (vor </body>):   <script src="bearbeiten.js"></script>
 * Starten:                   Seite mit ?bearbeiten aufrufen, z. B. https://meine-seite.de/?bearbeiten
 *
 * Besucher sehen nichts davon. Speichern nach GitHub geht nur mit deinem
 * persönlichen GitHub-Token, das nur in deinem Browser liegt.
 */
(function () {
  'use strict';
  if (window.__seitenEditor) return;
  window.__seitenEditor = true;

  var SETTINGS_KEY = 'seitenEditor.einstellungen';
  var SESSION_KEY = 'seitenEditor.aktiv';
  var MAX_BILDBREITE = 1920;
  var TEXT_SELECTOR = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,td,th,dt,dd,caption,a,button,label,span,small,strong,em,b,i,div';

  var state = {
    bearbeiten: false,
    geaendert: false,
    bilder: {},      // id -> { img, name, dataUrl }
    bildZaehler: 0
  };

  /* ---------- Hilfsfunktionen ---------- */

  function einstellungen() {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch (e) { return {}; }
  }
  function einstellungenSpeichern(s) {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch (e) {}
  }
  function istUi(el) { return !!(el && el.closest && el.closest('[data-be-ui]')); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }
  function geaendert() {
    state.geaendert = true;
    var z = document.getElementById('be-status');
    if (z) z.textContent = '● nicht gespeichert';
  }
  function gespeichert() {
    state.geaendert = false;
    var z = document.getElementById('be-status');
    if (z) z.textContent = '';
  }

  function sollStarten() {
    var q = location.search.slice(1).split('&');
    if (q.indexOf('bearbeiten') !== -1 || q.some(function (p) { return p.indexOf('bearbeiten=') === 0; })) {
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}
      return true;
    }
    if (location.hash === '#bearbeiten') return true;
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; }
  }

  /* ---------- Hinweis-Meldung ---------- */

  var toastTimer;
  function meldung(text, fehler) {
    var t = document.getElementById('be-toast');
    if (!t) { t = el('div', { id: 'be-toast', 'data-be-ui': '' }); document.body.appendChild(t); }
    t.textContent = text;
    t.className = fehler ? 'be-fehler be-sichtbar' : 'be-sichtbar';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = ''; }, fehler ? 7000 : 4000);
  }

  /* ---------- Fenster (Dialog) ---------- */

  function fenster(titel, inhalt, knoepfe) {
    var huelle = el('div', { 'class': 'be-huelle', 'data-be-ui': '' });
    var box = el('div', { 'class': 'be-fenster', role: 'dialog', 'aria-modal': 'true' });
    box.appendChild(el('h2', null, esc(titel)));
    var body = el('div', { 'class': 'be-inhalt' }, inhalt);
    box.appendChild(body);
    var leiste = el('div', { 'class': 'be-knopfreihe' });
    function schliessen() { huelle.remove(); }
    (knoepfe || []).forEach(function (k) {
      var b = el('button', { type: 'button', 'class': k.haupt ? 'be-haupt' : '' }, esc(k.text));
      b.addEventListener('click', function () {
        var r = k.klick ? k.klick(body, schliessen) : null;
        if (r !== false && !k.offenLassen) schliessen();
      });
      leiste.appendChild(b);
    });
    box.appendChild(leiste);
    huelle.appendChild(box);
    huelle.addEventListener('mousedown', function (e) { if (e.target === huelle) schliessen(); });
    document.body.appendChild(huelle);
    var erstes = body.querySelector('input,textarea');
    if (erstes) setTimeout(function () { erstes.focus(); }, 30);
    return { body: body, schliessen: schliessen };
  }

  /* ---------- Bearbeitungsmodus ---------- */

  function bearbeitbareElemente() {
    var liste = [];
    var alle = document.body.querySelectorAll(TEXT_SELECTOR);
    for (var i = 0; i < alle.length; i++) {
      var e = alle[i];
      if (istUi(e)) continue;
      if (e.closest('[data-be-edit]')) continue;              // Elternelement ist schon bearbeitbar
      if (e.closest('script,style,noscript,svg,template,iframe')) continue;
      if (!e.textContent.trim()) continue;
      if (e.tagName === 'DIV') {
        // DIV nur, wenn er direkt Text enthält und keine Block-Elemente
        var direkterText = Array.prototype.some.call(e.childNodes, function (n) {
          return n.nodeType === 3 && n.textContent.trim();
        });
        if (!direkterText || e.querySelector('div,p,ul,ol,table,section,article,h1,h2,h3,h4,h5,h6,img,video')) continue;
      }
      liste.push(e);
      e.setAttribute('data-be-edit', '');
    }
    return liste;
  }

  function bearbeitenAn() {
    state.bearbeiten = true;
    document.documentElement.classList.add('be-modus');
    bearbeitbareElemente().forEach(function (e) {
      e.setAttribute('contenteditable', 'true');
      e.setAttribute('spellcheck', 'true');
    });
    var k = document.getElementById('be-umschalter');
    if (k) { k.textContent = '✓ Fertig'; k.classList.add('be-an'); }
    meldung('Text anklicken zum Ändern – Bild anklicken zum Austauschen.');
  }

  function bearbeitenAus() {
    state.bearbeiten = false;
    document.documentElement.classList.remove('be-modus');
    document.querySelectorAll('[data-be-edit]').forEach(function (e) {
      e.removeAttribute('data-be-edit');
      e.removeAttribute('contenteditable');
      e.removeAttribute('spellcheck');
    });
    var k = document.getElementById('be-umschalter');
    if (k) { k.textContent = '✎ Bearbeiten'; k.classList.remove('be-an'); }
  }

  function ereignisseEinrichten() {
    // Links und Formulare im Bearbeitungsmodus nicht auslösen, Bilder öffnen den Bild-Dialog
    document.addEventListener('click', function (e) {
      if (!state.bearbeiten || istUi(e.target)) return;
      var img = e.target.closest && e.target.closest('img');
      if (img) { e.preventDefault(); e.stopPropagation(); bildDialog(img); return; }
      if (e.target.closest && e.target.closest('a,button,[onclick]')) { e.preventDefault(); }
    }, true);

    document.addEventListener('submit', function (e) {
      if (state.bearbeiten && !istUi(e.target)) e.preventDefault();
    }, true);

    document.addEventListener('input', function (e) {
      if (state.bearbeiten && e.target.closest && e.target.closest('[data-be-edit]')) geaendert();
    }, true);

    // Eingefügter Text immer ohne fremde Formatierung
    document.addEventListener('paste', function (e) {
      if (!state.bearbeiten || !e.target.closest || !e.target.closest('[data-be-edit]')) return;
      e.preventDefault();
      var text = (e.clipboardData || window.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, text);
    }, true);

    document.addEventListener('keydown', function (e) {
      // Enter = Zeilenumbruch statt neuer Kasten
      if (state.bearbeiten && e.key === 'Enter' && !e.shiftKey && e.target.closest && e.target.closest('[data-be-edit]')) {
        e.preventDefault();
        document.execCommand('insertLineBreak');
      }
      // Strg+S = Speichern
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        speichernDialog();
      }
      if (e.key === 'Escape') {
        var h = document.querySelector('.be-huelle');
        if (h) h.remove();
      }
    }, true);

    window.addEventListener('beforeunload', function (e) {
      if (state.geaendert) { e.preventDefault(); e.returnValue = ''; }
    });
  }

  /* ---------- Bilder ---------- */

  function dateiLesen(datei) {
    return new Promise(function (ok, fehler) {
      var r = new FileReader();
      r.onload = function () { ok(r.result); };
      r.onerror = fehler;
      r.readAsDataURL(datei);
    });
  }

  function verkleinern(dataUrl, typ) {
    return new Promise(function (ok) {
      if (!/^image\/(jpeg|png|webp)$/.test(typ)) return ok(dataUrl);
      var bild = new Image();
      bild.onload = function () {
        if (bild.naturalWidth <= MAX_BILDBREITE) return ok(dataUrl);
        var f = MAX_BILDBREITE / bild.naturalWidth;
        var c = document.createElement('canvas');
        c.width = MAX_BILDBREITE;
        c.height = Math.round(bild.naturalHeight * f);
        c.getContext('2d').drawImage(bild, 0, 0, c.width, c.height);
        ok(c.toDataURL(typ, 0.85));
      };
      bild.onerror = function () { ok(dataUrl); };
      bild.src = dataUrl;
    });
  }

  function dateiname(name, typ) {
    var endung = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg' })[typ] || 'jpg';
    var basis = (name || 'bild').replace(/\.[^.]+$/, '').toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'bild';
    var d = new Date();
    var stempel = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') +
      '-' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0') + String(d.getSeconds()).padStart(2, '0');
    return basis + '-' + stempel + '.' + endung;
  }

  function bildSetzen(img, src) {
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.removeAttribute('loading');
    if (img.parentElement && img.parentElement.tagName === 'PICTURE') {
      img.parentElement.querySelectorAll('source').forEach(function (s) { s.remove(); });
    }
    img.src = src;
  }

  function bildDialog(img) {
    var neu = null; // { dataUrl, name }
    var aktuell = img.currentSrc || img.src;
    var inhalt =
      '<div class="be-vorschau"><img id="be-bild-vorschau" alt="" src="' + esc(aktuell) + '"></div>' +
      '<label class="be-dateiknopf">📷 Neues Bild vom Computer/Handy wählen' +
      '<input type="file" id="be-bild-datei" accept="image/*" hidden></label>' +
      '<label>…oder Bild-Adresse (Link)<input type="text" id="be-bild-url" placeholder="https://…" value=""></label>' +
      '<label>Bildbeschreibung (für Blinde und Google)<input type="text" id="be-bild-alt" value="' + esc(img.getAttribute('alt') || '') + '"></label>';

    var f = fenster('Bild ändern', inhalt, [
      { text: 'Abbrechen' },
      {
        text: 'Übernehmen', haupt: true, klick: function (body) {
          var url = body.querySelector('#be-bild-url').value.trim();
          var alt = body.querySelector('#be-bild-alt').value;
          if (neu) {
            var id = img.getAttribute('data-be-img') || ('b' + (++state.bildZaehler));
            img.setAttribute('data-be-img', id);
            state.bilder[id] = { img: img, name: neu.name, dataUrl: neu.dataUrl };
            bildSetzen(img, neu.dataUrl);
          } else if (url) {
            var alteId = img.getAttribute('data-be-img');
            if (alteId) { delete state.bilder[alteId]; img.removeAttribute('data-be-img'); }
            bildSetzen(img, url);
          }
          var altGeaendert = alt !== (img.getAttribute('alt') || '');
          if (altGeaendert) img.setAttribute('alt', alt);
          if (neu || url || altGeaendert) geaendert();
        }
      }
    ]);

    f.body.querySelector('#be-bild-datei').addEventListener('change', function (e) {
      var datei = e.target.files && e.target.files[0];
      if (!datei) return;
      if (!/^image\//.test(datei.type)) { meldung('Das ist keine Bilddatei.', true); return; }
      dateiLesen(datei).then(function (d) { return verkleinern(d, datei.type); }).then(function (d) {
        var typ = (d.match(/^data:([^;]+);/) || [])[1] || datei.type;
        neu = { dataUrl: d, name: dateiname(datei.name, typ) };
        f.body.querySelector('#be-bild-vorschau').src = d;
        f.body.querySelector('#be-bild-url').value = '';
      });
    });
  }

  /* ---------- Seite als HTML erzeugen ---------- */

  function seitenHtml(bildPfade) {
    var kopie = document.documentElement.cloneNode(true);
    kopie.querySelectorAll('[data-be-ui]').forEach(function (n) { n.remove(); });
    kopie.querySelectorAll('[data-be-edit]').forEach(function (n) {
      n.removeAttribute('data-be-edit');
      n.removeAttribute('contenteditable');
      n.removeAttribute('spellcheck');
    });
    kopie.querySelectorAll('[data-be-img]').forEach(function (n) {
      var id = n.getAttribute('data-be-img');
      if (bildPfade && bildPfade[id]) n.setAttribute('src', bildPfade[id]);
      n.removeAttribute('data-be-img');
    });
    kopie.classList.remove('be-modus');
    if (!kopie.getAttribute('class')) kopie.removeAttribute('class');

    var dt = document.doctype;
    var doctype = dt
      ? '<!DOCTYPE ' + dt.name + (dt.publicId ? ' PUBLIC "' + dt.publicId + '"' : '') + (dt.systemId ? ' "' + dt.systemId + '"' : '') + '>'
      : '<!DOCTYPE html>';
    return doctype + '\n' + kopie.outerHTML + '\n';
  }

  /* ---------- GitHub ---------- */

  function base64Text(text) {
    var bytes = new TextEncoder().encode(text);
    var bin = '';
    for (var i = 0; i < bytes.length; i += 0x8000) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(bin);
  }

  function pfadKodieren(p) { return p.split('/').map(encodeURIComponent).join('/'); }

  function github(methode, pfad, daten) {
    var s = einstellungen();
    var url = 'https://api.github.com/repos/' + encodeURIComponent(s.besitzer) + '/' + encodeURIComponent(s.repo) + pfad;
    var opt = {
      method: methode,
      cache: 'no-store',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': 'Bearer ' + s.token,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    };
    if (daten) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(daten); }
    return fetch(url, opt).then(function (r) {
      return r.text().then(function (t) {
        var j = null;
        try { j = t ? JSON.parse(t) : null; } catch (e) {}
        return { status: r.status, ok: r.ok, daten: j };
      });
    });
  }

  function githubFehler(antwort) {
    var s = antwort.status;
    if (s === 401) return 'GitHub lehnt das Token ab (abgelaufen oder falsch). Bitte unter ⚙ Einstellungen neu eintragen.';
    if (s === 403) return 'Das Token hat keine Schreibrechte für dieses Repository (Rechte: „Contents: Read and write“).';
    if (s === 404) return 'Repository oder Branch nicht gefunden. Bitte ⚙ Einstellungen prüfen.';
    if (s === 409) return 'Die Datei wurde zwischenzeitlich auf GitHub geändert. Seite neu laden und nochmal bearbeiten.';
    if (s === 422) return 'GitHub hat die Daten abgelehnt (' + ((antwort.daten && antwort.daten.message) || 'unbekannt') + ').';
    return 'Fehler bei GitHub (' + s + '): ' + ((antwort.daten && antwort.daten.message) || 'keine Verbindung');
  }

  function dateiHochladen(pfad, base64Inhalt, nachricht) {
    var s = einstellungen();
    var branch = s.branch || 'main';
    var adresse = '/contents/' + pfadKodieren(pfad);
    return github('GET', adresse + '?ref=' + encodeURIComponent(branch)).then(function (r) {
      if (!r.ok && r.status !== 404) throw new Error(githubFehler(r));
      var daten = { message: nachricht, content: base64Inhalt, branch: branch };
      if (r.ok && r.daten && r.daten.sha) daten.sha = r.daten.sha;
      return github('PUT', adresse, daten);
    }).then(function (r) {
      if (!r.ok) throw new Error(githubFehler(r));
      return r.daten;
    });
  }

  function vermuteterPfad() {
    var s = einstellungen();
    var p = decodeURIComponent(location.pathname).replace(/^\/+/, '');
    if (location.protocol === 'file:') {
      // Lokal geöffnet: nur der Dateiname zählt (liegt im Repository ganz oben)
      return p.split('/').pop() || 'index.html';
    }
    var basis = (s.basisPfad || '').replace(/^\/+|\/+$/g, '');
    if (!basis && /\.github\.io$/i.test(location.hostname) && s.repo && !/\.github\.io$/i.test(s.repo)) {
      basis = s.repo; // Projektseite: besitzer.github.io/repo/...
    }
    if (basis && (p === basis || p.indexOf(basis + '/') === 0)) p = p.slice(basis.length).replace(/^\/+/, '');
    if (p === '' || /\/$/.test(p)) p += 'index.html';
    else if (!/\.[a-z0-9]{2,5}$/i.test(p)) p += '.html';
    return p;
  }

  function einstellungenFehlen() {
    var s = einstellungen();
    return !(s.besitzer && s.repo && s.token);
  }

  /* ---------- Speichern ---------- */

  function speichernDialog() {
    if (einstellungenFehlen()) {
      meldung('Bitte zuerst GitHub unter ⚙ Einstellungen verbinden.', true);
      einstellungenDialog(speichernDialog);
      return;
    }
    var s = einstellungen();
    var anzahlBilder = Object.keys(state.bilder).length;
    var inhalt =
      '<p>Speichert die Seite in <b>' + esc(s.besitzer + '/' + s.repo) + '</b> (Branch <b>' + esc(s.branch || 'main') + '</b>).' +
      (anzahlBilder ? ' Dazu ' + anzahlBilder + ' neue(s) Bild(er) im Ordner „bilder“.' : '') + '</p>' +
      '<label>Datei im Repository<input type="text" id="be-pfad" value="' + esc(vermuteterPfad()) + '"></label>' +
      '<label>Was wurde geändert? (kurz)<input type="text" id="be-nachricht" value="Seite bearbeitet"></label>';

    fenster('Auf GitHub speichern', inhalt, [
      { text: 'Abbrechen' },
      {
        text: 'Jetzt speichern', haupt: true, klick: function (body, schliessen) {
          var pfad = body.querySelector('#be-pfad').value.trim().replace(/^\/+/, '');
          var nachricht = body.querySelector('#be-nachricht').value.trim() || 'Seite bearbeitet';
          if (!pfad) { meldung('Bitte den Dateipfad angeben.', true); return false; }
          schliessen();
          aufGithubSpeichern(pfad, nachricht);
        }
      }
    ]);
  }

  function aufGithubSpeichern(pfad, nachricht) {
    var knopf = document.getElementById('be-speichern');
    if (knopf) { knopf.disabled = true; knopf.textContent = '⏳ Speichere…'; }
    meldung('Speichere auf GitHub…');

    var ordner = pfad.indexOf('/') !== -1 ? pfad.slice(0, pfad.lastIndexOf('/') + 1) : '';
    var ids = Object.keys(state.bilder);
    var bildPfade = {};

    // Bilder nacheinander hochladen, danach die Seite
    var kette = Promise.resolve();
    ids.forEach(function (id) {
      kette = kette.then(function () {
        var b = state.bilder[id];
        var base64 = b.dataUrl.split(',')[1];
        return dateiHochladen(ordner + 'bilder/' + b.name, base64, 'Bild hinzugefügt: ' + b.name).then(function () {
          bildPfade[id] = 'bilder/' + b.name;
        });
      });
    });

    kette.then(function () {
      return dateiHochladen(pfad, base64Text(seitenHtml(bildPfade)), nachricht);
    }).then(function () {
      ids.forEach(function (id) {
        var b = state.bilder[id];
        if (b && b.img) b.img.removeAttribute('data-be-img');
      });
      state.bilder = {};
      gespeichert();
      meldung(location.protocol === 'file:'
        ? '✓ Auf GitHub gespeichert! Achtung: Die Datei hier auf dem Rechner bleibt die alte – nicht neu laden, sonst sind die Änderungen hier weg (bei GitHub sind sie gespeichert).'
        : '✓ Gespeichert! Die Live-Seite ist in ca. 1–2 Minuten aktuell.');
    }).catch(function (fehler) {
      meldung(fehler.message || String(fehler), true);
    }).then(function () {
      if (knopf) { knopf.disabled = false; knopf.textContent = '💾 Speichern'; }
    });
  }

  function herunterladen() {
    var html = seitenHtml(null); // neue Bilder bleiben eingebettet
    var name = vermuteterPfad().split('/').pop() || 'index.html';
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var a = el('a', { href: URL.createObjectURL(blob), download: name, 'data-be-ui': '' });
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    meldung('„' + name + '“ heruntergeladen – diese Datei kannst du bei GitHub hochladen.');
  }

  /* ---------- Einstellungen ---------- */

  function einstellungenDialog(danach) {
    var s = einstellungen();
    var inhalt =
      '<p>Einmalig ausfüllen. Die Angaben bleiben nur in <b>diesem</b> Browser gespeichert – ' +
      'nur auf dem eigenen Rechner/Handy verwenden.</p>' +
      '<label>GitHub-Benutzername (oder Organisation)<input type="text" id="be-besitzer" value="' + esc(s.besitzer || '') + '" placeholder="z. B. dgarbowsky"></label>' +
      '<label>Repository (Name des Projekts)<input type="text" id="be-repo" value="' + esc(s.repo || '') + '" placeholder="z. B. meine-website"></label>' +
      '<label>Branch<input type="text" id="be-branch" value="' + esc(s.branch || 'main') + '"></label>' +
      '<label>Token (Zugangsschlüssel) <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">→ neues Token erstellen</a>' +
      '<input type="text" id="be-token" name="be-schluessel-' + Date.now() + '" value="' + esc(s.token || '') + '" placeholder="github_pat_…" autocomplete="off" autocapitalize="off" spellcheck="false" data-lpignore="true" style="font-family:monospace;font-size:13px"></label>' +
      '<p id="be-token-info" style="font-size:13px;margin-top:-6px"></p>' +
      '<details><summary>Erweitert</summary>' +
      '<label>Unterordner der Seite in der Adresse (meist leer lassen)<input type="text" id="be-basis" value="' + esc(s.basisPfad || '') + '"></label>' +
      '</details>';

    function tokenPruefen(t) {
      if (!t) return 'Das Feld Token ist leer.';
      if (!/^(github_pat_|ghp_)/.test(t)) return 'Im Feld steht kein GitHub-Schlüssel. Er muss mit „github_pat_“ beginnen.';
      if (t.indexOf('github_pat_') === 0 && t.length < 80) return 'Der Schlüssel ist zu kurz (' + t.length + ' Zeichen) – wahrscheinlich nicht ganz kopiert.';
      return '';
    }

    function lesen(body) {
      return {
        besitzer: body.querySelector('#be-besitzer').value.trim(),
        repo: body.querySelector('#be-repo').value.trim(),
        branch: body.querySelector('#be-branch').value.trim() || 'main',
        token: body.querySelector('#be-token').value.trim(),
        basisPfad: body.querySelector('#be-basis').value.trim()
      };
    }

    var f = fenster('⚙ GitHub verbinden', inhalt, [
      {
        text: 'Abmelden', klick: function () {
          try { localStorage.removeItem(SETTINGS_KEY); } catch (e) {}
          meldung('GitHub-Verbindung in diesem Browser gelöscht.');
        }
      },
      {
        text: 'Verbindung testen', offenLassen: true, klick: function (body) {
          var werte = lesen(body);
          var problem = tokenPruefen(werte.token);
          if (problem) { meldung(problem, true); return; }
          einstellungenSpeichern(werte);
          meldung('Teste Verbindung…');
          github('GET', '').then(function (r) {
            if (!r.ok) return meldung(githubFehler(r), true);
            var darf = r.daten && r.daten.permissions && r.daten.permissions.push;
            meldung(darf ? '✓ Verbindung klappt – Speichern ist möglich.' : 'Verbunden, aber ohne Schreibrecht.', !darf);
          }).catch(function () { meldung('Keine Verbindung zu GitHub.', true); });
        }
      },
      {
        text: 'Speichern', haupt: true, klick: function (body) {
          var neu = lesen(body);
          if (!neu.besitzer || !neu.repo || !neu.token) { meldung('Bitte Benutzername, Repository und Token ausfüllen.', true); return false; }
          var problem = tokenPruefen(neu.token);
          if (problem) { meldung(problem, true); return false; }
          einstellungenSpeichern(neu);
          meldung('Einstellungen gespeichert.');
          if (typeof danach === 'function') setTimeout(danach, 50);
        }
      }
    ]);

    var tokenFeld = f.body.querySelector('#be-token');
    var tokenInfo = f.body.querySelector('#be-token-info');
    function infoAktualisieren() {
      var t = tokenFeld.value.trim();
      var problem = t ? tokenPruefen(t) : '';
      tokenInfo.style.color = problem ? '#b42318' : '#1e9e5a';
      tokenInfo.textContent = !t ? '' : (problem || '✓ Sieht nach einem GitHub-Schlüssel aus (' + t.length + ' Zeichen).');
    }
    tokenFeld.addEventListener('input', infoAktualisieren);
    infoAktualisieren();
  }

  /* ---------- Werkzeugleiste ---------- */

  function stilEinfuegen() {
    var css =
      '.be-modus [data-be-edit]{outline:1px dashed rgba(224,161,0,.55);outline-offset:2px;cursor:text}' +
      '.be-modus [data-be-edit]:hover{outline:2px dashed #e0a100}' +
      '.be-modus [data-be-edit]:focus{outline:2px solid #e0a100;background:rgba(255,215,0,.08)}' +
      '.be-modus img:not([data-be-ui] img){cursor:pointer;outline:2px dashed rgba(30,120,220,.6);outline-offset:-2px}' +
      '.be-modus img:not([data-be-ui] img):hover{outline:3px solid #1e78dc}' +
      '#be-leiste,#be-leiste *,.be-huelle,.be-huelle *,#be-toast{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;letter-spacing:normal;text-transform:none}' +
      '#be-leiste{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483000;display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:center;' +
      'background:#1f2933;color:#fff;padding:8px;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.35);max-width:calc(100vw - 16px)}' +
      '#be-leiste button{border:0;border-radius:9px;padding:10px 14px;font-size:15px;font-weight:600;cursor:pointer;background:#3a4754;color:#fff;line-height:1.1;margin:0}' +
      '#be-leiste button:hover{background:#4b5b6b}#be-leiste button:disabled{opacity:.6;cursor:wait}' +
      '#be-leiste button.be-an{background:#e0a100;color:#1f2933}' +
      '#be-leiste #be-speichern{background:#1e9e5a}#be-leiste #be-speichern:hover{background:#22b466}' +
      '#be-status{font-size:13px;color:#ffd166;padding:0 6px;white-space:nowrap}#be-status:empty{display:none}' +
      '#be-toast{position:fixed;left:50%;bottom:86px;transform:translateX(-50%) translateY(10px);z-index:2147483600;background:#111;color:#fff;padding:12px 18px;border-radius:10px;font-size:15px;' +
      'max-width:min(560px,calc(100vw - 24px));text-align:center;opacity:0;pointer-events:none;transition:all .2s;box-shadow:0 6px 20px rgba(0,0,0,.3)}' +
      '#be-toast.be-sichtbar{opacity:1;transform:translateX(-50%) translateY(0)}#be-toast.be-fehler{background:#b42318}' +
      '.be-huelle{position:fixed;inset:0;z-index:2147483002;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:12px}' +
      '.be-fenster{background:#fff;color:#1f2933;border-radius:14px;width:100%;max-width:480px;max-height:calc(100vh - 24px);overflow:auto;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.4);text-align:left}' +
      '.be-fenster h2{margin:0 0 12px;font-size:20px;font-weight:700;color:#1f2933}' +
      '.be-fenster p{margin:0 0 12px;font-size:14px;line-height:1.45;color:#334}' +
      '.be-fenster label{display:block;margin:0 0 12px;font-size:14px;font-weight:600;color:#1f2933}' +
      '.be-fenster label a{font-weight:400;color:#1e78dc}' +
      '.be-fenster input[type=text],.be-fenster input[type=password]{display:block;width:100%;margin-top:4px;padding:10px;font-size:16px;border:1px solid #c5ccd3;border-radius:8px;color:#1f2933;background:#fff}' +
      '.be-fenster details{margin:0 0 12px;font-size:14px}.be-fenster summary{cursor:pointer;margin-bottom:8px}' +
      '.be-vorschau{background:#f1f3f5;border-radius:10px;padding:8px;margin-bottom:12px;text-align:center}' +
      '.be-vorschau img{max-width:100%;max-height:220px;object-fit:contain;display:inline-block}' +
      '.be-dateiknopf{background:#1e78dc;color:#fff!important;text-align:center;padding:12px;border-radius:9px;cursor:pointer}' +
      '.be-knopfreihe{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:8px}' +
      '.be-knopfreihe button{border:1px solid #c5ccd3;background:#fff;color:#1f2933;border-radius:9px;padding:10px 14px;font-size:15px;font-weight:600;cursor:pointer}' +
      '.be-knopfreihe button.be-haupt{background:#1e9e5a;border-color:#1e9e5a;color:#fff}';
    document.head.appendChild(el('style', { 'data-be-ui': '' }, css));
  }

  function leisteBauen() {
    var leiste = el('div', { id: 'be-leiste', 'data-be-ui': '' });
    leiste.innerHTML =
      '<button type="button" id="be-umschalter" title="Bearbeitungsmodus an/aus">✎ Bearbeiten</button>' +
      '<button type="button" id="be-speichern" title="Auf GitHub speichern (Strg+S)">💾 Speichern</button>' +
      '<button type="button" id="be-download" title="Seite als HTML-Datei herunterladen">⬇ Datei</button>' +
      '<button type="button" id="be-verwerfen" title="Änderungen verwerfen">↺</button>' +
      '<button type="button" id="be-einstellungen" title="GitHub-Verbindung">⚙</button>' +
      '<button type="button" id="be-beenden" title="Editor schließen">✕</button>' +
      '<span id="be-status"></span>';
    document.body.appendChild(leiste);

    leiste.querySelector('#be-umschalter').onclick = function () { state.bearbeiten ? bearbeitenAus() : bearbeitenAn(); };
    leiste.querySelector('#be-speichern').onclick = speichernDialog;
    leiste.querySelector('#be-download').onclick = herunterladen;
    leiste.querySelector('#be-einstellungen').onclick = function () { einstellungenDialog(); };
    leiste.querySelector('#be-verwerfen').onclick = function () {
      if (!state.geaendert) return meldung('Es gibt keine ungespeicherten Änderungen.');
      if (confirm('Alle ungespeicherten Änderungen verwerfen?')) { state.geaendert = false; location.reload(); }
    };
    leiste.querySelector('#be-beenden').onclick = function () {
      if (state.geaendert && !confirm('Es gibt ungespeicherte Änderungen. Trotzdem schließen?')) return;
      state.geaendert = false;
      try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
      var url = location.href.replace(/([?&])bearbeiten(=[^&#]*)?(&|(?=#)|$)/, function (m, a, b, c) { return c === '&' ? a : ''; }).replace(/#bearbeiten$/, '');
      location.href = url;
    };
  }

  /* ---------- Start ---------- */

  function starten() {
    if (!sollStarten()) return;
    stilEinfuegen();
    leisteBauen();
    ereignisseEinrichten();
    if (einstellungenFehlen()) meldung('Editor aktiv. Tipp: Unter ⚙ einmal GitHub verbinden, dann speichert 💾 direkt.');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', starten);
  else starten();
})();
