/* =====================================================================
   FOTOS & FOTOFREIGABE (Kunden und Profile)
   - Jeder (Kunde wie Profil) kann mehrere Fotos hochladen und pro Foto festlegen:
       „Für alle sichtbar“ oder „Nur nach Freigabe“, und ob es ein FSK-18-Foto ist.
   - Fotofreigabe pro Person: Kunde bittet im Chat kostenlos um Freigabe (wie das Herzchen),
     das Profil (Mitarbeiter) gibt frei. FSK-18-Fotos brauchen eine EIGENE zweite Freigabe –
     bis dahin sind sie nur gepixelt zu sehen.
   - Umgekehrt kann der Kunde seine eigenen Fotos für ein Profil freigeben.
   Demo: Speicher im Browser (Bilder verkleinert). SERVER: Bilder im Speicher ablegen, FSK-18-Bilder
   bis zur Freigabe NUR als gepixelte Fassung ausliefern (CSS-Unschärfe ist kein Schutz!), Freigaben und
   Anfragen in der Datenbank, FSK-18-Freigabe nur für altersgeprüfte Kunden (siehe Jugendschutz/AVS),
   jedes hochgeladene Foto vor der Freischaltung prüfen.
   Schlüssel: Profil = "p:<id>", Kunde = "c:<nickname>".
   ===================================================================== */
(() => {
  const S = NMA.store, esc = NMA.esc;
  const KF = "fotos", KA = "fotoAccess", KR = "fotoReq";
  const all = () => S.get(KF, {}), acc = () => S.get(KA, {}), reqs = () => S.get(KR, []);
  const nameOf = key => key.startsWith("p:") ? ((NMA.get && NMA.get(key.slice(2))) || {}).name || key.slice(2) : key.slice(2);

  /* ---------- Demo-Fotos für die Profile (Platzhalter-Bilder) ---------- */
  const ph = (label, a, b, lock) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="300" height="380" fill="url(#g)"/><circle cx="150" cy="140" r="58" fill="#ffffff2e"/><path d="M50 380c10-90 60-130 100-130s90 40 100 130z" fill="#ffffff2e"/><text x="150" y="350" font-family="sans-serif" font-size="20" fill="#ffffffaa" text-anchor="middle">${label}${lock ? " · FSK 18" : ""}</text></svg>`);
  {
    const f = all(); let ch = false;
    const cols = [["#2f6f69", "#123234"], ["#8a5a3c", "#2a1a12"], ["#4b3f7a", "#151230"], ["#7a3f5a", "#2a1220"], ["#3f6f8a", "#10202a"]];
    (NMA.profiles || []).forEach((p, i) => {
      const k = "p:" + p.id; if (f[k]) return;
      const c = cols[i % cols.length];
      f[k] = [
        { id: k + "-1", src: ph(p.name + " · Urlaub", c[0], c[1]), vis: "alle", fsk: false },
        { id: k + "-2", src: ph(p.name + " · Garten", c[1], c[0]), vis: "alle", fsk: false },
        { id: k + "-3", src: ph(p.name + " · privat", c[0], "#071012"), vis: "frei", fsk: false },
        { id: k + "-4", src: ph(p.name + " · sexy", "#5a1a2a", "#140508", true), vis: "frei", fsk: true }
      ]; ch = true;
    });
    if (ch) S.set(KF, f);
  }

  /* ---------- Zugriff ---------- */
  const access = (owner, viewer) => acc()[owner + ">" + viewer] || {};
  const setAccess = (owner, viewer, patch) => { const a = acc(), k = owner + ">" + viewer; a[k] = Object.assign({}, a[k], patch); if (!a[k].photos) a[k].fsk = 0; S.set(KA, a); };
  /* Zustand eines Fotos für einen Betrachter: "zeigen" | "gesperrt" | "fsk" (gepixelt) */
  const state = (ph, owner, viewer) => {
    if (owner === viewer) return "zeigen";
    const a = access(owner, viewer), seen = ph.vis === "alle" || a.photos;
    if (!seen) return "gesperrt";
    if (ph.fsk && !a.fsk) return "fsk";
    return "zeigen";
  };
  const list = owner => all()[owner] || [];
  const save = (owner, arr) => { const f = all(); f[owner] = arr; try { S.set(KF, f); return true; } catch (e) { NMA.toast("Speicher voll – bitte weniger oder kleinere Fotos (Demo-Grenze)."); return false; } };

  /* ---------- Anfragen ---------- */
  const request = (owner, viewer, type) => {
    const r = reqs();
    if (r.some(x => x.owner === owner && x.viewer === viewer && x.type === type && x.status === "offen")) { NMA.toast("Die Anfrage läuft schon – du bekommst Bescheid."); return; }
    r.push({ id: "fr" + Date.now(), owner, viewer, type, t: Date.now(), status: "offen" }); S.set(KR, r.slice(-300));
    NMA.toast(type === "fsk" ? "🔞 FSK-18-Freigabe angefragt – kostenlos." : "📷 Fotofreigabe angefragt – kostenlos.");
  };
  const notifyCustomer = (owner, viewer, text) => {
    if (!viewer.startsWith("c:") || !owner.startsWith("p:")) return;
    const cm = S.get("custMsgs", []); cm.push({ id: "f" + Date.now(), to: viewer.slice(2), pid: owner.slice(2), text, t: Date.now(), read: false }); S.set("custMsgs", cm.slice(-500));
  };
  const decide = (id, yes) => {
    const r = reqs(), q = r.find(x => x.id === id); if (!q) return;
    q.status = yes ? "ok" : "nein"; S.set(KR, r);
    if (yes) { setAccess(q.owner, q.viewer, q.type === "fsk" ? { photos: Date.now(), fsk: Date.now() } : { photos: Date.now() });
      notifyCustomer(q.owner, q.viewer, q.type === "fsk" ? "🔞 Ich habe dir auch meine FSK-18-Fotos freigegeben." : "📷 Ich habe dir meine privaten Fotos freigegeben – schau mal in mein Profil."); }
  };

  /* ---------- Bild verkleinern (Upload) ---------- */
  const shrink = file => new Promise((res, rej) => {
    if (!/^image\//.test(file.type)) return rej(new Error("Bitte nur Bilder (JPG, PNG)."));
    if (file.size > 15e6) return rej(new Error("Das Bild ist zu groß (höchstens 15 MB)."));
    const img = new Image(); img.onload = () => { const m = 900, s = Math.min(1, m / Math.max(img.width, img.height)), c = document.createElement("canvas"); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL("image/jpeg", .78)); URL.revokeObjectURL(img.src); };
    img.onerror = () => rej(new Error("Das Bild konnte nicht gelesen werden.")); img.src = URL.createObjectURL(file);
  });

  /* ---------- Darstellung ---------- */
  const css = document.createElement("style");
  css.textContent = `
  .gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px}
  .gal .ph{position:relative;aspect-ratio:3/3.8;border-radius:12px;overflow:hidden;background:#0b1a1b;border:1px solid var(--line);padding:0;cursor:pointer;color:var(--ink)}
  .gal .ph img{width:100%;height:100%;object-fit:cover;display:block}
  .gal .ph.fsk img{filter:blur(16px) saturate(.6);transform:scale(1.15)}
  .gal .ph .ov{position:absolute;inset:0;display:grid;place-content:center;gap:4px;text-align:center;font-size:13px;font-weight:700;background:#071012a6;padding:8px}
  .gal .ph .ov b{font-size:22px}
  .gal .ph .tagx{position:absolute;left:6px;top:6px;font-size:11px;font-weight:700;padding:2px 7px;border-radius:20px;background:#071012d9}
  .gal-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
  .lightbox{position:fixed;inset:0;z-index:9000;background:#000e;display:grid;place-items:center;padding:16px}
  .lightbox img{max-width:100%;max-height:88svh;border-radius:12px}
  .gm{display:grid;gap:10px}.gm-row{display:grid;grid-template-columns:72px 1fr auto;gap:12px;align-items:center;padding:8px;border:1px solid var(--line);border-radius:12px}
  .gm-row img{width:72px;height:90px;object-fit:cover;border-radius:8px}
  .gm-row .opts{display:grid;gap:6px;font-size:14px}.gm-row select{min-height:38px;font-size:14px}
  .gm-row label{display:flex;gap:6px;align-items:center}
  `;
  document.head.appendChild(css);

  const tile = (ph, st) => st === "zeigen" ? `<button type="button" class="ph" data-big="${esc(ph.id)}"><img src="${ph.src}" alt="Foto">${ph.fsk ? '<span class="tagx">FSK 18</span>' : ""}</button>`
    : st === "fsk" ? `<button type="button" class="ph fsk" data-fsk="1"><img src="${ph.src}" alt="Gepixeltes FSK-18-Foto"><span class="ov"><b>🔞</b>FSK 18<br><small style="font-weight:400">eigene Freigabe nötig</small></span></button>`
    : `<button type="button" class="ph" data-lock="1" style="background:linear-gradient(145deg,#173436,#0b1a1b)"><span class="ov" style="background:transparent"><b>🔒</b>Privat<br><small style="font-weight:400">nach Freigabe</small></span></button>`;

  /* Galerie für einen Betrachter */
  const gallery = (host, owner, viewer, opt = {}) => {
    const arr = list(owner), a = access(owner, viewer);
    const sts = arr.map(p => state(p, owner, viewer));
    const anyLock = sts.includes("gesperrt"), anyFsk = arr.some(p => p.fsk) && !a.fsk && owner !== viewer;
    host.innerHTML = arr.length ? `<div class="gal">${arr.map((p, i) => tile(p, sts[i])).join("")}</div>
      ${opt.requests && owner !== viewer ? `<div class="gal-acts">
        ${anyLock && !a.photos ? `<button type="button" class="btn sm" data-req="photos">📷 Fotofreigabe anfragen <small class="muted">(kostenlos)</small></button>` : a.photos ? '<span class="tb-tag" style="margin:0">📷 Fotos freigegeben</span>' : ""}
        ${anyFsk ? (a.photos ? `<button type="button" class="btn sm" data-req="fsk">🔞 FSK-18-Freigabe anfragen <small class="muted">(kostenlos)</small></button>` : '<small class="muted" style="align-self:center">FSK-18-Fotos erst nach der Fotofreigabe anfragbar</small>') : (a.fsk ? '<span class="tb-tag" style="margin:0">🔞 FSK 18 freigegeben</span>' : "")}
      </div>` : ""}` : `<p class="muted" style="margin:0">${opt.empty || "Noch keine Fotos."}</p>`;
    host.querySelectorAll("[data-big]").forEach(b => b.addEventListener("click", () => { const p = arr.find(x => x.id === b.dataset.big); const lb = document.createElement("div"); lb.className = "lightbox"; lb.innerHTML = `<img src="${p.src}" alt="Foto">`; lb.addEventListener("click", () => lb.remove()); document.body.appendChild(lb); }));
    host.querySelectorAll("[data-lock]").forEach(b => b.addEventListener("click", () => NMA.toast("Privates Foto – bitte um Fotofreigabe.")));
    host.querySelectorAll("[data-fsk]").forEach(b => b.addEventListener("click", () => NMA.toast("FSK-18-Foto – dafür braucht es eine eigene Freigabe.")));
    host.querySelectorAll("[data-req]").forEach(b => b.addEventListener("click", () => { request(owner, viewer, b.dataset.req); gallery(host, owner, viewer, opt); }));
  };

  /* Fotos verwalten (für den Besitzer: Kunde oder Mitarbeiter fürs Profil) */
  const manager = (host, owner) => {
    const draw = () => {
      const arr = list(owner);
      host.innerHTML = `<div class="gm">${arr.map((p, i) => `<div class="gm-row"><img src="${p.src}" alt="Foto ${i + 1}">
          <div class="opts"><select class="input" data-vis="${i}" aria-label="Sichtbarkeit"><option value="alle" ${p.vis === "alle" ? "selected" : ""}>Für alle sichtbar</option><option value="frei" ${p.vis !== "alle" ? "selected" : ""}>Nur nach Freigabe</option></select>
          <label><input type="checkbox" data-fsk="${i}" ${p.fsk ? "checked" : ""}> FSK 18 (gepixelt bis zur eigenen Freigabe)</label></div>
          <div style="display:grid;gap:4px">${i ? `<button type="button" class="btn sm ghost" data-up="${i}" title="Nach vorne">↑</button>` : ""}<button type="button" class="btn sm ghost" data-del="${i}" title="Löschen">🗑</button></div></div>`).join("") || '<p class="muted" style="margin:0">Noch keine Fotos.</p>'}</div>
        <label class="btn sm" style="margin-top:10px;display:inline-flex">＋ Fotos hinzufügen<input type="file" accept="image/*" multiple hidden data-add></label>
        <p class="hint" style="margin:8px 0 0">${arr.filter(p => p.vis === "alle").length} von ${arr.length} für alle sichtbar · FSK-18-Fotos sind nie öffentlich sichtbar, nur gepixelt.</p>`;
      host.querySelectorAll("[data-vis]").forEach(s => s.addEventListener("change", () => { const a = list(owner); a[+s.dataset.vis].vis = s.value; save(owner, a); draw(); }));
      host.querySelectorAll("[data-fsk]").forEach(c => c.addEventListener("change", () => { const a = list(owner); a[+c.dataset.fsk].fsk = c.checked; save(owner, a); draw(); }));
      host.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => NMA.modal({ title: "Foto löschen?", text: "Das Foto wird entfernt.", cancel: "Abbrechen", ok: "Löschen", onOk: () => { const a = list(owner); a.splice(+b.dataset.del, 1); save(owner, a); draw(); } })));
      host.querySelectorAll("[data-up]").forEach(b => b.addEventListener("click", () => { const a = list(owner), i = +b.dataset.up; [a[i - 1], a[i]] = [a[i], a[i - 1]]; save(owner, a); draw(); }));
      host.querySelector("[data-add]").addEventListener("change", async e => {
        const a = list(owner);
        for (const f of e.target.files) { try { a.push({ id: owner + "-" + Date.now() + Math.random().toString(36).slice(2, 6), src: await shrink(f), vis: "frei", fsk: false }); } catch (err) { NMA.toast(err.message); } }
        if (save(owner, a)) NMA.toast("Foto hinzugefügt – neue Fotos sind erst „Nur nach Freigabe“. Bitte FSK 18 ankreuzen, wenn nötig.");
        draw();
      });
    };
    draw();
  };

  window.FOTO = { list, access, setAccess, state, request, decide, reqs, gallery, manager, nameOf };
})();
