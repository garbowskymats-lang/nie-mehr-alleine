/* =====================================================================
   🏭 PROFIL-FABRIK – Team-Portal, nur Chef (fabrik.js)
   Ablauf:
   1) „Ich brauche 100 neue Profile“ → Anzahl und Mischung einstellen → Erstellen.
      Jede Person bekommt eine feste Nummer (z. B. 0042) und einen festen Ordnernamen
      (z. B. Frauen/Abenteuer/Frau_57_0042). Nickname, Vorname, Beruf, Größe, Familienstand,
      Interessen, Profiltext, Aussehen und die Szenen für 1–8 Bilder werden zufällig, aber
      passend zu Geschlecht, Alter und Kategorie zusammengestellt.
   2) Prompts herunterladen → in ChatGPT einfügen (10 Personen pro Nachricht).
   3) Bilder einlesen: den Ordner „Profilbilder“ auswählen. Das System erkennt jedes Bild an
      Ordnername + Dateiname (Frau_57_0042/03_freigabe.jpg) und hängt es an die richtige Person.
      Falsches Alter/Geschlecht im Ordnernamen → Bild wird abgelehnt und gemeldet.
   4) Freischalten: vollständige Profile gehen live (gleichmäßig auf Mitarbeiter verteilt
      oder an einen bestimmten). Bild 01 = Profilbild, „_freigabe“-Bilder nur nach Fotofreigabe.
   VOLLAUTOMATIK (SERVER): Ist NMA.fabrikConfig.url gesetzt, schickt „🤖 Bilder automatisch
   erzeugen“ die Prompts an den Server; der ruft eine Bild-KI auf (Beispiel: server/profil-fabrik-beispiel.js)
   und liefert die Bilder zurück – dann entfällt Schritt 2 und 3.
   Demo: Speicher im Browser, Bilder stark verkleinert (Browser-Speicher ist klein).
   ===================================================================== */
NMA.fabrikConfig = NMA.fabrikConfig || { url: "" };   /* z. B. "https://api.tippelclub.de/fabrik" */

(() => {
  const T = window.TEAM; if (!T) return;
  const S = NMA.store, esc = NMA.esc, $ = id => document.getElementById(id);
  const sec = $("fabrik"); if (!sec) return;

  /* ---------- Zufall ---------- */
  const rnd = n => Math.floor(Math.random() * n);
  const pick = a => a[rnd(a.length)];
  const pickW = obj => { const e = Object.entries(obj).filter(([, w]) => w > 0), sum = e.reduce((s, [, w]) => s + w, 0); let r = Math.random() * sum; for (const [k, w] of e) { if ((r -= w) <= 0) return k; } return e.length ? e[e.length - 1][0] : null; };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pad = n => String(n).padStart(4, "0");

  /* ---------- Bausteine ---------- */
  const NAMES = {
    w: { alt: "Ursula Renate Monika Karin Helga Brigitte Gisela Ingrid Christa Elke Marianne Hannelore Erika Waltraud Rosemarie Gerda Heidi Bärbel Edith Inge",
         mitte: "Sabine Petra Andrea Gabriele Birgit Susanne Martina Claudia Angelika Cornelia Heike Silke Ute Doris Kerstin Anke Manuela Regina Iris Beate",
         jung: "Nicole Stefanie Sandra Katja Tanja Anja Melanie Daniela Simone Bianca Kathrin Nadine Jana Silvia Yvonne Diana Alexandra Ramona Sonja Miriam" },
    m: { alt: "Klaus Peter Wolfgang Jürgen Dieter Manfred Horst Günter Gerhard Werner Helmut Hans Rolf Heinz Bernd Uwe Norbert Siegfried Lothar Erwin",
         mitte: "Thomas Michael Andreas Frank Ralf Jörg Rainer Detlef Holger Stefan Matthias Carsten Olaf Martin Achim Volker Harald Reinhard Wilfried Axel",
         jung: "Markus Christian Oliver Sven Dirk Torsten Marco Sascha Jens Alexander Daniel Tobias Mario René Kai Björn Patrick Ingo Heiko Jan" }
  };
  const ageGrp = a => a >= 65 ? "alt" : a >= 55 ? "mitte" : "jung";
  const HAIR = {
    w: { jung: ["schulterlange brünette Haare", "lange dunkelblonde Haare", "kurze dunkle Haare mit frechem Schnitt", "lange dunkle Locken", "rotbraun gefärbter Bob", "blonde Haare zum Pferdeschwanz", "kinnlange kastanienbraune Haare"],
         mitte: ["schulterlange blonde Haare mit grauen Strähnen", "kurze graue Haare, frech gestylt", "lange kupferrot gefärbte Haare", "platinblonder Bob", "dunkelbraune Haare, locker hochgesteckt", "lange grau-blonde Haare", "brünette Locken mit ersten grauen Strähnen"],
         alt: ["kurze silberweiße Haare", "halblange, wellige weiße Haare", "graue Haare im eleganten Dutt", "kurze graue Locken", "silbergrauer Bob", "blond-grau gefärbte, kinnlange Haare"] },
    m: { jung: ["kurze dunkle Haare, gepflegter Bart", "dunkelblondes Haar mit grauen Schläfen, Dreitagebart", "Glatze, dunkler Vollbart", "kurzes braunes Haar, glatt rasiert", "grau meliertes Haar, Kinnbart"],
         mitte: ["grau meliertes kurzes Haar, Dreitagebart", "Halbglatze, grauer Vollbart", "silbergraue kurze Haare, gepflegter grauer Bart", "nach hinten gekämmte graue Haare, glatt rasiert", "Glatze, kurz gestutzter grauer Bart"],
         alt: ["volles weißes Haar, weißer Schnurrbart", "schütteres graues Haar, glatt rasiert", "Glatze, kurz gestutzter weißer Bart", "weiße, zurückgekämmte Haare", "graues Haar mit Seitenscheitel, weißer Vollbart"] }
  };
  const FIGURE = { w: ["schlank", "sportlich", "kurvig", "etwas mollig", "zierlich", "weibliche Figur"], m: ["schlank", "sportlich", "kräftig", "mit kleinem Bauch", "groß und breitschultrig", "drahtig"] };
  const EXTRA = { w: ["Brille mit dünnem Rahmen", "große Ohrringe", "Sommersprossen", "viele Lachfalten", "grüne Augen", "blaue Augen", "dezenter roter Lippenstift", "Perlenohrringe", "kleines Tattoo am Handgelenk", "Lesebrille im Haar"],
                  m: ["Brille mit dunklem Rahmen", "blaue Augen", "viele Lachfalten", "sonnengebräunt", "Tattoo am Unterarm", "Siegelring", "Grübchen beim Lächeln", "buschige Augenbrauen"] };
  const JOBS = { w: ["Krankenschwester", "Bürokauffrau", "Lehrerin", "Friseurin", "Verkäuferin", "Arzthelferin", "Erzieherin", "Bankkauffrau", "Steuerfachangestellte", "Altenpflegerin", "Buchhändlerin", "Floristin", "Sekretärin", "Apothekerin", "Köchin", "Physiotherapeutin", "Selbstständig", "Industriekauffrau"],
                 m: ["Elektriker", "Tischler", "Ingenieur", "Kfz-Mechaniker", "Polizist", "Lehrer", "Busfahrer", "Kaufmann", "Landwirt", "Bauleiter", "Koch", "Malermeister", "Beamter", "Vertriebler", "Schlosser", "Selbstständig", "Architekt", "Lkw-Fahrer"] };
  const NICKW = ["Garten", "Wander", "Tanz", "Sonnen", "Rad", "Koch", "Strand", "Wein", "Bücher", "Herz", "Musik", "Reise", "Kaffee", "Hunde", "Katzen", "Lebens", "Abend", "Sommer", "Nordsee", "Alpen"];

  /* Szenen: w/m = Text, tag = passendes Interesse, k = Art (alltag | aus | flirt | frei) */
  const SC = [
    { k: "alltag", w: "Selfie morgens in der Küche mit einer Tasse Kaffee, gemütlicher Pullover", m: "Selfie morgens in der Küche mit einer Tasse Kaffee, Hemd mit offenem Kragen", tag: "Kaffee" },
    { k: "alltag", w: "Selfie im Garten zwischen Blumenbeeten, Strohhut, leichte Bluse", m: "Selfie im Garten bei einer Pause von der Gartenarbeit, kariertes Hemd", tag: "Garten" },
    { k: "alltag", w: "Selfie beim Herbstspaziergang im Wald, bunter Schal", m: "Selfie beim Herbstspaziergang im Wald, Wachsjacke", tag: "Spazierengehen" },
    { k: "alltag", w: "Selfie auf dem Nordseedeich, windzerzaust, Regenjacke", m: "Selfie auf dem Nordseedeich, windzerzaust, Regenjacke", tag: "Meer" },
    { k: "alltag", w: "Selfie beim Wandern in den Alpen, Funktionsjacke, Gipfel im Hintergrund", m: "Selfie beim Wandern in den Alpen, Funktionsjacke, Gipfel im Hintergrund", tag: "Wandern" },
    { k: "alltag", w: "Selfie bei einer Radtour-Pause am Feldweg, Helm in der Hand", m: "Selfie bei einer Radtour-Pause am Feldweg, Helm in der Hand", tag: "Radfahren" },
    { k: "alltag", w: "Selfie im geparkten Auto, angeschnallt, gute Laune", m: "Selfie im geparkten Auto nach der Arbeit, angeschnallt", tag: "" },
    { k: "alltag", w: "Selfie auf dem Sofa, ein Hund legt den Kopf auf ihr Knie", m: "Selfie auf dem Sofa, ein Hund legt den Kopf auf sein Knie", tag: "Hund" },
    { k: "alltag", w: "Selfie abends auf dem Sofa unter einer Wolldecke, eine Katze auf dem Schoß", m: "Selfie abends auf dem Sofa, eine Katze auf dem Schoß", tag: "Katzen" },
    { k: "alltag", w: "Selfie im Café mit Kuchen und Cappuccino", m: "Selfie im Café mit Kaffee und Zeitung", tag: "Kaffee" },
    { k: "alltag", w: "Von einer Freundin fotografiert beim Kochen in der Küche, lacht über die Schulter", m: "Von einem Freund fotografiert beim Kochen, Kochlöffel in der Hand", tag: "Kochen" },
    { k: "alltag", w: "Selfie im Garten am Grill, Sommerkleid", m: "Selfie am Grill im Garten, Grillzange in der Hand", tag: "Grillen" },
    { k: "alltag", w: "Selfie im Weinberg an der Mosel, Sommerhut", m: "Selfie im Weinberg an der Mosel, Sonnenbrille", tag: "Wein" },
    { k: "alltag", w: "Von einer Freundin fotografiert im Biergarten, lacht laut", m: "Von einem Kumpel fotografiert im Biergarten, lacht", tag: "Geselligkeit" },
    { k: "alltag", w: "Urlaubs-Selfie am Gardasee, Sommerkleid, Boote im Hintergrund", m: "Urlaubs-Selfie am Gardasee, Poloshirt, Boote im Hintergrund", tag: "Reisen" },
    { k: "alltag", w: "Urlaubs-Selfie am Hafen auf Mallorca, Sonnenbrille in der Hand", m: "Urlaubs-Selfie am Hafen auf Mallorca, Sonnenbrille", tag: "Reisen" },
    { k: "alltag", w: "Selfie auf dem Weihnachtsmarkt mit Glühwein, Mütze und Schal", m: "Selfie auf dem Weihnachtsmarkt mit Glühwein, Mütze und Schal", tag: "Gemütlichkeit" },
    { k: "alltag", w: "Selfie vor dem Bücherregal im Wohnzimmer, Strickjacke", m: "Selfie vor dem Bücherregal im Wohnzimmer, Pullunder", tag: "Lesen" },
    { k: "alltag", w: "Selfie am Seeufer bei Sonnenuntergang", m: "Von einem Bekannten fotografiert beim Angeln am See, Morgennebel", tag: { w: "Natur", m: "Angeln" } },
    { k: "alltag", w: "Selfie beim Töpfern, Ton an den Händen", m: "Selfie in der Garage vor einem Oldtimer mit offener Motorhaube", tag: { w: "Töpfern", m: "Oldtimer" } },
    { k: "alltag", w: "Selfie auf dem Wochenmarkt mit einem Korb voller Gemüse", m: "Selfie auf dem Wochenmarkt mit einer Tüte frischer Brötchen", tag: "Kochen" },
    { k: "alltag", w: "Selfie auf dem Balkon mit Geranien, Abendsonne", m: "Selfie auf dem Balkon mit einem Bier, Abendsonne", tag: "" },
    { k: "alltag", w: "Selfie auf dem Beifahrersitz eines Motorrads, Lederjacke, Helm in der Hand", m: "Selfie neben seinem Motorrad, Lederjacke", tag: "Motorrad" },
    { k: "aus", w: "Spiegel-Selfie im Flur, schickes Kleid, fertig zum Ausgehen", m: "Spiegel-Selfie im Flur, dunkles Sakko, fertig zum Ausgehen", tag: "Ausgehen" },
    { k: "aus", w: "Selfie im Restaurant bei Kerzenlicht, Glas Rotwein", m: "Selfie im Restaurant bei Kerzenlicht, Glas Rotwein", tag: "Essen gehen" },
    { k: "aus", w: "Selfie im Theaterfoyer, elegante Bluse", m: "Selfie im Theaterfoyer, Sakko", tag: "Theater" },
    { k: "aus", w: "Spiegel-Selfie vor dem Tanzabend, schwingendes Kleid", m: "Spiegel-Selfie vor dem Tanzabend, Hemd und Weste", tag: "Tanzen" },
    { k: "flirt", w: "Selfie abends auf der Terrasse mit Weißwein, schulterfreies Top", m: "Selfie abends auf der Terrasse mit Weißwein, Leinenhemd mit offenem Kragen", tag: "Wein" },
    { k: "flirt", w: "Spiegel-Selfie, enges schwarzes Kleid mit V-Ausschnitt", m: "Spiegel-Selfie, eng anliegendes schwarzes Hemd", tag: "Ausgehen" },
    { k: "flirt", w: "Selfie in einer Bar mit Cocktail, glitzerndes Top", m: "Selfie in einer Hotelbar, Glas Whisky, Hemd am Kragen offen", tag: "Ausgehen" },
    { k: "flirt", w: "Spiegel-Selfie in der Umkleide eines Fitnessstudios, Leggings und Sport-Top", m: "Spiegel-Selfie im Fitnessstudio, enges T-Shirt", tag: "Fitness" },
    { k: "flirt", w: "Selfie im Auto, Sonnenbrille im Haar, roter Lippenstift, zwinkert", m: "Selfie in einem geparkten Cabrio, Sonnenbrille, Lederjacke", tag: "" },
    { k: "flirt", w: "Spiegel-Selfie in der Umkleidekabine eines Modegeschäfts, enges rotes Kleid", m: "Selfie nach dem Tennis, weißes Polo", tag: { w: "Mode", m: "Tennis" } },
    { k: "frei", w: "Urlaubs-Selfie am Hotelpool, {bade}, nasse Haare", m: "Urlaubs-Selfie am Hotelpool ohne Hemd, braungebrannt", tag: "Reisen" },
    { k: "frei", w: "Selfie im Strandkorb an der Ostsee, schlichter Badeanzug, Sonnenhut", m: "Selfie am Strand ohne T-Shirt, dunkle Badeshorts", tag: "Meer" },
    { k: "frei", w: "Selfie im Wellnesshotel, weißer Bademantel, Haare hochgesteckt", m: "Selfie im Wellnesshotel, weißer Bademantel", tag: "Wellness" },
    { k: "frei", w: "Selfie abends auf dem Sofa, Satin-Oberteil mit schmalen Trägern, Rotwein, Kerzenlicht", m: "Selfie abends auf dem Sofa, Hemd weit aufgeknöpft, Rotwein, Kerzenlicht", tag: "Wein" },
    { k: "frei", w: "Spiegel-Selfie, schwarzes Cocktailkleid mit Spitzenärmeln", m: "Spiegel-Selfie im weißen Unterhemd, kräftige Arme", tag: "" }
  ];
  const HOBBY = { Garten: "arbeite gern im Garten", Spazierengehen: "gehe gern lange spazieren", Wandern: "wandere gern in den Bergen", Kochen: "koche für mein Leben gern", Reisen: "entdecke gern neue Orte",
    Hund: "bin viel mit meinem Hund unterwegs", Katzen: "kuschle abends mit meiner Katze", Lesen: "verschwinde gern in einem guten Buch", Tanzen: "tanze leidenschaftlich gern", Radfahren: "fahre gern Rad",
    Meer: "liebe das Meer", Wein: "genieße ein gutes Glas Wein", Kaffee: "liebe ausgiebige Kaffeerunden", Motorrad: "fahre gern Motorrad", Angeln: "sitze gern am See und angle", Grillen: "grille gern mit Freunden",
    Theater: "gehe gern ins Theater", Fitness: "halte mich im Fitnessstudio fit", Tennis: "spiele Tennis", Oldtimer: "schraube an meinem Oldtimer", Töpfern: "töpfere", Natur: "genieße Sonnenuntergänge am See",
    Geselligkeit: "sitze gern im Biergarten", "Essen gehen": "gehe gern schön essen", Ausgehen: "gehe gern aus", Gemütlichkeit: "mag gemütliche Abende", Mode: "liebe schöne Kleider", Wellness: "gönne mir gern einen Wellnesstag" };
  const EXTRA_TAGS = ["Musik", "Kino", "Kochen", "Reisen", "Natur", "Lesen", "Garten", "Tanzen", "Wandern", "Fotografie", "Schlager", "Karten spielen", "Handarbeit", "Fußball", "Kreuzworträtsel"];
  const OPEN = {
    Beziehung: { Verwitwet: ["Seit ich allein bin, merke ich erst, wie schön es ist, den Tag mit jemandem zu teilen.", "Nach vielen schönen Jahren bin ich jetzt allein und bereit für ein neues Kapitel."],
                 Geschieden: ["Ich habe meine Vergangenheit hinter mir gelassen und freue mich auf das, was kommt.", "Nach meiner Scheidung habe ich wieder zu mir gefunden – jetzt fehlt nur noch das Herz an meiner Seite."],
                 Single: ["Ich bin schon eine Weile Single und habe das Warten satt.", "Lange habe ich mich auf Arbeit und Freunde konzentriert – jetzt bin ich dran."],
                 "Getrennt lebend": ["Ich lebe getrennt und schaue nach vorn.", "Ein neuer Abschnitt hat begonnen, und ich bin neugierig, wer ihn mit mir teilt."] },
    Abenteuer: { w: ["Ich bin eine Frau, die genau weiß, was ihr gefällt.", "Das Leben ist zu kurz für Langeweile – das habe ich spät, aber gründlich gelernt.", "Im Alltag bin ich die Vernünftige, aber abends darf es gern prickeln."],
                 m: ["Ich bin ein Genießer und stehe mit beiden Beinen im Leben.", "Ich mag Frauen, die wissen, was sie wollen.", "Für Langeweile bin ich nicht zu haben."] }
  };
  const CLOSE = {
    Beziehung: { w: ["Ich suche einen ehrlichen Mann, mit dem ich lachen und auch mal schweigen kann.", "Wenn du humorvoll bist und das Herz am rechten Fleck hast, schreib mir.", "Ich wünsche mir einen Partner für schöne Ausflüge und gemütliche Abende zu zweit."],
                 m: ["Ich suche eine liebevolle Frau, die gern lacht und Lust auf Gemeinsamkeit hat.", "Wenn du ehrlich bist und Zweisamkeit genauso schätzt wie ich, melde dich.", "Ich wünsche mir eine Partnerin für Ausflüge, Gespräche und gemütliche Abende."] },
    Abenteuer: { w: ["Ich suche keinen Mann fürs Leben, sondern jemanden für aufregende Gespräche und ein bisschen Kribbeln.", "Wenn du Charme hast und ein Kompliment machen kannst, schreib mir – der Rest ergibt sich.", "Diskretion ist mir wichtig. Ein bisschen Flirten, ein bisschen Fantasie – mal sehen, wohin es führt."],
                 m: ["Ich suche eine Frau für prickelnde Gespräche und ein bisschen Abenteuer im Kopf.", "Diskret, ehrlich und mit Humor – wenn dir das gefällt, schreib mir.", "Lust auf einen Flirt ohne Verpflichtungen? Dann trau dich."] }
  };
  const RULES = "Fotorealistisch, wie mit einem normalen Smartphone aufgenommen – keine Profi-Fotografie, kein Studio, kein Model-Look. Meist Selfies (Arm ausgestreckt, leicht schräger Winkel), manchmal Spiegel-Selfie, ab und zu von einem Bekannten fotografiert. Echtes Alltagsleben in Deutschland. Natürliche Haut mit Falten und Poren, kein Beauty-Filter. Normales Licht, darf etwas unscharf sein. Keine anderen Personen, keine Kinder, keine Schrift, keine Logos. Immer bekleidet, nichts Anstößiges. Hochformat 3:4.";

  /* ---------- Daten ---------- */
  let F = S.get("fabrik", null) || { next: 1, items: [] };
  const saveF = () => { try { S.set("fabrik", F); } catch (e) { NMA.toast("Speicher voll – bitte erst Profile freischalten oder löschen (Demo-Grenze)."); } };
  const IMG = () => S.get("fabrikImg", {});
  const cfg = Object.assign({ n: 20, frauen: 60, abenteuer: 50, b40: 20, b50: 30, b60: 30, b70: 20, maxB: 8, owner: "_gleich" }, S.get("fabrikCfg", {}));

  const usedNicks = () => new Set([].concat(T.profiles.map(p => p.name), F.items.map(i => i.nick), Object.keys(T.customers), NMA.takenNicks()).map(n => String(n).toLowerCase()));
  const makeNick = (vor, age, tags, used) => {
    const yy = String(2026 - age).slice(2), t0 = (tags[0] || "").replace(/[^\p{L}]/gu, "");
    const ideas = shuffle([`${pick(NICKW)}${vor}`, `${vor}${yy}`, `${vor}_${pick(NICKW).toLowerCase()}`, t0 ? `${t0}${vor}` : "", `${vor}.${yy}`, `${pick(NICKW)}${vor}${rnd(9) + 1}`]).filter(Boolean);
    for (const n of ideas) if (NMA.nickOk(n) && !used.has(n.toLowerCase())) return n;
    let i = 2; while (used.has((vor + yy + "_" + i).toLowerCase())) i++; return vor + yy + "_" + i;
  };
  const sceneText = (s, sx, age) => s[sx].replace("{bade}", age >= 58 ? "eleganter Badeanzug" : "Bikini");
  const sceneTag = (s, sx) => typeof s.tag === "object" ? s.tag[sx] : s.tag;

  /* Eine Person zusammenstellen */
  const makeOne = (o, used) => {
    const num = F.next++, sx = Math.random() * 100 < o.frauen ? "w" : "m", looking = Math.random() * 100 < o.abenteuer ? "Abenteuer" : "Beziehung";
    const band = +pickW({ 40: o.b40, 50: o.b50, 60: o.b60, 70: o.b70 }) || 50, age = band + rnd(band === 70 ? 9 : 10), g = ageGrp(age);
    const vor = pick(NAMES[sx][g].split(" "));
    const look = { hair: pick(HAIR[sx][g]), fig: pick(FIGURE[sx]), extra: shuffle(EXTRA[sx]).slice(0, 1 + rnd(2)).join(", ") };
    /* Anzahl Bilder: viele mit 1–3, einige mit mehr */
    const nB = Math.min(o.maxB, +pickW({ 1: 20, 2: 20, 3: 20, 4: 13, 5: 10, 6: 7, 7: 5, 8: 5 }));
    const pool = k => shuffle(SC.filter(s => k.includes(s.k)));
    const shots = [], taken = new Set();
    const add = (s, free) => { taken.add(s); shots.push({ file: String(shots.length + 1).padStart(2, "0") + (free ? "_freigabe" : "") + ".jpg", scene: sceneText(s, sx, age), tag: sceneTag(s, sx), free: !!free }); };
    add(pool(looking === "Abenteuer" ? ["flirt", "aus"] : ["alltag"])[0]);
    const nFree = looking === "Abenteuer" && nB > 1 ? Math.min(nB - 1, nB >= 6 ? 2 + rnd(2) : rnd(2) + (nB >= 3 ? 1 : 0)) : 0;
    const normal = pool(looking === "Abenteuer" ? ["alltag", "aus", "flirt"] : ["alltag", "aus"]).filter(s => !taken.has(s));
    while (shots.length < nB - nFree && normal.length) add(normal.shift());
    const fr = pool(["frei"]); while (shots.length < nB && fr.length) add(fr.shift(), true);
    const tags = [...new Set(shots.map(s => s.tag).filter(Boolean))].slice(0, 5); shuffle(EXTRA_TAGS).forEach(t => { if (tags.length < 3 + rnd(2) && !tags.includes(t)) tags.push(t); });
    const status = looking === "Abenteuer" ? pick(["Single", "Geschieden", "Getrennt lebend", "Single", "Verwitwet"]) : (age >= 65 ? pick(["Verwitwet", "Verwitwet", "Geschieden", "Single"]) : pick(["Geschieden", "Single", "Getrennt lebend", "Verwitwet"]));
    const job0 = pick(JOBS[sx]), job = age >= 66 ? `${sx === "w" ? "Rentnerin" : "Rentner"} (früher ${job0})` : job0;
    const height = (sx === "w" ? 155 + rnd(22) : 168 + rnd(24)) + " cm";
    const nick = makeNick(vor, age, tags, used); used.add(nick.toLowerCase());
    const it = { num, sx, looking, age, vor, nick, job, height, status, tags, look, shots, st: "wartet", t: Date.now() };
    it.folder = folderOf(it); it.about = aboutOf(it); return it;
  };
  const folderOf = it => `${it.sx === "w" ? "Frauen" : "Maenner"}/${it.looking}/${it.sx === "w" ? "Frau" : "Mann"}_${it.age}_${pad(it.num)}`;
  const aboutOf = it => {
    const op = it.looking === "Abenteuer" ? pick(OPEN.Abenteuer[it.sx]) : pick(OPEN.Beziehung[it.status] || OPEN.Beziehung.Single);
    const hs = it.tags.map(t => HOBBY[t]).filter(Boolean);
    const mid = hs.length >= 2 ? `Ich ${hs[0]} und ${hs[1]}.` : hs.length ? `Ich ${hs[0]}.` : "Ich bin offen, neugierig und lache gern.";
    return [op, mid, pick(CLOSE[it.looking][it.sx])].join(" ");
  };
  const personLine = it => `PERSON ${pad(it.num)} – Ordner ${it.folder} – ${it.sx === "w" ? "Frau" : "Mann"}, ${it.age}, ${it.look.hair}, ${it.look.fig}, ${it.look.extra}.\n` + it.shots.map(s => `${s.file}: ${s.scene}.`).join("\n");
  const promptOf = list => `Ich brauche für eine Website realistische Alltagsfotos von ${list.length === 1 ? "einer erwachsenen Person" : list.length + " verschiedenen erwachsenen Personen"}. Arbeite die Liste der Reihe nach ab, ohne Zwischenfragen.\n\nREGELN FÜR ALLE BILDER: ${RULES}\nAlle Bilder mit derselben Personennummer zeigen GENAU dieselbe Person (gleiches Gesicht, gleiche Haare, gleiche Figur). Verschiedene Nummern sind verschiedene Menschen.\nErstelle immer ein Bild, schreibe darunter nur den Dateinamen mit Ordner (z. B. „${list[0].folder}/01.jpg“) und mach sofort mit dem nächsten weiter. Wenn du aufhören musst, schreib, bei welchem Bild du stehst.\n\n` + list.map(personLine).join("\n\n") + `\n\nFang jetzt mit Person ${pad(list[0].num)}, Bild 01.jpg an.`;
  const imgCount = it => { const im = IMG(); return it.shots.filter(s => im[pad(it.num) + "/" + s.file]).length; };
  const stateOf = it => it.st === "live" ? "live" : imgCount(it) >= it.shots.length ? "fertig" : imgCount(it) ? "teil" : "wartet";
  const ST = { wartet: ["Wartet auf Bilder", "#c79a54"], teil: ["Bilder unvollständig", "#c79a54"], fertig: ["Vollständig – bereit", "var(--accent)"], live: ["Live", "#7bc47f"] };

  /* ---------- Oberfläche ---------- */
  let filt = "", shown = 50;
  const css = document.createElement("style");
  css.textContent = `.fb-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:18px;margin-bottom:18px}@media(max-width:900px){.fb-grid{grid-template-columns:1fr}}
  .fb-row{display:flex;gap:10px;flex-wrap:wrap;align-items:end}.fb-row .field{margin:0;min-width:110px;flex:1}.fb-steps{margin:0;padding-left:20px;color:#cfe3e1;line-height:1.55}.fb-steps li{margin-bottom:6px}
  .fb-thumbs{display:flex;gap:8px;flex-wrap:wrap}.fb-thumbs figure{margin:0;width:92px}.fb-thumbs img,.fb-thumbs .ph{width:92px;height:122px;object-fit:cover;border-radius:10px;display:block;background:#0f2224;border:1px dashed var(--line)}
  .fb-thumbs figcaption{font-size:11px;color:var(--muted);margin-top:3px;word-break:break-all}.fb-pre{white-space:pre-wrap;background:#081416;border:1px solid var(--line);border-radius:10px;padding:12px;font-size:13px;max-height:240px;overflow:auto}
  .fb-st{font-size:12px;font-weight:700}.fb-list td{vertical-align:middle}.fb-list .acts{display:flex;gap:6px;flex-wrap:wrap}`;
  document.head.appendChild(css);

  const owners = () => T.owners();
  const render = () => {
    const items = F.items.filter(i => !filt || stateOf(i) === filt), cnt = k => F.items.filter(i => stateOf(i) === k).length;
    sec.innerHTML = `<div class="fb-grid">
      <form class="card pad" id="fbForm"><h2 style="font-size:22px;margin-bottom:6px">🏭 Neue Profile erstellen</h2>
        <p class="hint" style="margin:0 0 12px">Sag einfach, wie viele du brauchst. Name, Alter, Beruf, Profiltext, Aussehen und die Bild-Szenen werden passend zusammengestellt – jede Person bekommt eine feste Nummer und einen festen Ordner.</p>
        <div class="fb-row"><div class="field"><label for="fbN">Anzahl</label><input class="input" id="fbN" type="number" min="1" max="500" value="${cfg.n}"></div>
          <div class="field"><label for="fbW">Frauen in %</label><input class="input" id="fbW" type="number" min="0" max="100" value="${cfg.frauen}"></div>
          <div class="field"><label for="fbA">Abenteuer in %</label><input class="input" id="fbA" type="number" min="0" max="100" value="${cfg.abenteuer}"></div>
          <div class="field"><label for="fbM">Max. Bilder</label><input class="input" id="fbM" type="number" min="1" max="8" value="${cfg.maxB}"></div></div>
        <p class="small muted" style="margin:14px 0 6px">Altersgruppen (Anteil in %)</p>
        <div class="fb-row"><div class="field"><label for="fb40">40–49</label><input class="input" id="fb40" type="number" min="0" max="100" value="${cfg.b40}"></div>
          <div class="field"><label for="fb50">50–59</label><input class="input" id="fb50" type="number" min="0" max="100" value="${cfg.b50}"></div>
          <div class="field"><label for="fb60">60–69</label><input class="input" id="fb60" type="number" min="0" max="100" value="${cfg.b60}"></div>
          <div class="field"><label for="fb70">70–78</label><input class="input" id="fb70" type="number" min="0" max="100" value="${cfg.b70}"></div></div>
        <button class="btn primary" style="margin-top:16px">Profile erstellen</button></form>
      <div class="card pad"><h2 style="font-size:22px;margin-bottom:8px">So geht's</h2><ol class="fb-steps">
        <li><b>Erstellen</b> – z. B. 100 Profile. Sie sind noch nicht sichtbar.</li>
        <li><b>⬇ Prompts herunterladen</b> – die Textdatei enthält je 10 Personen pro Block. Einen Block nach dem anderen in ChatGPT einfügen.</li>
        <li><b>Bilder speichern</b> – genau unter dem Ordner und Dateinamen, den ChatGPT unter jedes Bild schreibt.</li>
        <li><b>📂 Bilder einlesen</b> – den Ordner „Profilbilder“ auswählen. Jedes Bild landet automatisch bei der richtigen Person.</li>
        <li><b>✅ Freischalten</b> – fertige Profile gehen live und werden auf die Mitarbeiter verteilt.</li></ol>
        <p class="hint" style="margin:10px 0 0">🤖 <b>Vollautomatisch:</b> Sobald der Server angebunden ist, erzeugt die Bild-KI die Bilder selbst – Schritt 2 bis 4 entfallen.</p></div></div>
      <div class="toolbar" style="flex-wrap:wrap;gap:8px">
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><select class="input" id="fbF" style="width:auto" aria-label="Filter"><option value="">Alle (${F.items.length})</option>${Object.entries(ST).map(([k, [l]]) => `<option value="${k}" ${filt === k ? "selected" : ""}>${l} (${cnt(k)})</option>`).join("")}</select></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <button class="btn sm" id="fbDl" type="button">⬇ Prompts herunterladen</button>
          <label class="btn sm" for="fbIn" style="cursor:pointer">📂 Bilder einlesen</label><input type="file" id="fbIn" accept="image/*" multiple webkitdirectory hidden>
          <label class="btn sm ghost" for="fbIn2" style="cursor:pointer">Einzelne Bilder</label><input type="file" id="fbIn2" accept="image/*" multiple hidden>
          <button class="btn sm" id="fbAuto" type="button">🤖 Bilder automatisch erzeugen</button>
          <select class="input" id="fbOwn" style="width:auto" aria-label="Verteilen an"><option value="_gleich">Gleichmäßig verteilen</option>${owners().map(o => `<option value="${o.user}" ${cfg.owner === o.user ? "selected" : ""}>an ${esc(o.name)}</option>`).join("")}</select>
          <button class="btn sm primary" id="fbPubAll" type="button">✅ Alle fertigen freischalten (${cnt("fertig")})</button></div></div>
      <div class="card pad" style="padding-top:8px">${items.length ? `<table class="staff fb-list"><thead><tr><th>Nr.</th><th>Person</th><th>Nickname</th><th>Ordner</th><th class="num">Bilder</th><th>Status</th><th></th></tr></thead><tbody>
        ${items.slice().reverse().slice(0, shown).map(it => { const s = stateOf(it); return `<tr><td>${pad(it.num)}</td><td>${it.sx === "w" ? "Frau" : "Mann"}, ${it.age} · ${it.looking}</td><td><b>${esc(it.nick)}</b><br><span class="small muted">${esc(it.vor)}</span></td>
          <td class="small muted">${esc(it.folder)}</td><td class="num">${s === "live" ? it.shots.length : imgCount(it)}/${it.shots.length}</td><td><span class="fb-st" style="color:${ST[s][1]}">${ST[s][0]}</span></td>
          <td><div class="acts"><button class="btn sm" data-fbv="${it.num}" type="button">Ansehen</button>${s === "fertig" ? `<button class="btn sm primary" data-fbp="${it.num}" type="button">Freischalten</button>` : ""}</div></td></tr>`; }).join("")}
        </tbody></table>${items.length > shown ? `<p style="text-align:center"><button class="btn sm ghost" id="fbMore" type="button">Weitere ${Math.min(50, items.length - shown)} anzeigen</button></p>` : ""}`
        : `<p class="muted" style="margin:16px 0">Noch keine Profile in der Fabrik. Oben Anzahl eingeben und „Profile erstellen“ klicken.</p>`}</div>`;
  };

  const readCfg = () => { ["n:fbN", "frauen:fbW", "abenteuer:fbA", "maxB:fbM", "b40:fb40", "b50:fb50", "b60:fb60", "b70:fb70"].forEach(x => { const [k, id] = x.split(":"); cfg[k] = Math.max(0, +$(id).value || 0); }); cfg.n = Math.min(500, Math.max(1, cfg.n)); cfg.maxB = Math.min(8, Math.max(1, cfg.maxB)); S.set("fabrikCfg", cfg); };
  const create = () => {
    readCfg(); if (!(cfg.b40 + cfg.b50 + cfg.b60 + cfg.b70)) { NMA.toast("Bitte mindestens eine Altersgruppe über 0 %."); return; }
    const used = usedNicks(), neu = []; for (let i = 0; i < cfg.n; i++) neu.push(makeOne(cfg, used));
    F.items.push(...neu); saveF(); filt = ""; render();
    const b = neu.reduce((s, i) => s + i.shots.length, 0);
    NMA.modal({ title: `${neu.length} Profile erstellt`, text: `Nummer ${pad(neu[0].num)} bis ${pad(neu[neu.length - 1].num)} · zusammen <b>${b} Bilder</b>.<br><br>Als Nächstes: <b>⬇ Prompts herunterladen</b> und in ChatGPT einfügen.`, ok: "Prompts jetzt herunterladen", cancel: "Später", onOk: () => download(neu) });
  };
  const download = list => {
    list = list || F.items.filter(i => stateOf(i) === "wartet" || stateOf(i) === "teil");
    if (!list.length) { NMA.toast("Keine Profile ohne Bilder."); return; }
    const blocks = []; for (let i = 0; i < list.length; i += 10) blocks.push(list.slice(i, i + 10));
    const txt = `PROMPTS FÜR CHATGPT – ${list.length} Profile in ${blocks.length} ${blocks.length > 1 ? "Blöcken" : "Block"}\nSo geht's: Für jeden Block einen NEUEN ChatGPT-Chat öffnen, den Block komplett einfügen. Hält ChatGPT an, „weiter“ schreiben.\nJedes Bild unter dem angegebenen Ordner und Dateinamen speichern (Hauptordner: Profilbilder).\n\n` +
      blocks.map((b, i) => `==================== BLOCK ${i + 1} von ${blocks.length} (Person ${pad(b[0].num)}–${pad(b[b.length - 1].num)}) ====================\n\n${promptOf(b)}`).join("\n\n\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + txt], { type: "text/plain;charset=utf-8" }));
    a.download = `Prompts Profile ${pad(list[0].num)}-${pad(list[list.length - 1].num)}.txt`; document.body.appendChild(a); a.click(); a.remove();
  };

  /* Bilder verkleinern (Demo-Speicher) */
  const shrink = file => new Promise(res => { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 560 / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL("image/jpeg", .74)); }; im.onerror = () => res(null); im.src = r.result; }; r.onerror = () => res(null); r.readAsDataURL(file); });
  /* Ordner + Dateiname erkennen: …/Frau_57_0042/03_freigabe.jpg  oder flach: Frau_57_0042_03_freigabe.jpg */
  const parse = f => {
    const p = (f.webkitRelativePath || f.name).replace(/\\/g, "/");
    let m = p.match(/(Frau|Mann)_(\d{2})_(\d{3,5})\/(\d{2})(_freigabe)?\.(jpe?g|png|webp)$/i) || p.match(/(Frau|Mann)_(\d{2})_(\d{3,5})[_-](\d{2})(_freigabe)?\.(jpe?g|png|webp)$/i);
    return m ? { sx: m[1].toLowerCase() === "frau" ? "w" : "m", age: +m[2], num: +m[3], file: m[4] + (m[5] ? "_freigabe" : "") + ".jpg", name: p } : null;
  };
  const importFiles = async files => {
    files = [...files].filter(f => /^image\//.test(f.type) || /\.(jpe?g|png|webp)$/i.test(f.name)); if (!files.length) return;
    const ok = [], bad = [], im = IMG();
    NMA.toast(`${files.length} Bilder werden eingelesen …`);
    for (const f of files) {
      const r = parse(f); if (!r) { bad.push(`${f.name}: Name nicht erkannt`); continue; }
      const it = F.items.find(i => i.num === r.num); if (!it) { bad.push(`${r.name}: keine Person ${pad(r.num)}`); continue; }
      if (it.st === "live") { bad.push(`${r.name}: Profil ist schon live`); continue; }
      if (it.sx !== r.sx || it.age !== r.age) { bad.push(`${r.name}: Person ${pad(r.num)} ist ${it.sx === "w" ? "Frau" : "Mann"}, ${it.age} – Ordnername passt nicht`); continue; }
      const sh = it.shots.find(s => s.file === r.file) || it.shots.find(s => s.file.slice(0, 2) === r.file.slice(0, 2));
      if (!sh) { bad.push(`${r.name}: Person ${pad(r.num)} hat nur ${it.shots.length} Bilder`); continue; }
      const src = await shrink(f); if (!src) { bad.push(`${r.name}: Bild beschädigt`); continue; }
      im[pad(it.num) + "/" + sh.file] = src; ok.push(r.name);
    }
    try { S.set("fabrikImg", im); } catch (e) { NMA.toast("Browser-Speicher voll – bitte erst fertige Profile freischalten, dann den Rest einlesen."); return; }
    render();
    NMA.modal({ title: `${ok.length} Bilder zugeordnet`, text: (bad.length ? `<b>${bad.length} nicht zugeordnet:</b><div class="fb-pre" style="margin-top:8px">${bad.map(esc).join("\n")}</div>` : "Alle Bilder wurden der richtigen Person zugeordnet.") + `<br>Vollständig und bereit: <b>${F.items.filter(i => stateOf(i) === "fertig").length}</b> Profile.`, ok: "OK" });
  };

  /* Freischalten → echtes Profil + Fotos */
  let rr = 0;
  const publish = (it, ownerSel) => {
    const im = IMG(), k = pad(it.num), id = "fab" + k;
    const mods = owners().filter(o => o.user !== "chef"), owner = ownerSel === "_gleich" ? (mods.length ? mods[rr++ % mods.length].user : "chef") : ownerSel;
    const town = pick(NMA.TOWNS.filter(t => t.land === "DE"));
    const p = { id, name: it.nick, vorname: it.vor, age: it.age, sex: it.sx, looking: it.looking, job: it.job, height: it.height, status: it.status, about: it.about, tags: it.tags.slice(0, 4),
      city: town ? town.ort : "", land: "DE", km: 5 + rnd(40), online: Math.random() < .4, last: pick(["vor 1 Std.", "vor 3 Std.", "gestern", "heute früh"]), owner,
      photo: im[k + "/" + it.shots[0].file], ppos: "50% 22%", psize: "cover", g: "linear-gradient(145deg,#4f8f87,#173a37)", fab: it.num };
    T.profiles.push(p); S.set("tProfiles", T.profiles);
    const fo = S.get("fotos", {}); fo["p:" + id] = it.shots.slice(1).map((s, i) => ({ id: "p:" + id + "-" + (i + 2), src: im[k + "/" + s.file], vis: s.free ? "frei" : "alle", fsk: false })); S.set("fotos", fo);
    it.shots.forEach(s => delete im[k + "/" + s.file]); S.set("fabrikImg", im);
    it.st = "live"; it.pid = id; it.owner = owner;
  };
  const publishMany = list => {
    const sel = $("fbOwn").value; cfg.owner = sel; S.set("fabrikCfg", cfg); let n = 0;
    try { list.forEach(it => { publish(it, sel); n++; }); } catch (e) { NMA.toast("Speicher voll – nicht alle konnten freigeschaltet werden (Demo-Grenze)."); }
    saveF(); render(); T.renderProfiles && T.renderProfiles(); NMA.toast(`${n} Profil${n === 1 ? "" : "e"} freigeschaltet – Kunden sehen sie jetzt.`);
  };

  /* Ansicht einer Person */
  const view = num => {
    const it = F.items.find(i => i.num === num); if (!it) return; const im = IMG(), s = stateOf(it), k = pad(it.num);
    const live = it.st === "live" ? (S.get("fotos", {})["p:" + it.pid] || []) : null, lp = live && T.profiles.find(p => p.id === it.pid);
    const src = (sh, i) => live ? (i === 0 ? lp && lp.photo : (live[i - 1] || {}).src) : im[k + "/" + sh.file];
    const m = document.createElement("div"); m.className = "modal form-modal";
    m.innerHTML = `<div class="card" style="max-width:760px;width:100%;max-height:92svh;overflow:auto"><h2>${esc(it.nick)} <span class="muted small">Nr. ${k}</span></h2>
      <p class="muted" style="margin:4px 0 12px">${esc(it.vor)} · ${it.sx === "w" ? "Frau" : "Mann"}, ${it.age} · ${it.looking} · ${esc(it.job)} · ${it.height} · ${it.status}<br>Ordner: <code>${esc(it.folder)}</code> · <span style="color:${ST[s][1]}">${ST[s][0]}</span></p>
      <div class="fb-thumbs">${it.shots.map((sh, i) => { const u = src(sh, i); return `<figure>${u ? `<img src="${u}" alt="">` : `<div class="ph"></div>`}<figcaption>${sh.file}${sh.free ? " 🔒" : ""}</figcaption></figure>`; }).join("")}</div>
      <h3 style="margin:16px 0 6px;font-size:17px">Profiltext</h3><textarea class="input" id="fbAb" maxlength="800" ${it.st === "live" ? "disabled" : ""}>${esc(it.about)}</textarea>
      <p class="small muted" style="margin:6px 0 0">Interessen: ${esc(it.tags.join(", "))}</p>
      <h3 style="margin:16px 0 6px;font-size:17px">Prompt für ChatGPT</h3><div class="fb-pre" id="fbPr">${esc(promptOf([it]))}</div>
      <div class="row" style="flex-wrap:wrap">${it.st !== "live" ? `<button type="button" class="btn danger" data-del style="margin-right:auto">Löschen</button><button type="button" class="btn ghost" data-re>🎲 Neu würfeln</button>` : ""}
        <button type="button" class="btn" data-cp>📋 Prompt kopieren</button>${it.st !== "live" ? `<button type="button" class="btn" data-sv>Text speichern</button>` : ""}${s === "fertig" ? `<button type="button" class="btn primary" data-pub>Freischalten</button>` : ""}<button type="button" class="btn ghost" data-x>Schließen</button></div></div>`;
    document.body.appendChild(m);
    m.addEventListener("click", async e => {
      const b = e.target;
      if (b === m || b.hasAttribute("data-x")) m.remove();
      if (b.hasAttribute("data-cp")) { try { await navigator.clipboard.writeText(promptOf([it])); NMA.toast("Prompt kopiert – in einem neuen ChatGPT-Chat einfügen."); } catch (er) { NMA.toast("Kopieren nicht möglich – Text markieren und kopieren."); } }
      if (b.hasAttribute("data-sv")) { it.about = m.querySelector("#fbAb").value.trim(); saveF(); NMA.toast("Profiltext gespeichert."); }
      if (b.hasAttribute("data-re")) { if (imgCount(it)) { NMA.toast("Hat schon Bilder – Neu würfeln würde nicht mehr passen. Erst löschen."); return; }
        const used = usedNicks(); used.delete(it.nick.toLowerCase()); const nx = F.next; F.next = it.num; const n = makeOne(cfg, used); F.next = nx; Object.assign(it, n); saveF(); m.remove(); render(); view(it.num); NMA.toast("Neu zusammengestellt."); }
      if (b.hasAttribute("data-del")) NMA.modal({ title: "Person löschen?", text: `Nr. ${k} (${esc(it.nick)}) und ihre eingelesenen Bilder werden gelöscht.`, cancel: "Abbrechen", ok: "Löschen",
        onOk: () => { const im2 = IMG(); it.shots.forEach(s2 => delete im2[k + "/" + s2.file]); S.set("fabrikImg", im2); F.items = F.items.filter(x => x !== it); saveF(); m.remove(); render(); } });
      if (b.hasAttribute("data-pub")) { m.remove(); publishMany([it]); }
    });
  };

  /* Vollautomatik über den Server */
  const auto = async () => {
    const list = F.items.filter(i => stateOf(i) === "wartet" || stateOf(i) === "teil");
    if (!NMA.fabrikConfig.url) { NMA.modal({ title: "🤖 Vollautomatik noch nicht angeschlossen", text: `Damit die Bilder ohne ChatGPT-Handarbeit entstehen, braucht der <b>Server</b> einen Zugang zu einer Bild-KI (z. B. OpenAI-Bild-API, kostet pro Bild ein paar Cent). Das richtet der Server-Kollege ein – ein fertiges Beispiel liegt in <code>server/profil-fabrik-beispiel.js</code>.<br><br>Danach erzeugt dieser Knopf die Bilder für alle ${list.length} wartenden Profile selbst, ordnet sie zu, und du musst nur noch freischalten.<br><br>Bis dahin: <b>⬇ Prompts herunterladen</b> → ChatGPT → <b>📂 Bilder einlesen</b>.`, ok: "Verstanden" }); return; }
    if (!list.length) { NMA.toast("Keine Profile ohne Bilder."); return; }
    NMA.toast(`Bilder für ${list.length} Profile werden angefordert …`); let done = 0, fail = 0; const im = IMG();
    for (const it of list) {
      try {
        const r = await fetch(NMA.fabrikConfig.url.replace(/\/$/, "") + "/bilder", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify({ num: it.num, folder: it.folder, rules: RULES, person: `${it.sx === "w" ? "Frau" : "Mann"}, ${it.age}, ${it.look.hair}, ${it.look.fig}, ${it.look.extra}`, shots: it.shots.map(s => ({ file: s.file, scene: s.scene })) }) });
        const j = await r.json(); (j.images || []).forEach(x => { if (x.file && x.url) im[pad(it.num) + "/" + x.file] = x.url; }); done++;
      } catch (e) { fail++; }
    }
    S.set("fabrikImg", im); render(); NMA.toast(`Fertig: ${done} Profile mit Bildern${fail ? `, ${fail} fehlgeschlagen` : ""}.`);
  };

  /* ---------- Ereignisse ---------- */
  sec.addEventListener("submit", e => { if (e.target.id === "fbForm") { e.preventDefault(); create(); } });
  sec.addEventListener("change", e => {
    if (e.target.id === "fbF") { filt = e.target.value; shown = 50; render(); }
    if (e.target.id === "fbIn" || e.target.id === "fbIn2") { importFiles(e.target.files); e.target.value = ""; }
    if (e.target.id === "fbOwn") { cfg.owner = e.target.value; S.set("fabrikCfg", cfg); }
  });
  sec.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.id === "fbDl") download();
    if (b.id === "fbAuto") auto();
    if (b.id === "fbMore") { shown += 50; render(); }
    if (b.id === "fbPubAll") { const l = F.items.filter(i => stateOf(i) === "fertig"); if (!l.length) { NMA.toast("Noch keine vollständigen Profile – erst Bilder einlesen."); return; }
      NMA.modal({ title: `${l.length} Profile freischalten?`, text: `Sie erscheinen sofort in der Suche und werden ${$("fbOwn").value === "_gleich" ? "gleichmäßig auf die Mitarbeiter verteilt" : "an " + esc(T.ownerName($("fbOwn").value)) + " vergeben"}.`, cancel: "Abbrechen", ok: "Freischalten", onOk: () => publishMany(l) }); }
    if (b.dataset.fbv) view(+b.dataset.fbv);
    if (b.dataset.fbp) publishMany([F.items.find(i => i.num === +b.dataset.fbp)]);
  });

  window.FAB = { render, make: n => { cfg.n = n; create(); }, items: () => F.items, parse };
  render();
})();
