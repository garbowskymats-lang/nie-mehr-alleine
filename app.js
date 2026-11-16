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
  {id:1, from:"karin",  subj:"Hallo aus Pinneberg", date:"Heute, 14:05", unread:true, text:"Hallo,\n\nich bin über dein Profil gestolpert und musste schmunzeln. Magst du auch Theater? Ich würde mich über eine Antwort freuen.\n\nLiebe Grüße\nKarin"},
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
NMA.user = () => store.get("user",{nick:"Michael Nordlicht",age:56,plz:"20095",city:"Hamburg",radius:"50",job:"Elektriker",about:"Ich freue mich auf nette Gespräche und vielleicht mehr.",looking:"Beziehung"});
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
