/* =====================================================================
   APP-SPERRE: Fingerabdruck (Handy/Tablet) oder 6-stellige PIN (PC)
   - Wird die App/der Browser komplett geschlossen, ist man beim nächsten Öffnen gesperrt.
     (Merker im sessionStorage – der verschwindet beim Schließen.)
   - Entsperren: Fingerabdruck/Gesichtserkennung über einen Passkey (WebAuthn) auf Handy und Tablet,
     am PC mit der 6-stelligen PIN. Die PIN geht als Ersatz immer.
   - Nach der Registrierung wird die Sperre einmal eingerichtet (PIN festlegen, auf dem Handy Fingerabdruck).
   - 5× falsche PIN → abgemeldet, Anmeldung mit Passwort nötig. „PIN vergessen?“ → Anmeldung mit Passwort,
     danach neue PIN festlegen.
   SERVER: Passkey beim Server registrieren und die Signatur beim Entsperren prüfen (z. B. @simplewebauthn/server);
   PIN nur als Hash (argon2/bcrypt) speichern, Fehlversuche serverseitig zählen.
   ===================================================================== */
(() => {
  const S = NMA.store, LOCK = "lock", SESS = "nma_unlocked";
  const pg = (document.body && document.body.dataset.page) || "";
  const ss = { get: () => { try { return sessionStorage.getItem(SESS) === "1"; } catch (e) { return true; } }, set: v => { try { v ? sessionStorage.setItem(SESS, "1") : sessionStorage.removeItem(SESS); } catch (e) {} } };
  const isTouch = matchMedia("(pointer: coarse)").matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const unb64 = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), c => c.charCodeAt(0));
  const rand = n => crypto.getRandomValues(new Uint8Array(n));
  const hash = async (pin, salt) => {
    try { const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + ":" + pin)); return b64(d); }
    catch (e) { let h = 0; for (const c of salt + pin) h = (h * 33 + c.charCodeAt(0)) >>> 0; return "x" + h; }   /* nur Vorschau ohne https */
  };
  const bioAvailable = async () => {
    if (!isTouch || !window.PublicKeyCredential || !PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) return false;
    try { return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(); } catch (e) { return false; }
  };

  /* Wo gilt die Sperre? Mitgliederbereich (nicht Startseite, Anmeldung, Registrierung, Rechtliches, Team) */
  const guarded = /^(uebersicht|suche|profil|chat|postfach|mein-profil|einstellungen|coins|hilfe|app-installieren)$/.test(pg);

  /* Anmeldung/Registrierung → für diese Sitzung entsperrt */
  if (pg === "login" || pg === "register") return;

  const css = document.createElement("style");
  css.textContent = `
  .lock{position:fixed;inset:0;z-index:9999;background:radial-gradient(circle at 50% 0%,#0f2a2b,#071012 60%);display:grid;place-items:center;padding:20px;overflow:auto}
  .lock-box{width:min(380px,100%);text-align:center;display:grid;gap:14px}
  .lock-box .brand-i{width:64px;height:64px;margin:0 auto;display:grid;place-items:center;border-radius:50%;font-size:28px;color:#0a1416;background:linear-gradient(145deg,var(--gold),#b9853f)}
  .lock-box h2{font-size:26px;margin:0}.lock-box p{margin:0;color:var(--muted)}
  .lock-dots{display:flex;gap:14px;justify-content:center;margin:6px 0}
  .lock-dots i{width:16px;height:16px;border-radius:50%;border:2px solid var(--accent);display:block}
  .lock-dots i.on{background:var(--accent)}
  .lock-dots.shake{animation:lkshake .35s}
  @keyframes lkshake{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
  .lock-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:4px}
  .lock-pad button{width:72px;height:72px;border-radius:50%;justify-self:center;border:1px solid var(--line);background:#ffffff0a;color:var(--ink);font:600 26px/1 var(--sans);cursor:pointer}
  .lock-pad button:active{background:#21d4c333}
  .lock-pad button.ghost{border:0;background:transparent;font-size:22px}
  .lock-msg{min-height:22px;font-size:14px}.lock-msg.bad{color:var(--danger)}
  .lock-bio{display:flex;align-items:center;justify-content:center;gap:10px;font-size:17px}
  .lock-link{background:none;border:0;color:var(--accent);font:inherit;font-size:14px;cursor:pointer;text-decoration:underline;padding:6px}
  @media(prefers-reduced-motion:reduce){.lock-dots.shake{animation:none}}
  `;
  document.head.appendChild(css);

  /* ---------- PIN-Feld mit Zahlentasten (auch Tastatur am PC) ---------- */
  const pinUI = (host, { onDone, bioBtn }) => {
    let pin = "";
    host.insertAdjacentHTML("beforeend", `<div class="lock-dots" aria-hidden="true">${"<i></i>".repeat(6)}</div>
      <div class="lock-msg" role="status"></div>
      <div class="lock-pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button type="button" data-k="${n}" aria-label="${n}">${n}</button>`).join("")}
        ${bioBtn ? `<button type="button" class="ghost" data-bio aria-label="Mit Fingerabdruck entsperren">☝</button>` : "<span></span>"}<button type="button" data-k="0" aria-label="0">0</button><button type="button" class="ghost" data-del aria-label="Löschen">⌫</button></div>`);
    const dots = host.querySelector(".lock-dots"), msg = host.querySelector(".lock-msg");
    const draw = () => dots.querySelectorAll("i").forEach((d, i) => d.classList.toggle("on", i < pin.length));
    const add = k => { if (pin.length >= 6) return; pin += k; draw(); if (pin.length === 6) { const p = pin; setTimeout(() => onDone(p), 120); } };
    const del = () => { pin = pin.slice(0, -1); draw(); };
    host.querySelectorAll("[data-k]").forEach(b => b.addEventListener("click", () => add(b.dataset.k)));
    host.querySelector("[data-del]").addEventListener("click", del);
    const key = e => { if (!document.body.contains(host)) { removeEventListener("keydown", key); return; } if (/^\d$/.test(e.key)) add(e.key); else if (e.key === "Backspace") del(); };
    addEventListener("keydown", key);
    return { reset: (text, bad) => { pin = ""; draw(); msg.textContent = text || ""; msg.className = "lock-msg" + (bad ? " bad" : ""); if (bad) { dots.classList.remove("shake"); void dots.offsetWidth; dots.classList.add("shake"); } } };
  };

  const overlay = html => { const o = document.createElement("div"); o.className = "lock"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true"); o.innerHTML = `<div class="lock-box">${html}</div>`; document.body.appendChild(o); document.documentElement.classList.remove("nma-locked"); return o; };
  const done = () => { NMA.lockBusy = false; if (NMA.askPush) setTimeout(NMA.askPush, 300); };

  /* ---------- Einrichten: PIN festlegen, dann (Handy) Fingerabdruck ---------- */
  const setup = async (reason) => {
    NMA.lockBusy = true;
    const u = NMA.user(), bio = await bioAvailable();
    let first = null;
    const o = overlay(`<div class="brand-i">♥</div><h2 id="lkT">PIN festlegen</h2>
      <p id="lkP">${reason || "Zum Schutz deines Kontos: Wähle eine 6-stellige PIN. Damit entsperrst du die App, wenn du sie neu öffnest."}</p><div id="lkPad"></div>`);
    const ui = pinUI(o.querySelector("#lkPad"), {
      onDone: async p => {
        if (!first) {
          if (/^(\d)\1{5}$/.test(p) || "0123456789".includes(p) || "9876543210".includes(p)) { ui.reset("Zu einfach – bitte keine Reihe wie 123456 oder 111111.", true); return; }
          first = p; o.querySelector("#lkT").textContent = "PIN wiederholen"; o.querySelector("#lkP").textContent = "Bitte gib die PIN zur Bestätigung noch einmal ein."; ui.reset(); return;
        }
        if (p !== first) { first = null; o.querySelector("#lkT").textContent = "PIN festlegen"; o.querySelector("#lkP").textContent = "Die PINs waren unterschiedlich. Bitte noch einmal von vorn."; ui.reset("", true); return; }
        const salt = b64(rand(16)), data = { pin: await hash(p, salt), salt, nick: u.nick, cred: null, fails: 0 };
        S.set(LOCK, data); S.set("lockReset", false);
        if (!bio) { o.remove(); ss.set(true); NMA.toast("PIN gespeichert. Beim nächsten Öffnen der App fragen wir danach."); done(); return; }
        o.querySelector(".lock-box").innerHTML = `<div class="brand-i">☝</div><h2>Mit Fingerabdruck entsperren?</h2>
          <p>Dann reicht beim Öffnen der App dein Finger oder dein Gesicht – die PIN brauchst du nur noch als Ersatz.</p>
          <button class="btn primary" id="lkBioYes">Ja, Fingerabdruck einrichten</button><button class="btn ghost" id="lkBioNo">Nein, nur PIN</button>`;
        o.querySelector("#lkBioNo").addEventListener("click", () => { o.remove(); ss.set(true); NMA.toast("PIN gespeichert."); done(); });
        o.querySelector("#lkBioYes").addEventListener("click", async () => {
          try {
            const cred = await navigator.credentials.create({ publicKey: {
              rp: { name: "Nie mehr alleine", id: location.hostname }, user: { id: rand(16), name: u.nick, displayName: u.vorname || u.nick },
              challenge: rand(32), pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
              authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "preferred" }, timeout: 60000 } });
            data.cred = b64(cred.rawId); S.set(LOCK, data);
            o.remove(); ss.set(true); NMA.toast("☝ Fingerabdruck eingerichtet."); done();
          } catch (e) { o.remove(); ss.set(true); NMA.toast("Fingerabdruck wurde nicht eingerichtet – du entsperrst mit der PIN. Ändern unter Einstellungen."); done(); }
        });
      } });
  };

  /* ---------- Entsperren ---------- */
  const tryBio = async data => {
    try {
      await navigator.credentials.get({ publicKey: { challenge: rand(32), allowCredentials: [{ type: "public-key", id: unb64(data.cred), transports: ["internal"] }], userVerification: "required", timeout: 60000 } });
      return true;
    } catch (e) { return false; }
  };
  const unlock = async data => {
    NMA.lockBusy = true;
    const u = NMA.user(), bio = !!data.cred && await bioAvailable();
    const o = overlay(`<div class="brand-i">♥</div><h2>Willkommen zurück${u.vorname ? ", " + NMA.esc(u.vorname) : ""}</h2>
      <p>${bio ? "Entsperre mit deinem Fingerabdruck oder gib deine PIN ein." : "Bitte gib deine 6-stellige PIN ein."}</p>
      ${bio ? `<button class="btn primary lock-bio" id="lkBio">☝ Mit Fingerabdruck entsperren</button>` : ""}<div id="lkPad"></div>
      <button class="lock-link" id="lkForgot">PIN vergessen? Mit Passwort anmelden</button>`);
    const ok = () => { data.fails = 0; S.set(LOCK, data); ss.set(true); o.remove(); done(); };
    const ui = pinUI(o.querySelector("#lkPad"), { bioBtn: bio, onDone: async p => {
      if (await hash(p, data.salt) === data.pin) { ok(); return; }
      data.fails = (data.fails || 0) + 1; S.set(LOCK, data);
      if (data.fails >= 5) { S.set("lockReset", true); data.fails = 0; S.set(LOCK, data); location.href = "login.html?gesperrt=1"; return; }
      ui.reset(`Falsche PIN. Noch ${5 - data.fails} Versuch${5 - data.fails === 1 ? "" : "e"}.`, true);
    } });
    const bioGo = async () => { if (await tryBio(data)) ok(); else ui.reset("Fingerabdruck nicht erkannt – bitte PIN eingeben."); };
    if (bio) { o.querySelector("#lkBio").addEventListener("click", bioGo); o.querySelector("[data-bio]").addEventListener("click", bioGo); setTimeout(bioGo, 400); }
    o.querySelector("#lkForgot").addEventListener("click", () => { S.set("lockReset", true); ss.set(false); location.href = "login.html?pinvergessen=1"; });
  };

  /* ---------- Einstellungen: PIN ändern / Fingerabdruck an-aus ---------- */
  NMA.lock = {
    has: () => !!S.get(LOCK, null),
    hasBio: () => !!(S.get(LOCK, null) || {}).cred,
    bioAvailable,
    changePin: () => setup("Wähle eine neue 6-stellige PIN."),
    bioOff: () => { const d = S.get(LOCK, null); if (d) { d.cred = null; S.set(LOCK, d); } },
    bioOn: () => { const d = S.get(LOCK, null); if (d) { d.cred = null; S.set(LOCK, d); } setup("Zum Einrichten des Fingerabdrucks bitte zuerst die PIN neu festlegen."); },
    logout: () => { ss.set(false); location.href = "index.html"; }
  };
  document.querySelectorAll('a[href="index.html"]').forEach(a => { if (/Abmelden/.test(a.textContent)) a.addEventListener("click", () => ss.set(false)); });

  if (!guarded) return;
  const data = S.get(LOCK, null);
  if (S.get("lockReset", false) && !ss.get()) { location.href = "login.html?pinvergessen=1"; return; }
  if (!data || data.nick !== NMA.user().nick || S.get("lockReset", false)) {
    if (data && data.nick !== NMA.user().nick) S.set(LOCK, null);
    setup(S.get("lockReset", false) ? "Lege eine neue 6-stellige PIN fest." : null);
  } else if (!ss.get()) unlock(data);
  else document.documentElement.classList.remove("nma-locked");
})();
