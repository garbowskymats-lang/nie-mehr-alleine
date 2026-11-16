/* Nie mehr alleine – gemeinsames Skript für alle Seiten.
   Alles hier ist Demo: Daten, Coins und Nachrichten liegen nur im Browser.
   Der Server-Entwickler ersetzt die Funktionen im Abschnitt "DATEN" durch echte API-Aufrufe. */
{
const NMA = window.NMA = {};

/* ---------------- DATEN (Demo) ---------------- */
NMA.profiles = [
  {id:"lena",   name:"Gitarren Lena",    age:52, city:"Hamburg",     km:8,  online:true,  sex:"w", photo:"assets/hero-romance.png", about:"Ich liebe Musik, spontane Ausflüge und Gespräche, bei denen man die Zeit vergisst. Mein perfekter Sonntag beginnt mit Kaffee und endet irgendwo am Wasser.", tags:["Gitarre","Konzerte","Natur"], looking:"Beziehung", job:"Musiklehrerin", height:"168 cm", status:"Verwitwet"},
  {id:"sabine", name:"Sabine Herz",  age:58, city:"Lüneburg",    km:14, online:true,  sex:"w", g:"linear-gradient(145deg,#c0796a,#4a2b2e)", about:"Lebensfroh, neugierig und gern unterwegs. Ich koche gern für zwei und suche jemanden, der mitisst und mitlacht.", tags:["Kochen","Reisen","Garten"], looking:"Beziehung", job:"Köchin", height:"165 cm", status:"Geschieden"},
  {id:"petra",  name:"Tanzmaus Petra",   age:49, city:"Buxtehude",   km:22, online:false, last:"vor 2 Std.", sex:"w", g:"linear-gradient(145deg,#8a6aa8,#2c2240)", about:"Tanzen, Radfahren und ein gutes Buch auf dem Balkon. Ehrlichkeit ist mir wichtig.", tags:["Tanzen","Radfahren","Lesen"], looking:"Abenteuer", job:"Bürokauffrau", height:"171 cm", status:"Single"},
  {id:"monika", name:"Monika am Meer",  age:61, city:"Stade",       km:31, online:true,  sex:"w", g:"linear-gradient(145deg,#c79a54,#4b3517)", about:"Ich bin gern draußen mit meinem Hund und freue mich über jemanden für Spaziergänge und gemütliche Abende.", tags:["Hund","Wandern","Kaffee"], looking:"Beziehung", job:"Rentnerin", height:"162 cm", status:"Verwitwet"},
  {id:"andrea", name:"Andrea Lächeln",  age:45, city:"Norderstedt", km:18, online:false, last:"gestern", sex:"w", g:"linear-gradient(145deg,#4f8f87,#173a37)", about:"Humor mit Tiefgang, Meer und Fotografie. Wer mich zum Lachen bringt, hat schon gewonnen.", tags:["Meer","Fotografie","Kino"], looking:"Abenteuer", job:"Fotografin", height:"174 cm", status:"Single"},
  {id:"karin",  name:"Theater Karin",   age:55, city:"Pinneberg",   km:26, online:true,  sex:"w", g:"linear-gradient(145deg,#b0566f,#3b1825)", about:"Ich gehe gern ins Theater, mag Städtereisen und suche einen Mann mit Herz und Zeit.", tags:["Theater","Städtereisen","Wein"], looking:"Beziehung", job:"Buchhändlerin", height:"166 cm", status:"Geschieden"},
  {id:"thomas", name:"Bikerthomas",  age:57, city:"Hamburg",     km:5,  online:true,  sex:"m", g:"linear-gradient(145deg,#5b7aa0,#1c2a3c)", about:"Handwerker im Ruhestand, gern am Grill und auf dem Motorrad.", tags:["Motorrad","Grillen","Fußball"], looking:"Abenteuer", job:"Tischler", height:"182 cm", status:"Geschieden"},
  {id:"rainer", name:"Gärtner Rainer",  age:63, city:"Elmshorn",    km:35, online:false, last:"vor 5 Std.", sex:"m", g:"linear-gradient(145deg,#7b8a5a,#283019)", about:"Ruhig, verlässlich und gern im Garten. Ich suche eine Frau für gemeinsame Ausflüge.", tags:["Garten","Ausflüge","Angeln"], looking:"Beziehung", job:"Gärtner", height:"178 cm", status:"Verwitwet"}
];
NMA.get = id => NMA.profiles.find(p => p.id === id) || NMA.profiles[0];

NMA.chats = {
  lena:  [{d:"Heute"},{t:"them",x:"Hallo! Dein Profil klingt sympathisch. Spielst du auch ein Instrument?",h:"18:34"},{t:"me",x:"Ein bisschen Gitarre, am liebsten draußen im Sommer.",h:"18:36"},{t:"them",x:"Das klingt schön 😊 Erzähl mir mehr von dir!",h:"18:39"}],
  sabine:[{d:"Heute"},{t:"them",x:"Guten Abend! Hast du am Wochenende schon etwas vor?",h:"18:31"},{t:"them",x:"Ich würde mich freuen, von dir zu hören.",h:"18:31"}],
  monika:[{d:"Gestern"},{t:"me",x:"Hallo Monika, wie heißt denn dein Hund?",h:"20:10"},{t:"them",x:"Er heißt Bruno und ist ein echter Schatz.",h:"20:22"}],
  andrea:[{d:"Montag"},{t:"them",x:"Das Foto vom Meer ist wirklich schön. Wo war das?",h:"09:12"}]
};
NMA.unread = {sabine:2};

NMA.mails = [
  {id:1, from:"karin",  subj:"Hallo von mir", date:"Heute, 14:05", unread:true, text:"Hallo,\n\nich bin über dein Profil gestolpert und musste schmunzeln. Magst du auch Theater? Ich würde mich über eine Antwort freuen.\n\nLiebe Grüße\nKarin"},
  {id:2, from:"petra",  subj:"Danke für dein Interesse", date:"Gestern, 19:40", unread:false, text:"Hallo,\n\ndanke für das Herz! Ich schaue mich hier noch in Ruhe um, aber schreib mir gern im Chat.\n\nPetra"},
  {id:3, from:"system", subj:"Willkommen bei Nie mehr alleine", date:"12.11.2026", unread:false, text:"Schön, dass du da bist!\n\nVervollständige dein Profil mit einem Foto und ein paar Sätzen über dich. Profile mit Foto bekommen deutlich mehr Nachrichten.\n\nDein Team von Nie mehr alleine"}
];

NMA.packs = [ /* Beispielpreise – werden vom Betreiber festgelegt */
  {coins:25,  price:19},{coins:50, price:38},{coins:100,price:75,flag:"Beliebt"},
  {coins:200, price:148},{coins:500,price:340},{coins:1000,price:590,flag:"Bester Preis"}
];
NMA.costPerChat = 1;   /* Coins pro Chatnachricht */
NMA.costPerMail = 0;   /* Coins pro Mail */

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
NMA.user = () => store.get("user",{nick:"Michael Nordlicht",vorname:"Michael",age:56,plz:"20095",city:"Hamburg",radius:"50",job:"Elektriker",about:"Ich freue mich auf nette Gespräche und vielleicht mehr.",looking:"Beziehung"});
/* Vergebene Nicknames (Demo). Jeder Nickname darf nur einmal existieren – der Server prüft das endgültig. */
NMA.takenNicks = () => NMA.profiles.map(p=>p.name).concat(["Blonde Carola","Claudia Herz"]);
NMA.nickFree = n => !NMA.takenNicks().some(t=>t.toLowerCase()===n.trim().toLowerCase());
NMA.notice = "Unterhaltungs-Chat mit moderierten Profilen: Die Profile werden von Moderatoren geführt.";

/* ---------------- Hilfsfunktionen ---------------- */
NMA.esc = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
NMA.avatar = (p,cls="",on=true) => {
  const bg = p.photo ? `background-image:url('${p.photo}');background-position:22% 25%;background-size:260%` : `--g:${p.g}`;
  return `<span class="avatar ${cls}" style="${bg}">${p.photo?"":p.name[0]}${on&&p.online?'<i class="on"></i>':""}</span>`;
};
NMA.photo = p => {
  const bg = p.photo ? `background-image:linear-gradient(transparent 55%,#071012cc),url('${p.photo}');background-position:24% 30%` : `--g:${p.g}`;
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
  const mailUnread = NMA.mails.filter(m=>m.unread).length;
  const items = [
    ["uebersicht","Übersicht","home",0],["suche","Suche","search",0],
    ["chat","Chat","chat",chatUnread],["postfach","Postfach","mail",mailUnread],["mein-profil","Mein Bereich","me",0]
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
foot.innerHTML=`<span>© 2026 Nie mehr alleine · Unterhaltungs-Chat mit moderierten Profilen · ab 18</span><nav><a href="rechtliches.html#impressum">Impressum</a><a href="rechtliches.html#datenschutz">Datenschutz</a><a href="rechtliches.html#agb">AGB</a><a href="hilfe.html">Hilfe</a></nav>`;
if(!document.body.classList.contains("full")) document.body.appendChild(foot);

/* Demo-Formulare: kein Absenden an einen Server */
document.querySelectorAll("form[data-next]").forEach(f=>f.addEventListener("submit",e=>{
  e.preventDefault();
  if(f.checkValidity()) location.href=f.dataset.next;
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
  try { if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(()=>{}); } catch (e) {}

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
      n: "Auf der fertigen Seite öffnet der Knopf diesen Dialog automatisch." };
    if (isFirefox) return { t: "Am PC installieren", s: [
      `Firefox kann Web-Apps am PC nicht installieren.`, `Öffne die Seite in <b>Chrome</b> oder <b>Edge</b>.`, `Klicke dort rechts in der Adressleiste auf ${inst} und dann auf <b>Installieren</b>.`] };
    return { t: "Am PC installieren", s: [
      `Klicke rechts in der Adressleiste auf ${inst} <b>App installieren</b>.`, `Falls das Symbol fehlt: Menü ${dots} → <b>Streamen, speichern und teilen</b> → <b>Seite als App installieren</b>.`, `Bestätige mit <b>Installieren</b>.`],
      n: "Auf der fertigen Seite öffnet der Knopf diesen Dialog automatisch." };
  };

  const guide = () => {
    const g = steps();
    const m = document.createElement("div"); m.className = "modal install-sheet";
    m.innerHTML = `<div class="card" role="dialog" aria-modal="true" aria-labelledby="igT">
      <div class="ig-head"><img src="assets/icon-192.png" alt="" width="52" height="52"><h2 id="igT">${g.t}</h2></div>
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
NMA.geoOf = (plz, city) => {
  if (!plz && city) plz = NMA.CITYPLZ[String(city).trim().toLowerCase()];
  plz = String(plz || ""); if (/^\d{4}$/.test(plz)) plz = "0" + plz;
  if (!/^\d{5}$/.test(plz)) return null;
  return NMA.P5[plz] || NMA.P2[plz.slice(0, 2)] || null;
};
NMA.km = (a, b) => {
  if (!a || !b) return null;
  const r = x => x * Math.PI / 180, dLa = r(b[0] - a[0]), dLo = r(b[1] - a[1]);
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLo / 2) ** 2;
  return Math.round(12742 * Math.asin(Math.sqrt(h)));
};
/* Orte, in denen ein Profil "wohnen" kann (Demo-Auswahl; Server: alle Orte Deutschlands) */
NMA.TOWNS = ("Hamburg-Altona,53.55,9.94;Pinneberg,53.66,9.80;Elmshorn,53.75,9.65;Norderstedt,53.70,10.01;Ahrensburg,53.67,10.24;Reinbek,53.51,10.25;Geesthacht,53.44,10.37;Buxtehude,53.48,9.70;Stade,53.60,9.48;Lüneburg,53.25,10.41;Buchholz,53.33,9.87;Winsen (Luhe),53.36,10.21;Bad Oldesloe,53.81,10.38;Quickborn,53.73,9.91;Wedel,53.58,9.70;Bargteheide,53.73,10.27;Seevetal,53.40,10.03;Tostedt,53.28,9.71;"
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
 + "Münster,51.96,7.63;Osnabrück,52.28,8.05;Bielefeld,52.02,8.53;Rostock,54.09,12.10;Schwerin,53.63,11.41;Magdeburg,52.13,11.63;Erfurt,50.98,11.03;Saarbrücken,49.24,6.99;Karlsruhe,49.01,8.40;Freiburg,47.99,7.84;Regensburg,49.01,12.10;Würzburg,49.79,9.95;Mannheim,49.49,8.47;Heidelberg,49.40,8.69;Koblenz,50.36,7.59;Trier,49.75,6.64;Braunschweig,52.27,10.52;Wolfsburg,52.42,10.79;Aachen,50.78,6.08;Paderborn,51.72,8.75;Fulda,50.55,9.68;Gießen,50.58,8.68;Ulm,48.40,9.99;Ingolstadt,48.77,11.43;Passau,48.57,13.43;Chemnitz,50.83,12.92;Cottbus,51.76,14.33;Jena,50.93,11.59;Siegen,50.87,8.02")
 .split(";").map(x => { const a = x.split(","); return { ort: a[0], g: [+a[1], +a[2]] }; });

/* ---------------- KONTAKT-ORT ----------------
   Ein Profil "wohnt" für jeden Kunden in dessen Umkreis – festgelegt beim ersten Kontakt
   (erstes Ansehen, Herz, Massenversand, Chat) und danach für diesen Kunden nie mehr geändert.
   Gespeichert pro Paar Kunde + Profil (Demo: localStorage "kOrt"; Server: Tabelle kontakt_ort).
   cust = {nick, plz, radius, city}. dry=true: nur berechnen, nicht festlegen (z. B. Vorschau). */
NMA.wohnortModus = () => (NMA.store.get("mvCfg", {}).wohnort || "kontakt");
NMA.kontaktOrt = (p, cust, dry) => {
  if (!p || !cust || !cust.nick) return null;
  const all = NMA.store.get("kOrt", {}), mine = all[cust.nick] || (all[cust.nick] = {});
  if (mine[p.id]) return mine[p.id];
  const cg = NMA.geoOf(cust.plz, cust.city); if (!cg) return null;
  let R = +cust.radius || 50; if (R > 150) R = 80;
  const own = String(cust.city || "").toLowerCase();
  const near = NMA.TOWNS.map(t => ({ ort: t.ort, km: NMA.km(cg, t.g) })).filter(t => t.ort.toLowerCase() !== own).sort((a, b) => a.km - b.km);
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
NMA.me = () => { const u = NMA.user(); return { nick: u.nick, plz: u.plz, radius: u.radius, city: u.city }; };

/* Kundenseiten: Wohnort und Entfernung jedes Profils für DIESEN Kunden anzeigen (nur im Speicher, nie zurückschreiben) */
{
  const pg = (document.body && document.body.dataset.page) || "";
  if (!/^team/.test(pg) && NMA.wohnortModus() === "kontakt") {
    const me = NMA.me();
    NMA.profiles.forEach(p => { const k = NMA.kontaktOrt(p, me); if (k) { p.homeCity = p.city; p.city = k.ort; p.km = k.km; } });
  }
}

/* Nachrichten aus dem Massenversand an den angemeldeten Demo-Kunden in den Chat übernehmen */
NMA.markRead = pid => { const m = NMA.store.get("custMsgs", []); let ch = false; m.forEach(x => { if (x.pid === pid && !x.read) { x.read = true; ch = true; } }); if (ch) NMA.store.set("custMsgs", m); };
{
  const nick = NMA.user().nick, msgs = NMA.store.get("custMsgs", []).filter(m => m.to === nick && NMA.profiles.some(p => p.id === m.pid));
  msgs.sort((a, b) => a.t - b.t).forEach(m => {
    const c = NMA.chats[m.pid] || (NMA.chats[m.pid] = []);
    const d = new Date(m.t), day = d.toDateString() === new Date().toDateString() ? "Heute" : d.toLocaleDateString("de-DE");
    if (!c.some(x => x.d === day)) c.push({ d: day });
    c.push({ t: "them", x: m.text, h: d.toTimeString().slice(0, 5) });
    if (!m.read) NMA.unread[m.pid] = (NMA.unread[m.pid] || 0) + 1;
  });
}
