/* Nie mehr alleine – gemeinsames Skript für alle Seiten.
   Alles hier ist Demo: Daten, Coins und Nachrichten liegen nur im Browser.
   Der Server-Entwickler ersetzt die Funktionen im Abschnitt "DATEN" durch echte API-Aufrufe. */
{
const NMA = window.NMA = {};

/* ---------------- DATEN (Demo) ---------------- */
NMA.profiles = [
  {id:"lena",   name:"GitarrenLena",    age:52, city:"Hamburg",     km:8,  online:true,  sex:"w", photo:"assets/hero-romance.png", about:"Ich liebe Musik, spontane Ausflüge und Gespräche, bei denen man die Zeit vergisst. Mein perfekter Sonntag beginnt mit Kaffee und endet irgendwo am Wasser.", tags:["Gitarre","Konzerte","Natur"], looking:"Beziehung", job:"Musiklehrerin", height:"168 cm", status:"Verwitwet"},
  {id:"sabine", name:"SabineHerz",  age:58, city:"Lüneburg",    km:14, online:true,  sex:"w", g:"linear-gradient(145deg,#c0796a,#4a2b2e)", about:"Lebensfroh, neugierig und gern unterwegs. Ich koche gern für zwei und suche jemanden, der mitisst und mitlacht.", tags:["Kochen","Reisen","Garten"], looking:"Beziehung", job:"Köchin", height:"165 cm", status:"Geschieden"},
  {id:"petra",  name:"TanzmausPetra",   age:49, city:"Buxtehude",   km:22, online:false, last:"vor 2 Std.", sex:"w", g:"linear-gradient(145deg,#8a6aa8,#2c2240)", about:"Tanzen, Radfahren und ein gutes Buch auf dem Balkon. Ehrlichkeit ist mir wichtig.", tags:["Tanzen","Radfahren","Lesen"], looking:"Abenteuer", job:"Bürokauffrau", height:"171 cm", status:"Single"},
  {id:"monika", name:"MonikaHerz",  age:61, city:"Stade",       km:31, online:true,  sex:"w", g:"linear-gradient(145deg,#c79a54,#4b3517)", about:"Ich bin gern draußen mit meinem Hund und freue mich über jemanden für Spaziergänge und gemütliche Abende.", tags:["Hund","Wandern","Kaffee"], looking:"Beziehung", job:"Rentnerin", height:"162 cm", status:"Verwitwet"},
  {id:"andrea", name:"AndreaLächeln",  age:45, city:"Norderstedt", km:18, online:false, last:"gestern", sex:"w", g:"linear-gradient(145deg,#4f8f87,#173a37)", about:"Humor mit Tiefgang, Meer und Fotografie. Wer mich zum Lachen bringt, hat schon gewonnen.", tags:["Meer","Fotografie","Kino"], looking:"Abenteuer", job:"Fotografin", height:"174 cm", status:"Single"},
  {id:"karin",  name:"TheaterKarin",   age:55, city:"Pinneberg",   km:26, online:true,  sex:"w", g:"linear-gradient(145deg,#b0566f,#3b1825)", about:"Ich gehe gern ins Theater, mag Städtereisen und suche einen Mann mit Herz und Zeit.", tags:["Theater","Städtereisen","Wein"], looking:"Beziehung", job:"Buchhändlerin", height:"166 cm", status:"Geschieden"},
  {id:"thomas", name:"Bikerthomas",  age:57, city:"Hamburg",     km:5,  online:true,  sex:"m", g:"linear-gradient(145deg,#5b7aa0,#1c2a3c)", about:"Handwerker im Ruhestand, gern am Grill und auf dem Motorrad.", tags:["Motorrad","Grillen","Fußball"], looking:"Abenteuer", job:"Tischler", height:"182 cm", status:"Geschieden"},
  {id:"rainer", name:"GärtnerRainer",  age:63, city:"Elmshorn",    km:35, online:false, last:"vor 5 Std.", sex:"m", g:"linear-gradient(145deg,#7b8a5a,#283019)", about:"Ruhig, verlässlich und gern im Garten. Ich suche eine Frau für gemeinsame Ausflüge.", tags:["Garten","Ausflüge","Angeln"], looking:"Beziehung", job:"Gärtner", height:"178 cm", status:"Verwitwet"}
];
NMA.get = id => NMA.profiles.find(p => p.id === id) || NMA.profiles[0];

NMA.chats = {
  lena:  [{d:"Heute"},{t:"them",x:"Hallo! Dein Profil klingt sympathisch. Spielst du auch ein Instrument?",h:"18:34"},{t:"me",x:"Ein bisschen Gitarre, am liebsten draußen im Sommer.",h:"18:36"},{t:"them",x:"Das klingt schön 😊 Erzähl mir mehr von dir!",h:"18:39"}],
  sabine:[{d:"Heute"},{t:"them",x:"Guten Abend! Hast du am Wochenende schon etwas vor?",h:"18:31"},{t:"them",x:"Ich würde mich freuen, von dir zu hören.",h:"18:31"}],
  monika:[{d:"Gestern"},{t:"me",x:"Hallo Monika, wie heißt denn dein Hund?",h:"20:10"},{t:"them",x:"Er heißt Bruno und ist ein echter Schatz.",h:"20:22"}],
  andrea:[{d:"Montag"},{t:"them",x:"Das Foto vom Meer ist wirklich schön. Wo war das?",h:"09:12"}]
};
NMA.unread = {sabine:2};

NMA.mails = [];   /* Postfach entfernt (17.11.2026) – es gibt nur noch den Chat */

NMA.packs = [ /* Beispielpreise – werden vom Betreiber festgelegt */
  {coins:25,  price:19},{coins:50, price:38},{coins:100,price:75,flag:"Beliebt"},
  {coins:200, price:148},{coins:500,price:340},{coins:1000,price:590,flag:"Bester Preis"}
];
NMA.costPerChat = 1;   /* Coins pro Chatnachricht */

/* ---------------- Speicher (nur Demo, im Browser) ---------------- */
const store = {
  get(k,d){try{const v=localStorage.getItem("nma_"+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem("nma_"+k,JSON.stringify(v))}catch(e){}}
};
NMA.store = store;

/* Profile, die im Mitarbeiterbereich angelegt/geändert wurden, ersetzen die Demo-Profile.
   WICHTIG: Kunden sehen in Suche und Chat ausschließlich diese Profile – niemals andere Kunden. */
{
  const owners={lena:"marco",sabine:"marco",monika:"marco",petra:"julia",andrea:"julia",thomas:"julia",karin:"chef",rainer:"tim"};
  NMA.profiles.forEach(p=>{p.owner=p.owner||owners[p.id]||"chef"});
  const tp=store.get("tProfiles",null);
  if(Array.isArray(tp)&&tp.length) NMA.profiles=tp;
}


/* Herzchen: ein Kunde darf pro Tag höchstens 5 Herzen verschicken. Jedes Herz landet beim
   Mitarbeiter, dem das Profil gehört (Mitarbeiterbereich → Nachrichten → Herzchen). */
NMA.heartLimit = 5;
NMA.heartState = () => {
  const d=new Date().toISOString().slice(0,10), s=store.get("heartDay",{d,ids:[]});
  return s.d===d ? s : {d,ids:[]};
};
NMA.heartsLeft = () => NMA.heartLimit - NMA.heartState().ids.length;
NMA.hasHeart = id => NMA.heartState().ids.includes(id);
NMA.sendHeart = id => {
  const s=NMA.heartState(), p=NMA.get(id);
  if (s.ids.includes(id)) { NMA.toast(`Du hast ${p.name} heute schon ein Herz geschickt.`); return false; }
  if (s.ids.length >= NMA.heartLimit) {
    NMA.modal({title:"Keine Herzen mehr für heute",text:`Du kannst pro Tag ${NMA.heartLimit} Herzen verschicken. Morgen geht es weiter – oder schreib ${NMA.esc(p.name)} einfach direkt.`,cancel:"Schließen",ok:"Nachricht schreiben",onOk:()=>location.href="chat.html?mit="+id});
    return false;
  }
  s.ids.push(id); store.set("heartDay",s);
  const all=store.get("hearts",[]); all.push({id:"h"+Date.now(),pid:id,cust:NMA.user().nick,t:Date.now()}); store.set("hearts",all);
  NMA.toast(`♥ Herz an ${p.name} geschickt – noch ${NMA.heartsLeft()} für heute.`);
  return true;
};
NMA.coins = () => store.get("coins",5);
NMA.setCoins = n => {store.set("coins",n);document.querySelectorAll("[data-coins]").forEach(e=>e.textContent=n+" Coins")};
NMA.user = () => store.get("user",{nick:"MichaelNordlicht",vorname:"Michael",age:56,plz:"20095",city:"Hamburg",radius:"50",job:"Elektriker",about:"Ich freue mich auf nette Gespräche und vielleicht mehr.",looking:"Beziehung"});
/* Vergebene Nicknames (Demo). Jeder Nickname darf nur einmal existieren – der Server prüft das endgültig. */
NMA.takenNicks = () => NMA.profiles.map(p=>p.name).concat(["BlondeCarola","ClaudiaHerz"]);
/* Nickname-Regel: 3–30 Zeichen, Buchstaben, Ziffern, _ - . – KEINE Leerzeichen (Server prüft zusätzlich) */
NMA.nickOk = n => /^[\p{L}\p{N}._-]{3,30}$/u.test(String(n));
NMA.nickFree = n => !NMA.takenNicks().some(t=>t.toLowerCase()===n.trim().toLowerCase());
NMA.notice = "Unterhaltungs-Chat mit moderierten Profilen: Die Profile werden von Moderatoren geführt.";

/* ---------------- Hilfsfunktionen ---------------- */
NMA.esc = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
NMA.avatar = (p,cls="",on=true) => {
  const bg = p.photo ? `background-image:url('${p.photo}');background-position:${p.ppos||"22% 25%"};background-size:${p.psize||"260%"}` : `--g:${p.g}`;
  return `<span class="avatar ${cls}" style="${bg}">${p.photo?"":p.name[0]}${on&&p.online?'<i class="on"></i>':""}</span>`;
};
NMA.photo = p => {
  const bg = p.photo ? `background-image:linear-gradient(transparent 55%,#071012cc),url('${p.photo}');background-position:${p.ppos||"24% 30%"}` : `--g:${p.g}`;
  const st = p.online ? '<span class="status"><span class="dot"></span>Online</span>' : `<span class="status"><span class="dot off"></span>Zuletzt online ${p.last||""}</span>`;
  return `<div class="photo" style="${bg}">${p.photo?"":`<span class="ini">${p.name[0]}</span>`}${st}</div>`;
};
NMA.toast = msg => {
  document.querySelectorAll(".toast").forEach(x=>x.remove());const t=document.createElement("div");t.className="toast";t.setAttribute("role","status");t.textContent=msg;
  document.body.appendChild(t);setTimeout(()=>t.remove(),2800);
};
NMA.modal = ({title,text,ok="OK",cancel,onOk}) => {
  const m=document.createElement("div");m.className="modal";
  m.innerHTML=`<div class="card" role="dialog" aria-modal="true"><h2>${title}</h2><p class="muted">${text}</p><div class="row">${cancel?`<button class="btn ghost" data-x>${cancel}</button>`:""}<button class="btn primary" data-ok>${ok}</button></div></div>`;
  document.body.appendChild(m);
  const close=()=>m.remove();
  m.addEventListener("click",e=>{if(e.target===m||e.target.hasAttribute("data-x"))close()});
  m.querySelector("[data-ok]").addEventListener("click",()=>{close();onOk&&onOk()});
  m.querySelector("[data-ok]").focus();
};
NMA.param = (k) => {try{return new URLSearchParams(location.search).get(k)}catch(e){return null}};

/* ---------------- Kopfzeile & Leiste für den Mitgliederbereich ---------------- */
const ico = {
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16v11H8l-4 4z"/></svg>',
  mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  me:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>'
};
const page = document.body.dataset.page;
if (document.body.classList.contains("member")) {
  const chatUnread = Object.values(NMA.unread).reduce((a,b)=>a+b,0);
  const items = [
    ["uebersicht","Übersicht","home",0],["suche","Suche","search",0],
    ["chat","Chat","chat",chatUnread],["mein-profil","Mein Bereich","me",0]
  ];
  const isActive = k => k===page || (k==="mein-profil" && ["einstellungen","hilfe","app-installieren"].includes(page)) || (k==="suche" && page==="profil");
  const top = document.createElement("header");
  top.className="topbar";
  top.innerHTML = `<a class="brand" href="uebersicht.html" aria-label="Nie mehr alleine – Übersicht"><i aria-hidden="true">♥</i><span>Nie mehr <b>alleine</b></span></a>
    <nav class="mainnav" aria-label="Hauptnavigation">${items.map(([k,l,,n])=>`<a href="${k}.html" class="${isActive(k)?"active":""}">${l}${n?`<span class="badge">${n}</span>`:""}</a>`).join("")}</nav>
    <div class="top-right"><a class="coins" href="coins.html" data-coins title="Coins aufladen">${NMA.coins()} Coins</a><a class="me-av" href="mein-profil.html" title="Mein Bereich">${NMA.esc(NMA.user().nick[0])}</a></div>`;
  document.body.prepend(top);
  const bar = document.createElement("nav");
  bar.className="tabbar";bar.setAttribute("aria-label","Navigation");
  bar.innerHTML = items.map(([k,l,i,n])=>`<a href="${k}.html" class="${isActive(k)?"active":""}">${ico[i]}${n?`<span class="badge">${n}</span>`:""}<span>${k==="mein-profil"?"Ich":l}</span></a>`).join("");
  document.body.appendChild(bar);
}
/* Fußzeile überall */
const foot=document.createElement("footer");foot.className="foot";
foot.innerHTML=`<span>© ${new Date().getFullYear()} Nie mehr alleine · Unterhaltungs-Chat mit moderierten Profilen · ab 18</span><nav><a href="rechtliches.html#impressum">Impressum</a><a href="rechtliches.html#datenschutz">Datenschutz</a><a href="rechtliches.html#agb">AGB</a><a href="hilfe.html">Hilfe</a></nav>`;
if(/^team/.test(document.body.dataset.page||"")) foot.innerHTML=`<span>Team-Portal · nur für Mitarbeiter · vertraulich</span>`;
if(!document.body.classList.contains("full")) document.body.appendChild(foot);

/* Demo-Formulare: kein Absenden an einen Server */
document.querySelectorAll("form[data-next]").forEach(f=>f.addEventListener("submit",e=>{
  e.preventDefault();
  if(f.checkValidity()){ if(document.body.dataset.page==="login"){const u=NMA.user();u.lastLogin=Date.now();NMA.store.set("user",u);} location.href=f.dataset.next; }
  else NMA.toast("Bitte fülle alle Felder aus.");
}));
document.querySelectorAll("[data-save]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();NMA.toast("Gespeichert (Demo – noch ohne Server)")}));
}

/* ---------------- App installieren (PWA) ---------------- */
{
  const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  let deferred = null;
  addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; });
  addEventListener("appinstalled", () => { try{localStorage.setItem("nma_app","1")}catch(e){}; document.getElementById("appBanner")?.remove(); NMA.toast("App installiert – du findest sie jetzt auf deinem Startbildschirm."); });
  const teamPg = /^team/.test((document.body && document.body.dataset.page) || "");
  try { if ("serviceWorker" in navigator && location.protocol.startsWith("http")) (teamPg ? navigator.serviceWorker.register("team/sw.js", { scope: "team/" }) : navigator.serviceWorker.register("sw.js")).catch(()=>{});   /* eigener Bereich, damit sich Kunden- und Team-App nicht stören */ } catch (e) {}
  /* für das Team-Portal: eigener Installieren-Knopf */
  NMA.install = { can: () => !!deferred, standalone, run: async () => { if (!deferred) return false; deferred.prompt(); const r = await deferred.userChoice; deferred = null; return r.outcome === "accepted"; } };
  addEventListener("beforeinstallprompt", () => dispatchEvent(new Event("nma:installable")));

  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isSamsung = /SamsungBrowser/.test(ua);
  const isFirefox = /Firefox|FxiOS/.test(ua);
  const isIOSOther = isIOS && /CriOS|FxiOS|EdgiOS/.test(ua);
  const mobile = isIOS || isAndroid;

  /* Kleine Symbole, so wie sie im Browser aussehen */
  const share = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-5px"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 12v8h14v-8"/></svg>';
  const plus = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-5px"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
  const dots = '<b style="font-size:20px;line-height:0">⋮</b>';
  const inst = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-5px"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M12 8v6M9 11l3 3 3-3M8 21h8"/></svg>';

  const steps = () => {
    if (isIOS && isIOSOther) return { t: "Auf dem iPhone installieren", s: [
      `Tippe auf ${share} <b>Teilen</b> (oben rechts oder unten in der Leiste).`,
      `Wähle ${plus} <b>Zum Home-Bildschirm</b>.`,
      `Tippe oben rechts auf <b>Hinzufügen</b> – fertig.`],
      n: "Klappt das nicht, öffne die Seite einmal in Safari und mach es dort." };
    if (isIOS) return { t: "Auf dem iPhone installieren", s: [
      `Tippe unten in Safari auf ${share} <b>Teilen</b> (bei manchen Versionen erst auf <b>⋯</b>).`,
      `Scrolle etwas nach unten und tippe auf ${plus} <b>Zum Home-Bildschirm</b>.`,
      `Tippe oben rechts auf <b>Hinzufügen</b> – das Herz-Symbol erscheint auf deinem Startbildschirm.`],
      n: "Apple erlaubt keine Installation per Knopfdruck – deshalb diese drei Schritte." };
    if (isSamsung) return { t: "Auf dem Samsung-Handy installieren", s: [
      `Tippe unten rechts auf <b>☰ Menü</b>.`,
      `Wähle <b>Seite hinzufügen zu</b> → <b>Startbildschirm</b>.`,
      `Bestätige mit <b>Hinzufügen</b>.`] };
    if (isAndroid && isFirefox) return { t: "Auf dem Android-Handy installieren", s: [
      `Tippe auf ${dots} <b>Menü</b>.`, `Wähle <b>Installieren</b> bzw. <b>Zum Startbildschirm hinzufügen</b>.`, `Bestätige mit <b>Hinzufügen</b>.`] };
    if (isAndroid) return { t: "Auf dem Android-Handy installieren", s: [
      `Tippe oben rechts auf ${dots} <b>Menü</b>.`, `Wähle <b>App installieren</b> bzw. <b>Zum Startbildschirm hinzufügen</b>.`, `Bestätige mit <b>Installieren</b>.`],
      n: "In Chrome und Edge öffnet der Knopf den Installieren-Dialog direkt – diese Anleitung kommt nur, wenn der Browser das nicht anbietet." };
    if (isFirefox) return { t: "Am PC installieren", s: [
      `Firefox kann Web-Apps am PC nicht installieren.`, `Öffne die Seite in <b>Chrome</b> oder <b>Edge</b>.`, `Klicke dort rechts in der Adressleiste auf ${inst} und dann auf <b>Installieren</b>.`] };
    return { t: "Am PC installieren", s: [
      `Klicke rechts in der Adressleiste auf ${inst} <b>App installieren</b>.`, `Falls das Symbol fehlt: Menü ${dots} → <b>Streamen, speichern und teilen</b> → <b>Seite als App installieren</b>.`, `Bestätige mit <b>Installieren</b>.`],
      n: "In Chrome und Edge öffnet der Knopf den Installieren-Dialog direkt – diese Anleitung kommt nur, wenn der Browser das nicht anbietet." };
  };

  const guide = () => {
    const g = steps();
    const m = document.createElement("div"); m.className = "modal install-sheet";
    m.innerHTML = `<div class="card" role="dialog" aria-modal="true" aria-labelledby="igT">
      <div class="ig-head"><img src="${teamPg ? "assets/team-192.png" : "assets/icon-192.png"}" alt="" width="52" height="52"><h2 id="igT">${g.t}</h2></div>
      <ol class="ig-steps">${g.s.map(x => `<li><span>${x}</span></li>`).join("")}</ol>
      ${g.n ? `<p class="hint">${g.n}</p>` : ""}
      <div class="row"><button class="btn primary" data-x>Verstanden</button></div></div>
      ${isIOS && !isIOSOther ? '<div class="ig-arrow" aria-hidden="true">⬇</div>' : ""}`;
    document.body.appendChild(m);
    m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-x]")) m.remove(); });
    m.querySelector("[data-x]").focus();
  };

  NMA.installApp = () => {
    if (standalone()) { NMA.toast("Die App ist schon installiert."); return; }
    if (deferred) {   /* Android / Chrome / Edge: echter Installieren-Dialog per Klick */
      deferred.prompt();
      deferred.userChoice.then(r => { if (r.outcome !== "accepted") NMA.toast("Du kannst die App jederzeit unter Mein Bereich installieren."); }).finally(() => { deferred = null; });
      return;
    }
    guide();          /* iPhone, Firefox oder Vorschau: Schritt-für-Schritt-Anleitung */
  };

  const dismissed = () => { try { return localStorage.getItem("nma_app") === "1"; } catch (e) { return false; } };
  const page = document.body.dataset.page;
  if (page === "uebersicht" && !standalone() && !dismissed()) {
    const b = document.createElement("section");
    b.id = "appBanner"; b.className = "card app-banner";
    b.innerHTML = `<img src="assets/icon-192.png" alt="" width="64" height="64">
      <div class="grow"><h2>Nie mehr alleine als App</h2><p class="muted">Mit einem Tipp auf deinem Startbildschirm – und Benachrichtigungen bei neuen Nachrichten.</p></div>
      <div class="acts"><button class="btn primary" id="appInstall">App installieren</button><a class="btn" href="app-installieren.html">Anleitung</a><button class="btn ghost" id="appLater">Später</button></div>`;
    const main = document.querySelector("main");
    const notice = main && main.querySelector(".notice");
    if (main) (notice ? notice.after(b) : main.prepend(b));
    b.querySelector("#appInstall").addEventListener("click", NMA.installApp);
    b.querySelector("#appLater").addEventListener("click", () => { try{localStorage.setItem("nma_app","1")}catch(e){}; b.remove(); NMA.toast("Du findest „App installieren“ jederzeit unter Mein Bereich."); });
  }
  document.querySelectorAll("[data-install]").forEach(el => el.addEventListener("click", e => { e.preventDefault(); NMA.installApp(); }));
}

/* ---------------- Orte & Entfernungen (Demo-Näherung) ----------------
   Server: echte PLZ-/Ortsdaten verwenden (OpenPLZ / OpenGeoDB). */
NMA.P2 = {"01":[51.05,13.74],"02":[51.18,14.42],"03":[51.76,14.33],"04":[51.34,12.37],"06":[51.48,11.97],"07":[50.88,12.08],"08":[50.72,12.49],"09":[50.83,12.92],"10":[52.52,13.40],"12":[52.45,13.45],"13":[52.57,13.35],"14":[52.40,13.06],"15":[52.34,14.55],"16":[52.83,13.82],"17":[53.56,13.26],"18":[54.09,12.10],"19":[53.63,11.41],"20":[53.55,10.00],"21":[53.40,9.90],"22":[53.62,10.05],"23":[53.87,10.69],"24":[54.32,10.13],"25":[53.90,9.50],"26":[53.14,8.21],"27":[53.40,8.80],"28":[53.08,8.80],"29":[52.62,10.08],"30":[52.37,9.73],"31":[52.15,9.95],"32":[52.12,8.67],"33":[52.02,8.53],"34":[51.31,9.48],"35":[50.58,8.68],"36":[50.55,9.68],"37":[51.54,9.93],"38":[52.27,10.52],"39":[52.13,11.63],"40":[51.23,6.78],"41":[51.19,6.44],"42":[51.26,7.15],"44":[51.51,7.47],"45":[51.46,7.01],"46":[51.60,6.90],"47":[51.40,6.70],"48":[51.96,7.63],"49":[52.28,8.05],"50":[50.94,6.96],"51":[50.95,7.10],"52":[50.78,6.08],"53":[50.73,7.10],"54":[49.75,6.64],"55":[49.99,8.25],"56":[50.36,7.59],"57":[50.87,8.02],"58":[51.36,7.47],"59":[51.60,7.90],"60":[50.11,8.68],"61":[50.23,8.62],"63":[50.10,8.90],"64":[49.87,8.65],"65":[50.08,8.24],"66":[49.24,6.99],"67":[49.45,8.00],"68":[49.49,8.47],"69":[49.40,8.69],"70":[48.78,9.18],"71":[48.80,9.10],"72":[48.50,9.10],"73":[48.70,9.60],"74":[49.14,9.22],"75":[48.89,8.70],"76":[49.01,8.40],"77":[48.47,7.94],"78":[47.90,8.60],"79":[47.99,7.84],"80":[48.14,11.58],"81":[48.12,11.62],"82":[48.00,11.30],"83":[47.86,12.12],"84":[48.54,12.15],"85":[48.60,11.60],"86":[48.37,10.90],"87":[47.73,10.31],"88":[47.78,9.61],"89":[48.40,9.99],"90":[49.45,11.08],"91":[49.60,10.90],"92":[49.45,11.86],"93":[49.01,12.10],"94":[48.57,13.43],"95":[50.00,11.60],"96":[49.90,10.90],"97":[49.79,9.95],"98":[50.60,10.70],"99":[50.98,11.03]};
NMA.P5 = {"20095":[53.55,10.00],"20457":[53.54,9.99],"22041":[53.57,10.08],"21335":[53.25,10.41],"21614":[53.48,9.70],"21680":[53.60,9.48],"21682":[53.60,9.48],"22846":[53.70,10.01],"25421":[53.66,9.80],"25335":[53.75,9.65],"24103":[54.32,10.13],"23552":[53.87,10.69],"29221":[52.62,10.08],"34117":[51.31,9.48],"34508":[51.29,8.61],"34537":[51.12,9.12],"28195":[53.08,8.80],"60311":[50.11,8.68],"80331":[48.14,11.57],"10115":[52.53,13.38]};
NMA.CITYPLZ = {"hamburg":"20095","lüneburg":"21335","buxtehude":"21614","stade":"21682","norderstedt":"22846","pinneberg":"25421","elmshorn":"25335","kiel":"24103","lübeck":"23552","celle":"29221","kassel":"34117","bremen":"28195","frankfurt":"60311","münchen":"80331","berlin":"10115"};
/* Länder: Deutschland 5-stellige PLZ, Grundlage = erste 3 Ziffern; Österreich/Schweiz 4-stellig, Grundlage = erste 2 Ziffern */
NMA.LAND = { DE: { name: "Deutschland", len: 5, pre: 3 }, AT: { name: "Österreich", len: 4, pre: 2 }, CH: { name: "Schweiz", len: 4, pre: 2 } };
NMA.plzOk = (land, plz) => { const L = NMA.LAND[land || "DE"]; return !!L && new RegExp("^\\d{" + L.len + "}$").test(String(plz || "")); };
NMA.region = (land, plz) => { land = land || "DE"; const L = NMA.LAND[land]; return L && plz ? land + "-" + String(plz).slice(0, L.pre) : ""; };
/* Deutschland: Koordinaten je PLZ-Bereich (erste 3 Ziffern) – Demo-Auswahl, sonst Näherung über 2 Ziffern */
NMA.P3 = {"101":[52.52,13.40],"125":[52.45,13.58],"135":[52.54,13.20],"144":[52.40,13.06],"200":[53.55,10.00],"204":[53.54,9.99],"220":[53.57,10.08],"213":[53.25,10.41],"216":[53.52,9.62],"217":[53.60,9.48],"228":[53.70,10.01],"235":[53.87,10.69],"241":[54.32,10.13],"253":[53.75,9.65],"254":[53.66,9.80],"281":[53.08,8.80],"292":[52.62,10.08],"341":[51.31,9.48],"345":[51.20,8.90],"603":[50.11,8.68],"803":[48.14,11.57],"804":[48.16,11.58],"852":[48.26,11.43],"854":[48.40,11.75],"880":[47.65,9.48],"881":[47.55,9.68],"882":[47.78,9.61],"883":[47.81,9.64],"884":[48.10,9.79]};
/* Österreich und Schweiz: Koordinaten je PLZ-Bereich (erste 2 Ziffern) */
NMA.AT2 = {"10":[48.21,16.37],"11":[48.19,16.40],"12":[48.24,16.40],"20":[48.38,16.21],"21":[48.34,16.33],"22":[48.34,16.72],"23":[48.09,16.28],"24":[48.03,16.78],"25":[48.01,16.23],"26":[47.72,16.08],"27":[47.81,16.24],"28":[47.70,16.15],"30":[48.33,16.05],"31":[48.20,15.63],"32":[48.01,15.60],"33":[48.12,14.87],"34":[48.33,16.05],"35":[48.41,15.60],"36":[48.23,15.33],"37":[48.66,15.66],"38":[48.77,14.98],"39":[48.60,15.17],"40":[48.31,14.29],"41":[48.57,13.99],"42":[48.51,14.50],"43":[48.25,14.63],"44":[48.04,14.42],"45":[47.91,14.12],"46":[48.16,14.03],"47":[48.23,13.83],"48":[47.98,13.70],"49":[48.21,13.49],"50":[47.80,13.04],"51":[47.95,13.00],"52":[48.26,13.03],"53":[47.90,13.20],"54":[47.68,13.10],"55":[47.42,13.22],"56":[47.35,13.20],"57":[47.32,12.80],"60":[47.27,11.39],"61":[47.28,11.50],"62":[47.35,11.71],"63":[47.58,12.17],"64":[47.24,10.74],"65":[47.14,10.57],"66":[47.49,10.72],"67":[47.15,9.82],"68":[47.32,9.67],"69":[47.50,9.75],"70":[47.85,16.52],"71":[47.95,16.84],"72":[47.74,16.40],"73":[47.50,16.50],"74":[47.29,16.21],"75":[47.06,16.32],"80":[47.07,15.44],"81":[47.22,15.62],"82":[47.28,15.97],"83":[46.95,15.89],"84":[46.78,15.54],"85":[46.82,15.22],"86":[47.41,15.27],"87":[47.38,15.09],"88":[47.11,14.17],"89":[47.57,14.24],"90":[46.62,14.31],"91":[46.66,14.63],"92":[46.72,14.10],"93":[46.77,14.36],"94":[46.84,14.84],"95":[46.61,13.85],"96":[46.63,13.37],"97":[46.80,13.50],"98":[46.80,13.50],"99":[46.83,12.77]};
NMA.CH2 = {"10":[46.52,6.63],"11":[46.51,6.50],"12":[46.20,6.15],"13":[46.61,6.51],"14":[46.78,6.64],"15":[46.82,6.94],"16":[46.62,7.06],"17":[46.81,7.15],"18":[46.46,6.85],"19":[46.23,7.36],"20":[46.99,6.93],"21":[46.91,6.61],"22":[46.99,6.93],"23":[47.10,6.83],"24":[47.06,6.75],"25":[47.14,7.25],"26":[47.15,6.99],"27":[47.28,7.37],"28":[47.36,7.34],"29":[47.42,7.08],"30":[46.95,7.45],"31":[46.90,7.50],"32":[47.07,7.31],"33":[47.06,7.62],"34":[47.00,7.70],"35":[46.88,7.62],"36":[46.76,7.63],"37":[46.69,7.68],"38":[46.69,7.86],"39":[46.32,7.99],"40":[47.56,7.59],"41":[47.48,7.73],"42":[47.42,7.50],"43":[47.55,7.79],"44":[47.48,7.73],"45":[47.21,7.54],"46":[47.35,7.90],"47":[47.29,7.71],"48":[47.29,7.95],"49":[47.21,7.79],"50":[47.39,8.04],"51":[47.48,8.21],"52":[47.39,8.18],"53":[47.59,8.29],"54":[47.47,8.31],"55":[47.39,8.18],"56":[47.35,8.28],"57":[47.26,8.18],"60":[47.05,8.31],"61":[47.10,8.20],"62":[47.17,8.11],"63":[47.17,8.52],"64":[47.02,8.65],"65":[46.19,9.02],"66":[46.17,8.80],"67":[46.36,8.97],"68":[46.00,8.95],"69":[46.00,8.95],"70":[46.85,9.53],"71":[46.77,9.20],"72":[46.97,9.56],"73":[47.00,9.50],"74":[46.70,9.44],"75":[46.50,9.84],"80":[47.38,8.54],"81":[47.45,8.58],"82":[47.70,8.63],"83":[47.35,8.72],"84":[47.50,8.72],"85":[47.56,8.90],"86":[47.32,8.80],"87":[47.23,8.82],"88":[47.23,8.67],"89":[47.40,8.40],"90":[47.42,9.37],"91":[47.39,9.28],"92":[47.46,9.05],"93":[47.48,9.48],"94":[47.38,9.55],"95":[47.46,9.05],"96":[47.30,9.10],"97":[47.17,9.47]};
NMA.geoOf = (plz, city, land) => {
  land = land || "DE";
  if (!plz && city && land === "DE") plz = NMA.CITYPLZ[String(city).trim().toLowerCase()];
  plz = String(plz || "");
  if (!NMA.plzOk(land, plz)) return null;
  if (land === "AT") return NMA.AT2[plz.slice(0, 2)] || null;
  if (land === "CH") return NMA.CH2[plz.slice(0, 2)] || null;
  return NMA.P5[plz] || NMA.P3[plz.slice(0, 3)] || NMA.P2[plz.slice(0, 2)] || null;
};
NMA.km = (a, b) => {
  if (!a || !b) return null;
  const r = x => x * Math.PI / 180, dLa = r(b[0] - a[0]), dLo = r(b[1] - a[1]);
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLo / 2) ** 2;
  return Math.round(12742 * Math.asin(Math.sqrt(h)));
};
/* Orte, in denen ein Profil "wohnen" kann (Demo-Auswahl; Server: alle Orte Deutschlands) */
NMA.TOWNS_DE = ("Hamburg-Altona,53.55,9.94;Pinneberg,53.66,9.80;Elmshorn,53.75,9.65;Norderstedt,53.70,10.01;Ahrensburg,53.67,10.24;Reinbek,53.51,10.25;Geesthacht,53.44,10.37;Buxtehude,53.48,9.70;Stade,53.60,9.48;Lüneburg,53.25,10.41;Buchholz,53.33,9.87;Winsen (Luhe),53.36,10.21;Bad Oldesloe,53.81,10.38;Quickborn,53.73,9.91;Wedel,53.58,9.70;Bargteheide,53.73,10.27;Seevetal,53.40,10.03;Tostedt,53.28,9.71;"
 + "Berlin-Spandau,52.54,13.20;Berlin-Köpenick,52.45,13.58;Berlin-Pankow,52.57,13.40;Potsdam,52.40,13.06;Oranienburg,52.75,13.24;Bernau,52.68,13.59;Königs Wusterhausen,52.30,13.63;Falkensee,52.56,13.08;Strausberg,52.58,13.88;Ludwigsfelde,52.30,13.26;Erkner,52.42,13.75;Nauen,52.61,12.88;"
 + "Dachau,48.26,11.43;Freising,48.40,11.75;Erding,48.31,11.91;Starnberg,48.00,11.34;Fürstenfeldbruck,48.18,11.25;Germering,48.13,11.37;Unterschleißheim,48.28,11.58;Ottobrunn,48.06,11.66;Wolfratshausen,47.91,11.42;Ebersberg,48.08,11.97;Markt Schwaben,48.19,11.87;Holzkirchen,47.88,11.70;Augsburg,48.37,10.90;Rosenheim,47.86,12.12;"
 + "Ravensburg,47.78,9.61;Friedrichshafen,47.65,9.48;Lindau,47.55,9.68;Wangen,47.69,9.83;Weingarten,47.81,9.64;Biberach,48.10,9.79;Leutkirch,47.83,10.02;Memmingen,47.98,10.18;Kempten,47.73,10.31;Überlingen,47.77,9.16;"
 + "Köln-Ehrenfeld,50.95,6.92;Bergisch Gladbach,50.99,7.13;Leverkusen,51.03,6.98;Brühl,50.83,6.90;Frechen,50.91,6.81;Pulheim,51.00,6.80;Troisdorf,50.82,7.15;Bonn,50.73,7.10;Düsseldorf,51.23,6.78;Neuss,51.20,6.69;Solingen,51.17,7.08;Siegburg,50.80,7.20;"
 + "Essen,51.46,7.01;Bochum,51.48,7.22;Dortmund,51.51,7.47;Gelsenkirchen,51.51,7.10;Recklinghausen,51.61,7.20;Hagen,51.36,7.47;Duisburg,51.43,6.76;Oberhausen,51.47,6.85;Witten,51.44,7.34;Unna,51.54,7.69;"
 + "Offenbach,50.10,8.77;Bad Homburg,50.23,8.62;Hanau,50.13,8.92;Darmstadt,49.87,8.65;Wiesbaden,50.08,8.24;Mainz,49.99,8.25;Friedberg,50.34,8.75;Rüsselsheim,49.99,8.41;Langen,49.99,8.67;Bad Vilbel,50.18,8.74;Oberursel,50.20,8.58;Dreieich,50.02,8.69;"
 + "Kassel,51.31,9.48;Baunatal,51.25,9.42;Vellmar,51.36,9.47;Hofgeismar,51.50,9.38;Melsungen,51.13,9.55;Fritzlar,51.13,9.27;Bad Wildungen,51.12,9.12;Korbach,51.27,8.87;Willingen,51.29,8.61;Homberg (Efze),51.03,9.40;Wolfhagen,51.33,9.17;Hann. Münden,51.42,9.65;Eschwege,51.19,10.05;Göttingen,51.54,9.93;"
 + "Hannover-Linden,52.36,9.71;Langenhagen,52.44,9.74;Garbsen,52.42,9.60;Laatzen,52.31,9.81;Lehrte,52.37,9.98;Burgdorf,52.45,10.01;Hildesheim,52.15,9.95;Celle,52.62,10.08;Wunstorf,52.43,9.43;Peine,52.32,10.23;"
 + "Bremen-Vegesack,53.17,8.62;Delmenhorst,53.05,8.63;Achim,53.01,9.03;Osterholz-Scharmbeck,53.23,8.79;Syke,52.91,8.83;Verden,52.92,9.23;Oldenburg,53.14,8.21;Bremerhaven,53.55,8.58;"
 + "Esslingen,48.74,9.31;Ludwigsburg,48.89,9.19;Böblingen,48.68,9.01;Sindelfingen,48.71,9.00;Waiblingen,48.83,9.32;Fellbach,48.81,9.28;Leonberg,48.80,9.01;Göppingen,48.70,9.65;Backnang,48.95,9.43;Kirchheim (Teck),48.65,9.45;Tübingen,48.52,9.06;Reutlingen,48.49,9.21;"
 + "Fürth,49.48,10.99;Erlangen,49.60,11.00;Schwabach,49.33,11.02;Lauf,49.51,11.28;Zirndorf,49.44,10.95;Roth,49.25,11.09;Herzogenaurach,49.57,10.88;Neumarkt,49.28,11.46;"
 + "Markkleeberg,51.28,12.37;Schkeuditz,51.40,12.22;Taucha,51.38,12.49;Grimma,51.24,12.73;Halle (Saale),51.48,11.97;Delitzsch,51.53,12.34;Borna,51.12,12.50;"
 + "Radebeul,51.11,13.66;Pirna,50.96,13.94;Freital,51.00,13.65;Meißen,51.16,13.47;Coswig,51.13,13.58;Radeberg,51.12,13.92;"
 + "Kiel,54.32,10.13;Lübeck,53.87,10.69;Neumünster,54.07,9.98;Rendsburg,54.30,9.66;Eckernförde,54.47,9.84;Bad Segeberg,53.94,10.31;Plön,54.16,10.42;"
 + "Münster,51.96,7.63;Osnabrück,52.28,8.05;Bielefeld,52.02,8.53;Rostock,54.09,12.10;Schwerin,53.63,11.41;Magdeburg,52.13,11.63;Erfurt,50.98,11.03;Saarbrücken,49.24,6.99;Karlsruhe,49.01,8.40;Freiburg,47.99,7.84;Regensburg,49.01,12.10;Würzburg,49.79,9.95;Mannheim,49.49,8.47;Heidelberg,49.40,8.69;Koblenz,50.36,7.59;Trier,49.75,6.64;Braunschweig,52.27,10.52;Wolfsburg,52.42,10.79;Aachen,50.78,6.08;Paderborn,51.72,8.75;Fulda,50.55,9.68;Gießen,50.58,8.68;Ulm,48.40,9.99;Ingolstadt,48.77,11.43;Passau,48.57,13.43;Chemnitz,50.83,12.92;Cottbus,51.76,14.33;Jena,50.93,11.59;Siegen,50.87,8.02");
NMA.TOWNS_AT = "Wien-Favoriten,48.17,16.38;Wien-Floridsdorf,48.26,16.40;Wien-Döbling,48.25,16.34;Klosterneuburg,48.31,16.33;Korneuburg,48.34,16.33;Stockerau,48.38,16.21;Mödling,48.09,16.28;Baden,48.01,16.23;Schwechat,48.14,16.48;Wiener Neustadt,47.81,16.24;Neunkirchen,47.72,16.08;Tulln,48.33,16.05;St. Pölten,48.20,15.63;Krems,48.41,15.60;Melk,48.23,15.33;Amstetten,48.12,14.87;Zwettl,48.60,15.17;Gmünd,48.77,14.98;Horn,48.66,15.66;Gänserndorf,48.34,16.72;"
 + "Linz,48.31,14.29;Leonding,48.28,14.25;Traun,48.22,14.24;Wels,48.16,14.03;Steyr,48.04,14.42;Enns,48.21,14.48;Freistadt,48.51,14.50;Perg,48.25,14.63;Gmunden,47.92,13.80;Vöcklabruck,48.00,13.66;Ried im Innkreis,48.21,13.49;Braunau,48.26,13.03;Grieskirchen,48.23,13.83;Kirchdorf,47.91,14.12;"
 + "Salzburg,47.80,13.04;Wals-Siezenheim,47.79,12.98;Hallein,47.68,13.10;Seekirchen,47.90,13.13;Bischofshofen,47.42,13.22;St. Johann im Pongau,47.35,13.20;Zell am See,47.32,12.80;Saalfelden,47.43,12.85;"
 + "Innsbruck,47.27,11.39;Hall in Tirol,47.28,11.51;Telfs,47.31,11.07;Schwaz,47.35,11.71;Wörgl,47.49,12.06;Kufstein,47.58,12.17;Kitzbühel,47.45,12.39;Imst,47.24,10.74;Landeck,47.14,10.57;Reutte,47.49,10.72;Lienz,46.83,12.77;"
 + "Bregenz,47.50,9.75;Dornbirn,47.41,9.74;Hohenems,47.36,9.69;Feldkirch,47.24,9.60;Bludenz,47.15,9.82;"
 + "Eisenstadt,47.85,16.52;Neusiedl am See,47.95,16.84;Mattersburg,47.74,16.40;Oberpullendorf,47.50,16.50;Oberwart,47.29,16.21;Güssing,47.06,16.32;"
 + "Graz,47.07,15.44;Gratwein,47.13,15.33;Gleisdorf,47.10,15.71;Weiz,47.22,15.62;Hartberg,47.28,15.97;Feldbach,46.95,15.89;Leibnitz,46.78,15.54;Deutschlandsberg,46.82,15.22;Voitsberg,47.04,15.15;Bruck an der Mur,47.41,15.27;Kapfenberg,47.44,15.29;Leoben,47.38,15.09;Judenburg,47.17,14.66;Murau,47.11,14.17;Liezen,47.57,14.24;"
 + "Klagenfurt,46.62,14.31;Villach,46.61,13.85;Feldkirchen in Kärnten,46.72,14.10;St. Veit an der Glan,46.77,14.36;Völkermarkt,46.66,14.63;Wolfsberg,46.84,14.84;Spittal an der Drau,46.80,13.50;Hermagor,46.63,13.37";
NMA.TOWNS_CH = "Zürich-Oerlikon,47.41,8.54;Zürich-Altstetten,47.39,8.49;Kloten,47.45,8.58;Dübendorf,47.40,8.62;Uster,47.35,8.72;Wetzikon,47.32,8.80;Winterthur,47.50,8.72;Dietikon,47.40,8.40;Horgen,47.26,8.60;Wädenswil,47.23,8.67;Bülach,47.52,8.54;Rapperswil-Jona,47.23,8.82;Schaffhausen,47.70,8.63;Frauenfeld,47.56,8.90;"
 + "Baden,47.47,8.31;Wettingen,47.47,8.33;Aarau,47.39,8.04;Lenzburg,47.39,8.18;Brugg,47.48,8.21;Wohlen,47.35,8.28;Zofingen,47.29,7.95;Olten,47.35,7.90;Solothurn,47.21,7.54;Grenchen,47.19,7.40;"
 + "Basel-Kleinbasel,47.57,7.60;Riehen,47.58,7.65;Allschwil,47.55,7.54;Muttenz,47.52,7.65;Liestal,47.48,7.73;Rheinfelden,47.55,7.79;Laufen,47.42,7.50;"
 + "Bern-Bümpliz,46.94,7.39;Köniz,46.92,7.41;Ostermundigen,46.96,7.49;Burgdorf,47.06,7.62;Langenthal,47.21,7.79;Lyss,47.07,7.31;Biel,47.14,7.25;Thun,46.76,7.63;Spiez,46.69,7.68;Interlaken,46.69,7.86;Münsingen,46.87,7.56;"
 + "Luzern,47.05,8.31;Kriens,47.03,8.28;Emmen,47.08,8.30;Sursee,47.17,8.11;Zug,47.17,8.52;Baar,47.20,8.53;Cham,47.18,8.46;Schwyz,47.02,8.65;Einsiedeln,47.13,8.75;Glarus,47.04,9.07;"
 + "St. Gallen,47.42,9.37;Gossau,47.42,9.25;Wil,47.46,9.05;Herisau,47.39,9.28;Rorschach,47.48,9.49;Arbon,47.52,9.43;Altstätten,47.38,9.55;Buchs SG,47.17,9.47;Kreuzlingen,47.65,9.17;"
 + "Chur,46.85,9.53;Landquart,46.97,9.56;Davos,46.80,9.84;St. Moritz,46.50,9.84;"
 + "Lausanne,46.52,6.63;Morges,46.51,6.50;Renens,46.54,6.59;Vevey,46.46,6.85;Montreux,46.43,6.91;Yverdon-les-Bains,46.78,6.64;Nyon,46.38,6.24;Genf,46.20,6.15;Carouge,46.18,6.14;Fribourg,46.81,7.15;Bulle,46.62,7.06;Neuenburg,46.99,6.93;La Chaux-de-Fonds,47.10,6.83;Sitten,46.23,7.36;Martigny,46.10,7.07;Brig,46.32,7.99;"
 + "Lugano,46.00,8.95;Mendrisio,45.87,8.98;Bellinzona,46.19,9.02;Locarno,46.17,8.80";
NMA.TOWNS = [["DE", NMA.TOWNS_DE], ["AT", NMA.TOWNS_AT], ["CH", NMA.TOWNS_CH]].flatMap(([land, str]) =>
  str.split(";").map(x => { const a = x.split(","); return { ort: a[0], g: [+a[1], +a[2]], land }; }));

/* ---------------- KONTAKT-ORT ----------------
   Ein Profil "wohnt" für jeden Kunden in dessen Umkreis – festgelegt beim ersten Kontakt
   (erstes Ansehen, Herz, Massenversand, Chat) und danach für diesen Kunden nie mehr geändert.
   Gespeichert pro Paar Kunde + Profil (Demo: localStorage "kOrt"; Server: Tabelle kontakt_ort).
   cust = {nick, plz, radius, city, land}. Profile wohnen immer im Land des Kunden. dry=true: nur berechnen, nicht festlegen (z. B. Vorschau). */
NMA.wohnortModus = () => (NMA.store.get("mvCfg", {}).wohnort || "kontakt");
NMA.kontaktOrt = (p, cust, dry) => {
  if (!p || !cust || !cust.nick) return null;
  const all = NMA.store.get("kOrt", {}), mine = all[cust.nick] || (all[cust.nick] = {});
  if (mine[p.id]) return mine[p.id];
  const land = cust.land || "DE", cg = NMA.geoOf(cust.plz, cust.city, land); if (!cg) return null;
  let R = +cust.radius || 50; if (R > 150) R = 80;
  const own = String(cust.city || "").toLowerCase();
  const near = NMA.TOWNS.filter(t => t.land === land).map(t => ({ ort: t.ort, km: NMA.km(cg, t.g) })).filter(t => t.ort.toLowerCase() !== own).sort((a, b) => a.km - b.km);
  let pool = near.filter(t => t.km >= 5 && t.km <= R);
  if (!pool.length) pool = near.filter(t => t.km >= 3).slice(0, 3);
  if (!pool.length) pool = near.slice(0, 1);
  let h = 0; for (const ch of cust.nick + "|" + p.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const t = pool[h % pool.length];
  const res = { ort: t.ort, km: Math.max(1, t.km), t: Date.now() };
  if (dry) return res;
  mine[p.id] = res; NMA.store.set("kOrt", all);
  return res;
};
NMA.me = () => { const u = NMA.user(); return { nick: u.nick, plz: u.plz, radius: u.radius, city: u.city, land: u.land || "DE" }; };

/* Kundenseiten: Wohnort und Entfernung jedes Profils für DIESEN Kunden anzeigen (nur im Speicher, nie zurückschreiben) */
{
  const pg = (document.body && document.body.dataset.page) || "";
  if (!/^team/.test(pg) && NMA.wohnortModus() === "kontakt") {
    const me = NMA.me();
    NMA.profiles.forEach(p => { const k = NMA.kontaktOrt(p, me); if (k) { p.homeCity = p.city; p.city = k.ort; p.km = k.km; } });
  }
}

/* ---------------- LIVE-NACHRICHTEN (wie WhatsApp) ----------------
   Neue Nachrichten erscheinen sofort, ohne die Seite neu zu laden.
   Demo: zwischen offenen Tabs desselben Browsers (Kundenseite ↔ Mitarbeiterbereich) über den Browser-Speicher.
   SERVER: NMA.liveConfig.url mit einer WebSocket-Adresse füllen, z. B. "wss://eure-domain.de/live".
   Der Server schickt pro neuer Nachricht JSON: {type:"msg", id, pid, text, t}.
   Kunde schreibt: Nachricht per API an den Server, der sie live an den zuständigen Mitarbeiter weitergibt. */
NMA.liveConfig = { url: "" };
NMA.markRead = pid => { const m = NMA.store.get("custMsgs", []); let ch = false; m.forEach(x => { if (x.pid === pid && !x.read) { x.read = true; ch = true; } }); if (ch) NMA.store.set("custMsgs", m); };
NMA.chatBadge = () => {
  const n = Object.values(NMA.unread).reduce((a, b) => a + b, 0);
  document.querySelectorAll('a[href="chat.html"]').forEach(a => {
    let b = a.querySelector(".badge"); if (!n) { b && b.remove(); return; }
    if (!b) { b = document.createElement("span"); b.className = "badge"; const lbl = a.querySelector("svg") && a.querySelector("span:last-child"); lbl ? a.insertBefore(b, lbl) : a.appendChild(b); }
    b.textContent = n;
  });
};
{
  const me = NMA.user().nick, seen = new Set();
  const day = t => { const d = new Date(t); return d.toDateString() === new Date().toDateString() ? "Heute" : d.toLocaleDateString("de-DE"); };
  const put = (pid, msg) => { const c = NMA.chats[pid] || (NMA.chats[pid] = []); const dd = day(msg.t); if (!c.some(x => x.d === dd)) c.push({ d: dd }); c.push(msg); };
  /* beim Laden: eigene gesendete + empfangene Nachrichten zeitlich sortiert einfügen */
  const incoming = NMA.store.get("custMsgs", []).filter(m => m.to === me && NMA.profiles.some(p => p.id === m.pid));
  const own = NMA.store.get("custOwn", []).filter(m => m.from === me);
  [...incoming.map(m => ({ k: "in", ...m })), ...own.map(m => ({ k: "out", ...m }))].sort((a, b) => a.t - b.t).forEach(m => {
    seen.add(m.id || m.t + m.text);
    put(m.pid, { t: m.k === "in" ? "them" : "me", x: m.text, h: new Date(m.t).toTimeString().slice(0, 5) });
    if (m.k === "in" && !m.read) NMA.unread[m.pid] = (NMA.unread[m.pid] || 0) + 1;
  });
  /* neue Nachricht empfangen → sofort anzeigen */
  const receive = m => {
    const key = m.id || m.t + m.text; if (seen.has(key)) return; seen.add(key);
    const p = NMA.profiles.find(x => x.id === m.pid); if (!p) return;
    put(m.pid, { t: "them", x: m.text, h: new Date(m.t).toTimeString().slice(0, 5) });
    const open = document.body.dataset.page === "chat" && NMA.param("mit") === m.pid && !document.hidden;
    if (!open) NMA.unread[m.pid] = (NMA.unread[m.pid] || 0) + 1;
    NMA.chatBadge();
    dispatchEvent(new CustomEvent("nma:msg", { detail: { pid: m.pid, open } }));
    if (!open) NMA.toast(`💬 Neue Nachricht von ${p.name}`);
    if (NMA.store.get("chatSound", false)) { try { const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(.08, a.currentTime); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + .35); o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + .35); } catch (err) {} }
    if (document.hidden) { const t0 = document.title; document.title = `(1) Neue Nachricht – ${p.name}`; addEventListener("focus", () => document.title = t0, { once: true }); }
  };
  addEventListener("storage", e => { if (e.key === "nma_custMsgs") NMA.store.get("custMsgs", []).filter(m => m.to === me).forEach(receive); });
  /* echter Server: WebSocket */
  if (NMA.liveConfig.url && !/^team/.test(document.body.dataset.page || "")) {
    const connect = (wait = 1000) => { try { const ws = new WebSocket(NMA.liveConfig.url); ws.onmessage = e => { try { const d = JSON.parse(e.data); if (d.type === "msg") receive(d); } catch (err) {} }; ws.onclose = () => setTimeout(() => connect(Math.min(wait * 2, 30000)), wait); } catch (err) {} };
    connect();
  }
  NMA.chatBadge();
}

/* ---------------- FAVORITEN ----------------
   Kunde markiert Profile mit ☆. Benachrichtigungen können auf „nur Favoriten“ gestellt werden.
   SERVER: Favoriten pro Kunde speichern; beim Push prüfen: Modus „favoriten“ → nur wenn Profil in den Favoriten. */
NMA.favs = () => NMA.store.get("favs", []);
NMA.isFav = id => NMA.favs().includes(id);
NMA.toggleFav = id => { const f = NMA.favs(), on = !f.includes(id); NMA.store.set("favs", on ? [...f, id] : f.filter(x => x !== id)); const p = NMA.get && NMA.get(id); NMA.toast(on ? `☆ ${p ? p.name : "Profil"} ist jetzt ein Favorit.` : "Aus den Favoriten entfernt."); return on; };
NMA.pushMode = () => NMA.store.get("pushMode", "alle");      /* "alle" | "favoriten" | "aus" */

/* ---------------- FRAGE NACH DEM ANMELDEN: Benachrichtigungen ----------------
   Erscheint genau EINMAL direkt nach der Registrierung. „Nein“ = keine Benachrichtigungen (änderbar in den Einstellungen). */
{
  const pg = (document.body && document.body.dataset.page) || "";
  NMA.askPush = () => {
    if (!NMA.store.get("pushAsk", false) || !/^(uebersicht|suche|chat|mein-profil)$/.test(pg) || document.querySelector(".lock")) return;
    NMA.store.set("pushAsk", false);
    const m = document.createElement("div"); m.className = "modal";
    m.innerHTML = `<div class="card" role="dialog" aria-modal="true" aria-labelledby="pqT" style="max-width:460px">
      <h2 id="pqT">Benachrichtigungen erhalten?</h2>
      <p class="muted">Wir sagen dir Bescheid, sobald jemand dir schreibt – wie bei WhatsApp, auch wenn die App geschlossen ist.</p>
      <div style="display:grid;gap:10px;margin:16px 0 6px">
        <button class="btn primary" data-pm="alle">🔔 Bei allen neuen Nachrichten</button>
        <button class="btn" data-pm="favoriten">☆ Nur bei meinen Favoriten</button>
        <button class="btn ghost" data-pm="aus">Nein, keine Benachrichtigungen</button>
      </div>
      <p class="hint" style="margin:8px 0 0">Favoriten markierst du mit ☆ im Profil oder im Chat. Ändern kannst du das jederzeit unter Einstellungen.</p></div>`;
    document.body.appendChild(m);
    m.querySelectorAll("[data-pm]").forEach(b => b.addEventListener("click", async () => {
      const mode = b.dataset.pm; NMA.store.set("pushMode", mode); NMA.store.set("pushModeSet", true); m.remove();
      if (mode === "aus") { if (NMA.push) NMA.push.disable(); NMA.toast("Okay, du bekommst keine Benachrichtigungen. Ändern kannst du das in den Einstellungen."); return; }
      if (!NMA.push) { NMA.toast("Gespeichert."); return; }
      const c = NMA.push.check();
      if (!c.ok) { NMA.toast(c.ios ? "Auf dem iPhone geht das erst in der installierten App – siehe „App installieren“." : "Gespeichert. Benachrichtigungen funktionieren auf der echten Seite bzw. in der App."); return; }
      try { await NMA.push.enable(NMA.store.get("pushPreview", false), mode); NMA.toast(mode === "alle" ? "🔔 Du wirst bei neuen Nachrichten benachrichtigt." : "☆ Du wirst nur bei Nachrichten deiner Favoriten benachrichtigt."); }
      catch (err) { NMA.toast(err.message); }
    }));
  };
  setTimeout(() => { if (!NMA.lockBusy) NMA.askPush(); }, 700);   /* die App-Sperre ruft askPush nach dem Einrichten selbst auf */
}
