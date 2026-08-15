# Roadmap – vylepšení hratelnosti pro 4leté dítě na tabletu

## Kontext

Hra byla navržena pro 5leté dítě (viz `AGENTS.md`), ale reálný hráč je ~4letý, který
**neumí číst**, a hra ho přestala bavit. Tenhle dokument je analýza příčin + plán
vylepšení, seřazený podle toho, jak moc ovlivní zábavnost.

Cíl: **dítě rozumí, co má dělat, bez čtení a bez dospělého; ovládání zvládne motoricky;
a po každém úspěchu dostane výraznou odměnu.**

### Rozhodnutí, se kterými roadmapa počítá

| Téma | Rozhodnutí |
|---|---|
| Zvuk a hlas | Web Speech API, česky (`lang: 'cs-CZ'`), bez audio souborů |
| Náklad na vagónech | Jen na levelu 1–2; na nejvyšším levelu vagóny zůstanou prázdné |
| Cílové zařízení | Android tablet (Chrome) |

Odkazy na kód (`soubor:řádek`) platí ke commitu, ve kterém roadmapa vznikla — po
implementaci se budou posouvat.

---

## A. Blokátory zábavy — tady je 80 % problému

### A1. Hra je úplně němá 🔇 ← největší jednotlivá věc

`AGENTS.md` to přiznává v sekci „What Is NOT Built Yet". Čtyřletý nečtenář bere skoro
všechnu zpětnou vazbu ušima. Teď nemá **žádnou**.

Co přidat:

- **Zvukové efekty**: cvaknutí spřáhla při připojení vagónu, houkačka při odjezdu,
  šš-šš-šš rozjezd, jásot při správné odpovědi, měkké „ups" při chybě.
- **Český hlas zadání**: „Tři vagóny s uhlím!" — přehraje se automaticky na začátku kola
  a znovu po ťuknutí na zadání (`TaskHero`). Tím zadání *přečte hra za dítě* a celý
  problém „neumí číst" zmizí.
- **Počítání nahlas**: při přidání vagónu se ozve „jedna… dva… tři…". Zároveň učení
  počítání i okamžitá zpětná vazba, že se něco stalo.
- Tlačítko na ztlumení (ikona reproduktoru) pro rodiče.

Technicky: `speechSynthesis` s `lang: 'cs-CZ'` pro mluvené zadání a počítání,
`Web Audio API` pro pípnutí/houkačku generované kódem. Žádné audio soubory, žádné nové
závislosti. Na Androidu je český hlas obvykle k dispozici přes Google TTS a autoplay je
volnější než na iOS. Ošetřit je potřeba:

- hlasy se načítají asynchronně → počkat na `voiceschanged` a vybrat `cs-CZ` hlas
- fallback, když český hlas na zařízení chybí (nepřehrávat mluvu, jen efekty)
- první promluvu navázat na uživatelské gesto, ne na `useEffect` při načtení
- nový hook `src/hooks/useSpeech.ts` + `src/data/phrases.ts` s frázemi (obsah patří do
  `/src/data/`, jak žádá `AGENTS.md`)

### A2. Drag & drop je pro čtyřleté ruce moc těžké

`App.tsx:59-79` + `DragPalette.tsx:27` — `onPointerDown` **okamžitě** spustí táhnutí.
Když dítě jen ťukne (což dělá nejčastěji), drag skončí mimo kolej a **nestane se vůbec
nic**. Žádná odezva. To je to nejhorší, co se dítěti v této hře může stát.

Co přidat:

- **Ťuknutí = přidání vagónu.** Rozlišit tap vs. drag podle vzdálenosti/času pohybu;
  krátký tap na kartu v paletě → vagón přiletí na kolej s animací.
- Drag ponechat pro ty, koho baví (nebo ho úplně zahodit — pro tento věk je zbytečný).
- Zvětšit „lepivost" dropu — kolej má chytat i drop kousek nad/pod sebou.

### A3. Level 1 je pro čtyřletého moc těžký

`data/levels.ts` omezuje jen **čísla** (1–3), ale paleta pořád nabízí **3 lokomotivy a
všech 6 typů vagónů** (`DragPalette.tsx:67,92`). Šance trefit správný typ naslepo je 1:6.
A mapování „mléko → cisterna" je abstraktní kategorizace, kterou čtyřleté dítě neumí —
proto pořád chybuje a přestane ho to bavit.

Co přidat:

- **Zjednodušený level 1**: v paletě jen 2–3 typy vagónů (ten správný + 1–2 rozlišovače)
  a čísla 1–2. Výběr vygenerovat z aktuálního zadání.
- **Náklad nakreslit přímo na vagón** v paletě (uhlí na výsypném voze, mléko na cisterně,
  jablka koukající z krytého vozu). Ve `svgs.tsx` jsou vagóny teď prázdné skořápky.
  Tímhle se mapování stane **samovysvětlující** a nápověda přestane být potřeba.
  **Zapnuté jen na levelu 1–2**, na nejvyšším levelu vagóny zůstanou prázdné, aby si dítě
  mapování postupně zapamatovalo. Implementačně = volitelný prop `showCargo` na wagon SVG
  komponentách + příznak `cargoHints: boolean` v `LevelDef`.
- Rozšířit `LevelDef` v `types/index.ts` o `wagonTypeIds` (které typy zobrazit) a
  `locomotiveIds` — vše dál v `/src/data/`.

### A4. Číslo v zadání je jen číslice

`TaskHero.tsx:45` zobrazí `{task.count}`. Čtyřleté dítě číslici „3" často ještě spolehlivě
nepřečte, ale **tři tečky pozná okamžitě** (subitizace).

Co přidat:

- Pod číslici doplnit **tečky/puntíky** (●●●) — číslo i množství zároveň.
- **Živý čítač** u koleje: prázdné obrysy se zaplňují, jak dítě přidává vagóny (3 obrysy →
  2 plné, 1 prázdný). Dítě si tak umí odpověď zkontrolovat *samo předem*, místo aby čekalo
  na verdikt.

### A5. Tlačítko „Jet!" má text, který dítě nepřečte

`App.tsx:230` — `<span>Jet!</span>`. Porušuje pravidlo „no text labels" z `AGENTS.md`.
Nahradit čistě ikonou (velká zelená šipka / mašinka) a doplnit zvukem houkačky.

---

## B. Motivace a odměna — proč vůbec hrát dál

### B1. Odměna je moc krátká a málo výrazná

`useGameState.ts:13` — oslava trvá 2,2 s a pak se automaticky přepne dál. Dítě si úspěch
nestihne užít a nemá nad tím kontrolu.

Co přidat:

- **Konfety** — `canvas-confetti` je v `package.json` nainstalované a komponenta
  `CelebrationScreen.tsx` ho používá, ale **je to mrtvý kód, nikde se nevolá** (používá se
  jen `Celebration.tsx` s SVG hvězdami). Stačí ji zapojit.
- Vlak, který **opravdu odjede** přes celou obrazovku s kouřem, otáčejícími se koly a
  houkačkou (teď `train-depart` v `index.css:17` jen posune obsah v 140px pruhu).
- Místo auto-advance nechat na obrazovce **velké zelené tlačítko „další"** — dítě si určí
  tempo samo. Agency je pro čtyřleté zásadní.

### B2. Postup je zobrazený abstraktně

Hvězdičky + tečky vpravo nahoře (`App.tsx:139-167`). Čtyřleté dítě nechápe „3 tečky =
postup do dalšího levelu".

Co přidat:

- **Mapa cesty**: vláček po každém správném kole popojede o jedno políčko k dalšímu
  nádraží. Konkrétní, vizuální, srozumitelné bez čtení.
- Nebo **sbírání**: za každý vlak přibude zvířátko / samolepka do „vagónové knížky".
  Sbírání je pro tenhle věk nejsilnější motivátor, jaký existuje.

### B3. Hra nemá postavu ani příběh

Není důvod, *proč* vlak skládat. Čtyřleté děti jedou na příběhu.

Co přidat:

- Mašince dát **oči a jméno** (mrká, usmívá se, při chybě se zatváří smutně).
- Mikro-příběh v obrázcích: na nádraží čeká hromada uhlí / stádo krav → vlak to má odvézt.
  Žádný text — jen ikonky u cíle cesty.

---

## C. Férovost a adaptivita

### C1. Zpětná vazba je „všechno nebo nic"

`useGameState.ts:114-137` — dítě musí trefit lokomotivu + typ + počet *najednou*, jinak
třes + červená. Žádná částečná odměna.

Co přidat:

- **Semafor u koleje** (už existuje, `TrackZone.tsx:13`) může **zezelenat sám**, jakmile je
  vlak správně — ještě před odesláním. Dítě dostane průběžnou nápovědu „teď je to dobře".
- Chybu rozdělit: zvlášť reakce na špatný typ (vagón se „zavrtí a odmítne") a zvlášť na
  špatný počet (ukázat, kolik chybí/přebývá).
- Zmírnit chybovou reakci — třes celé obrazovky + červená může menší dítě odradit. Lépe:
  povzbudivý zvuk + jemné nakopnutí správným směrem.

### C2. Obtížnost jde jen nahoru

`useGameState.ts:139-156` — 3 správné a level se **natrvalo** zvýší; zpět se nikdy
nespadne. Když se čtyřletý prokliká na level 3 (1–10 vagónů!), hra se stane nehratelnou a
on skončí.

Co přidat:

- **Adaptivní obtížnost**: po 2–3 chybách za sebou snížit level (nebo aspoň `maxNumber`).
- Vyžadovat správné odpovědi **za sebou**, ne kumulativně.
- Level 3 s 10 vagóny je pro 4 roky nereálný — strop stáhnout na ~5.

### C3. Tlačítko resetu je past

`App.tsx:136` — celý blok hvězdiček a teček je `<button>`, který **jedním ťuknutím bez
potvrzení smaže veškerý postup**. Je to velký cíl nahoře na obrazovce, přesně tam, kam
dítě náhodně ťuká. Schovat za dlouhý stisk / rodičovskou bránu (např. podržet 3 s).

---

## D. Tablet — technické věci, které kazí dojem

### D1. Multi-touch rozbíjí táhnutí

`App.tsx:60-72` poslouchá `pointermove`/`pointerup` na `window` a **neřeší `pointerId`**.
Když dítě položí na tablet druhý prst nebo dlaň, drag poskočí nebo se ukončí předčasně.
Řešení: uložit si `pointerId` startovního doteku a ostatní ignorovat.

### D2. Chybí fullscreen / PWA (Android Chrome)

`index.html` má jen základní viewport. Na Android tabletu to znamená: viditelná lišta
prohlížeče, **pull-to-refresh uprostřed hry** (dítě omylem restartuje kolo), double-tap
zoom a přetahování stránky.

Co přidat:

- `public/manifest.json` + `display: "fullscreen"` → Chrome nabídne „Instalovat aplikaci"
  a hra pak běží bez lišty prohlížeče. Na Androidu funguje výrazně líp než na iOS.
- `overscroll-behavior: none` na `html, body` v `index.css` → **vypne pull-to-refresh**.
- `touch-action: manipulation` globálně → zabije double-tap zoom a 300ms delay.
- `user-scalable=no, maximum-scale=1` ve viewport meta v `index.html`.
- Volitelně `screen.orientation.lock()` + Wake Lock API (obojí na Androidu funguje), aby
  tablet nezhasl uprostřed přemýšlení.

### D3. Rozložení na šířku

`useTablet.ts` je jediný breakpoint 768px. Tablet na šířku (1024×768) má málo výšky, ale
hodně šířky — paleta + kolej + tlačítko naskládané pod sebou se tam mačkají. Řešení: na
landscape dát paletu po stranách a kolej přes celou spodní část.

---

## E. Obsahová variabilita (až budou hotové A–D)

Jedno jediné zadání pořád dokola omrzí. Nápady na střídání módů:

- **Nakládání**: vlak je složený, dítě přetahuje náklad *do* vagónů.
- **Který vagón?**: jen výběr 1 ze 3 — nejjednodušší mód, dobrý rozjezd pro nejmenší.
- **Volná jízda / pískoviště**: žádné zadání, dítě si staví vlak jak chce a pouští ho. Pro
  čtyřleté často **nejzábavnější režim ze všech** a je skoro zadarmo — logika už existuje.
- Barvičky: „postav červený vlak".

---

## Pořadí implementace

Každá fáze je samostatně použitelná a dá se otestovat s dítětem, než se pokračuje dál.

| Fáze | Co | Proč | Stav |
|---|---|---|---|
| **1** | A2 tap-to-place · A1 zvuky + český hlas · A5 ikona místo „Jet!" | Odstraní frustraci z ovládání a hru „ozvučí" | ☐ |
| **2** | A3 lehčí level 1 · náklad na vagónech (lvl 1–2) · A4 tečky u čísla | Dítě konečně chápe zadání | ☐ |
| **3** | C1 průběžný semafor · C2 adaptivní obtížnost · C3 zámek resetu | Hra přestane trestat | ☐ |
| **4** | B1 konfety + delší odjezd · B2 mapa cesty · B3 mašinka s očima | Odměna, kvůli které se dítě vrací | ☐ |
| **5** | D1 pointerId · D2 PWA/fullscreen + vypnutí pull-to-refresh · D3 landscape | Tablet konečně sedne | ☐ |
| **6** | E volná jízda / další módy | Životnost hry | ☐ |

**Kdyby byl čas jen na jednu věc:** zvuk s českým hlasem (A1) + ťuknutí místo táhnutí (A2).
Tyhle dvě samy o sobě mění hru z „nechápu, co po mně chce a nic nereaguje" na hratelnou.

**Nejlevnější drobnost s velkým efektem:** vypnout pull-to-refresh
(`overscroll-behavior: none`) a zamknout reset tlačítko — obojí je pár řádků a obojí teď
dítěti aktivně kazí hru.

---

## Jak ověřovat každou fázi

- `npm run build` a `npm run lint` musí projít (`AGENTS.md`).
- `npm run dev` v emulaci Android tabletu na výšku i na šířku — projít všechny levely,
  ověřit tap i drag, min. tap target 64 px.
- Ručně projít hraniční případy validace: `count = 1`, `count = max`, náklad `people`.
- Zvuk otestovat po prvním doteku a na zařízení bez českého hlasu (fallback nesmí spadnout).
- Nakonec zkusit s dítětem — jediný test, který opravdu platí.
