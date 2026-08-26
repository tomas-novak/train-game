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

---

## Stav k 23. 8. 2026

Celá sekce A je hotová a zmergovaná (PR #11, merge `8d1b609`). Hotové je i C1, C3 a D1,
částečně D2 a E. Sekce B, C2 a D3 zbývají.

| Sekce | Stav | Kde to je |
|---|---|---|
| A1 zvuky + český hlas | ✅ hotovo | `utils/sfx.ts`, `hooks/useSpeech.ts`, `hooks/useGameAudio.ts`, `data/phrases.ts`, `components/MuteButton.tsx` |
| A2 ťuknutí místo táhnutí | ✅ hotovo | `App.tsx`, `components/DragPalette.tsx`, `utils/train.ts` |
| A3 lehčí level 1 + náklad na vagónech | ✅ hotovo | `data/levels.ts`, `data/cargo.ts`, `components/svgs.tsx`, `utils/random.ts` |
| A4 tečky u čísla + živý čítač | ✅ hotovo | `components/CountRow.tsx`, `components/TaskHero.tsx`, `components/TrackZone.tsx` |
| A5 ikona místo „Jet!“ | ✅ hotovo | `App.tsx`, `index.css` |
| B1 konfety, delší odjezd, tempo dítěte | ✅ hotovo | `components/NextButton.tsx`, `hooks/useGameState.ts` (`CELEBRATE_FALLBACK_MS`) |
| B2 mapa cesty / sbírání | ☐ nezačato | pořád hvězdičky a tečky |
| B3 mašinka s očima, příběh | ✅ hotovo | `data/world.ts` (`ENGINE_NAME`), `data/phrases.ts` (`worldTaskPhrase`, `STORY_PHRASES`), `types/index.ts` (`mood`), `components/svgs.tsx`, `hooks/useEngineMood.ts`, `hooks/useGameAudio.ts`, `components/TrackZone.tsx`, `App.tsx` — jen ve world módu |
| C1 semafor zezelená sám | ✅ hotovo | `hooks/useGameState.ts` (`isRight`), `components/TrackZone.tsx` |
| C2 adaptivní obtížnost | ✅ hotovo | `utils/progress.ts`, `hooks/useGameState.ts` |
| C3 zámek resetu | ✅ hotovo | `App.tsx` (`RESET_HOLD_MS`), podržení 900 ms |
| D1 pointerId | ✅ hotovo | `App.tsx`, vyřešeno spolu s A2 |
| D2 PWA / fullscreen / gesta | ⏳ částečně ověřeno | `index.html`, `public/manifest.json`, `src/index.css`, `hooks/useWakeLock.ts` — instalace/fullscreen samo neověřeno z vývojářského prostředí, viz níže |
| D3 rozložení na šířku | ☐ nezačato | a je to teď blokátor i pro E, viz níže |
| E další módy | ⏳ částečně | „Který vagón?“ existuje jako `?mode=world` |

### Co u toho vzniklo navíc

- **Pravda v signálech.** Nebylo to v roadmapě, ale bez toho nešlo dodělat A3 ani A4.
  Zelená teď znamená jedinou věc: „vlak je správně“. Potvrzení položení je bez barvy,
  zelenou má jen semafor, výplň čítače a pozvání na tlačítku, a všechno tohle čte jeden
  zdroj (`isRight`), který nepočítá vagón, co ještě letí. Dřív hra pustila velkou zelenou
  i na přepočítaný nebo úplně špatný vlak a pak ho při odeslání odmítla.
- **Špatný vagón se dá vzít zpět.** V klasickém módu ťuknutí na jiný typ vagónu vlak
  přestaví, ve world módu se odmítne a hra v tom samém snímku ukáže cestu ven. Plný
  špatný vlak už není slepá ulička, ze které se dítě nedostane.
- **Náhodné pořadí vagónů v nabídce.** Správný vagón se dřív dal poznat podle místa
  v řadě (uhlí vlevo, mléko doprostřed, jablka doprava, každé kolo stejně), takže level
  šel vyhrát zapamatováním pozice místo poznávání nákladu. Místa se teď každé kolo míchají.
- **Testovací nástroj.** Headless Chrome, který hru ovládá skutečnými doteky, měří
  velikost cílů, latenci reakce a jestli se reakce vůbec vykreslila, a dělá snímky pro
  srovnání s referencí. Není v repozitáři, je to vývojová věc.

---

## A. Blokátory zábavy — tady je 80 % problému

### A1. Hra je úplně němá 🔇 ← největší jednotlivá věc

**✅ Hotovo.** Zvuky se generují kódem (cvaknutí spřáhla, houkačka, šš-šš rozjezd,
jásot, měkké „ups“ a vlastní tón pro „zkus tenhle“), zadání se čte česky přes
`speechSynthesis` na začátku kola i po ťuknutí na zadání, a počítá se nahlas.

Co je dobré vědět k údržbě:

- Číslo se řekne do několika ms po dopadu vagónu, a když se to nestihne, zahodí se.
  Zastaralé číslo je horší než ticho, protože pojmenuje jiný okamžik.
- České tvary jsou v `data/phrases.ts`: „jeden vagon“, „dva vagony“, „pět vagonů“.
  Naivní šablona udělá „pět vagony“, což je přesně ten druh chyby, po které dospělý
  hru vypne.
- Když v zařízení český hlas není, hra mluvit přestane, ale hraje se dál a nic nespadne.
- Hlas se odemkne prvním dotekem kdekoli na obrazovce, ne jen na herních prvcích.
- Ztlumení je ikona bez textu, 88 px.

### A2. Drag & drop je pro čtyřleté ruce moc těžké

**✅ Hotovo.** Ťuknutí položí vagón. Táhnutí zůstalo, drop je odpouštivý a druhý prst nebo
dlaň už táhnutí nerozbije (tím je hotové i D1).

Jak je rozložená zpětná vazba, protože na tom záleží a protože to není to, co tu stálo
dřív: při stisknutí se ozve cvaknutí a karta se zmačkne **bez barvy**, a teprve při puštění
padne závazné ano/ne (`commit` v `App.tsx`, `addToTrain` přepočítá vlak, jak vypadá v tu
chvíli). Kontrola při stisknutí je jen předběžná. Díky tomu jeden dotek nedostane zelené
„ano“ a po něm „ne“: když dva prsty stisknou dvě karty a zbývá jedno místo, první puštění
ho zabere a druhé se odmítne, ale žádné z nich mezitím nic neslíbilo.

### A3. Level 1 je pro čtyřletého moc těžký

**✅ Hotovo.** Level 1 nabízí 2 typy vagónů a čísla 1–2, `LevelDef` má `wagonTypeIds`,
`locomotiveIds`, `wagonChoices` a `cargoHints`, a náklad je nakreslený přímo ve vagónu
na levelu 1–2 (na levelu 3 zůstávají prázdné, jak roadmapa chtěla).

Pozor při úpravách: náklad musí být poznat ve velikosti karty. Dvě kola review padla na
tom, že mléko byla skoro bílá láhev na skoro bílé cisterně a rozbíjela siluetu vagónu,
který se má dítě naučit.

### A4. Číslo v zadání je jen číslice

**✅ Hotovo.** Pod číslicí jsou tečky (zlom po pěti) a u koleje stojí jedno prázdné lůžko
na každý chybějící vagón, ve velikosti vagónu, takže si dítě odpověď zkontroluje samo
předem. Při počtu 10 se všechno vejde do obrazovky v obou orientacích.

### A5. Tlačítko „Jet!“ má text, který dítě nepřečte

**✅ Hotovo.** Tlačítko je jen ikona, má vlastní barvu, kterou nic jiného na obrazovce
nepoužívá, a plocha, která reaguje, sedí na tom, co je vidět. Správný a špatný výsledek
už nejsou signalizované obráceně (houkačka se dřív ozvala i na špatný vlak).

---

## B. Motivace a odměna — proč vůbec hrát dál

### B1. Odměna je moc krátká a málo výrazná

**✅ Hotovo.** Odjezd je skutečný: houkačka, kouř, vlak se rozjede po kolejích. A obě
zbývající věci z tohohle bodu jsou dotažené:

- **Konfety už nejsou mrtvý kód, protože už vůbec nejsou.** `components/CelebrationScreen.tsx`
  používal `canvas-confetti`, ale nikdo ho nevolal; `App.tsx` renderuje `Celebration`
  (SVG hvězdy) a ve world módu `WorldCheer`, a to zůstává. Soubor i závislost jsou smazané
  místo zapojené — je to přesně ten fullscreen `bg-yellow-100` wash s emoji, proti kterému
  se `WorldCheer.tsx` vymezuje celým odstavcem opřeným o měření reference, a oba módy už
  mají oslavu navrženou proti té referenci.
- **Auto-advance je nahrazený tlačítkem.** `components/NextButton.tsx` — ikona, žádné
  slovo, `--next-amber`, vlastní barva mimo zelenou/červenou/`--go-pink` — se objeví nad
  oslavou a kolo posune hned na ťuknutí. `CELEBRATE_MS = 2200` v `hooks/useGameState.ts`
  se přejmenoval na `CELEBRATE_FALLBACK_MS = 8000`: je to teď jen pojistka pro dítě, které
  tlačítko nezmáčkne, ne to, co tempo určuje.

### B2. Postup je zobrazený abstraktně

**☐ Nezačato.** Pořád hvězdičky a tečky vpravo nahoře. Mapa cesty ani sbírání zvířátek
nejsou.

### B3. Hra nemá postavu ani příběh

**✅ Hotovo, jen ve world módu.** Mašinka má jméno (`ENGINE_NAME = 'Bafík'` v
`data/world.ts`, použité jen v 1. pádu — „Bafík chce dva vagony s uhlím!“, přes
`worldTaskPhrase` v `data/phrases.ts`, která staví na `taskPhrase`, takže skloňování
vagonů zůstává na jednom místě). Při špatném vlaku se tvář na `SAD_MS = 1000` ms stáhne
do smutku a pak se sama vrátí k úsměvu, i kdyby vlak pořád nebyl opravený
(`hooks/useEngineMood.ts`) — beze změny barvy, jde jen o jiný tvar úst
(`MOUTH_HAPPY`/`MOUTH_SAD` v `components/svgs.tsx`). Po pochvale na konci kola přijde
jedna věta mikro-příběhu (`STORY_PHRASES`), řečená jako pokračování téže věty
(`hooks/useGameAudio.ts`).

V klasickém módu je vlak schválně beze změny: je to kontrolní obrazovka, na které stojí
srovnání rozhodující o D3, a postava na obou obrazovkách by z toho udělala měření dvou
proměnných místo jedné. Nese to i struktura kódu — `Face` v `components/svgs.tsx` vrací
`null`, kdykoli `readMode() !== 'world'`, takže klasická lokomotiva fyzicky nemůže
vykreslit ústa, ať se jí pošle jakýkoli `mood`.

---

## C. Férovost a adaptivita

### C1. Zpětná vazba je „všechno nebo nic“

**✅ Hotovo.** Semafor u koleje zezelená sám, jakmile je vlak správně, ještě před
odesláním, a zelenou nedostane vlak, který tlačítko odmítne. Třes obrazovky a červená
zůstaly jen na odeslání špatného vlaku.

Špatný počet se odmítne hned v obou módech (kapacita je počet ze zadání). U špatného
**typu** se módy schválně liší, a je to rozhodnutí, ne nedodělek:

- **Klasický mód:** vagón, který nesedí na zadání, se **normálně položí**. Který vagón je
  správný, je otázka, na kterou má odpovědět dítě, a hra mu ji nesmí vzít tím, že by šla
  zmáčknout jen jedna karta. Verdikt padne, až vlak pošle: semafor mezitím zůstane
  červený, tlačítko odjezd odmítne a špatné vagóny se označí.
- **World mód:** kolo je výběr ze tří, takže tam se nesprávný výběr odmítne už na kartě
  a hra ve stejném snímku ukáže cestu ven. Rozhoduje o tom `pickWanted`
  v `utils/validation.ts`, které vrací požadovaný typ jen pro world.

### C2. Obtížnost jde jen nahoru

**✅ Hotovo.** Jednotkou je čisté kolo, ne odpověď: kolo v této hře může skončit
jedině úspěchem — `nextRound` se volá z časovače oslavy nebo z tlačítka dál, nikdy
z chyby, a po špatném vlaku dítě pokračuje na tom samém kole, dokud není správně.
Kdyby se počítalo za jednotlivou odpověď, každé kolo by ho vynulovalo tím úspěchem,
kterým vždycky končí, a demotion by byl mrtvý kód, co vypadá hotově. `advanceProgress`
v `utils/progress.ts` proto dostává `roundWasDirty` — příznak, že se během kola aspoň
jednou odeslal špatný vlak — a dvě taková kola za sebou snižují level o jeden.
Level jde nahoru po třech čistých kolech za sebou. Strop levelu 3 je stažený z 10 na 5
(`data/levels.ts`); world mód má pořád vlastní strop 2 (`WORLD_MAX_COUNT` v `data/world.ts`).

**Otevřená otázka: co C2 vlastně znamená ve world módu.** Spec (a dřívější
verze tohoto řádku) tvrdila, že snížení levelu se ve world módu projeví „na
typech vagónů a na nápovědě nákladu". Druhá půlka je nepravdivá: `App.tsx`
vynucuje `cargoHints = true` ve world módu bez ohledu na level, takže nápověda
nákladu se snížením nemění vůbec. A je to horší, než jen chybějící efekt na
jedné vlastnosti — ve world módu se špatný typ vagónu odmítne rovnou při
výběru (`pickWanted` v `utils/validation.ts`) a nikdy se nedostane do fáze
`wrong`, takže jediná chyba, kterou tam dítě může vůbec zaznamenat, je
zmáčknutí odjezdu s příliš málo vagóny — a `WORLD_MAX_COUNT` drží počet na 2
na každém levelu, takže snížení z levelu 3 na 2 reálně ubere jen náklad
`people` (fond `wagonTypeIds` je na levelech 2 a 3 stejný, mění se jen
`cargoIds`).

Tři možnosti, žádná z nich zatím vybraná — je to rozhodnutí o zážitku dítěte,
ne o kódu:

1. Nechat neúspěšný pokus ve world módu „zašpinit" kolo (počítat ho jako
   chybu), aby `wrongStreak` měl vůbec co počítat.
2. Dát world levelům něco, co dítě skutečně pozná — jinou nabídku vagónů,
   jiné tempo, cokoliv hmatatelného na obrazovce, kterou reálně hraje.
3. Zapsat C2 jako hotové jen pro klasický mód a world mód z nároku vyjmout.

### C3. Tlačítko resetu je past

**✅ Hotovo.** Reset je za podržením, `RESET_HOLD_MS = 900` v `App.tsx`. Roadmapa
navrhovala ~3 s; 900 ms stačí na to, aby to nešlo omylem, ale klidně to zvyšte, jestli
se na to dítě prokliká.

---

## D. Tablet — technické věci, které kazí dojem

### D1. Multi-touch rozbíjí táhnutí

**✅ Hotovo.** Vyřešeno spolu s A2: startovní `pointerId` se uloží a ostatní se ignorují.

### D2. Chybí fullscreen / PWA (Android Chrome)

**⏳ Částečně ověřeno.** Co je ověřené: vypnutí pull-to-refresh
(`overscroll-behavior: none` v `index.css`) bylo hotové už dřív, stránka se
neposouvá, `scrollHeight` se rovná `clientHeight` v obou orientacích.
`touch-action: manipulation` na `html` a `body` (double-tap zoom a 300ms delay
pryč, tažení z A2 zůstalo živé přes `touch-action: none` na tažených plochách),
`user-scalable=no, maximum-scale=1` ve viewport meta a `lang="cs"` v `index.html`,
a Wake Lock (`hooks/useWakeLock.ts`) proti zhasnutí obrazovky během hraní — to
všechno se dá zkontrolovat bez instalace a je hotové.

Co ověřené NENÍ: `public/manifest.json` s `display: "fullscreen"` nedělá nic,
dokud se appka skutečně nenainstaluje, a jestli Chrome na cílovém tabletu
instalaci vůbec nabídne s jednou SVG ikonou (`public/favicon.svg`,
`"sizes": "any"`) a bez service workera, nelze ověřit z vývojového prostředí —
to je přesně to, co se z tohoto stroje otestovat nedalo, ne domněnka.

Zbývá:

- **Ověřit instalaci na reálném tabletu.** Když se nabídka „Instalovat aplikaci"
  neobjeví, doplní se `icon-192.png` a `icon-512.png` jako samostatný druhý
  krok (viz spec, sekce D2 — „Proč SVG a ne PNG").
- **Service worker.** Vlastní rozhodnutí, ne mezera: cíl je fullscreen a ikona na
  ploše, ne offline režim, a přidávat ho jen kvůli instalační nabídce by byla
  komplikace bez skutečné potřeby.
- **`screen.orientation.lock()`.** Patří do D3: zamknout landscape by přišpendlilo
  hru k rozložení, které D3 ještě nepostavilo, a zamknout portrait by rozbilo
  world mód.

### D3. Rozložení na šířku

**☐ Nezačato, a přibyl druhý důvod.** K původnímu (na šířku je málo výšky, paleta patří
po stranách) se přidalo tohle: world mód potřebuje kreslit vagóny v referenční velikosti,
a na výšku to nejde. Tablet na výšku má 768 px šířky, lokomotiva plus jeden vagón
v referenční velikosti měří asi 840 px, takže celý vlak se na výšku nevejde. Všechny
referenční screenshoty Sago jsou na šířku. Na šířku se referenční velikost povedla, na
výšku ne, a spravit to znamená právě D3.

---

## E. Obsahová variabilita (až budou hotové A–D)

**⏳ Částečně.** „Který vagón?“ existuje jako druhá obrazovka, ne jako náhrada:

- `?mode=world` je nová obrazovka, `?mode=classic` je původní, nezměněná. Bez parametru
  se ukáže world. Přepínač je v `utils/mode.ts`, obsah v `data/world.ts`,
  `components/WorldScene.tsx` a `components/WorldChoice.tsx`.
- World mód nemá žádnou paletu: vagóny stojí na té samé koleji, mají náklad vidět,
  ťuknutím se rozjedou a připojí, nic není zašedlé. Kolo je výběr ze tří, počet 1–2.
- Obě obrazovky procházejí stejnými kontrolami (cíle ≥ 64 px, reakce do 100 ms a opravdu
  vykreslená, žádná čitelná slova, žádné posouvání stránky).

Na rovinu: srovnání celé obrazovky se Sago Mini Trains naslepo world mód nevyhrál.
Zbývající rozdíl je z velké části D3 (viz výše). Pokusy o jinou geometrii, které se
neosvědčily (skládaná kolej, prudší stoupání, menší vagóny), jsou na větvi
`feature/sekce-e-experiment` i s měřením, proč se nepoužily.

Zbývá z původního seznamu:

- **Nakládání**: vlak je složený, dítě přetahuje náklad do vagónů.
- **Volná jízda / pískoviště**: žádné zadání, dítě si staví vlak jak chce a pouští ho.
- Barvičky: „postav červený vlak“.

---

## Pořadí implementace

| Fáze | Co | Proč | Stav |
|---|---|---|---|
| **1** | A2 tap-to-place · A1 zvuky + český hlas · A5 ikona místo „Jet!“ | Odstraní frustraci z ovládání a hru „ozvučí“ | ✅ |
| **2** | A3 lehčí level 1 · náklad na vagónech (lvl 1–2) · A4 tečky u čísla | Dítě konečně chápe zadání | ✅ |
| **3** | C1 průběžný semafor · C2 adaptivní obtížnost · C3 zámek resetu | Hra přestane trestat | ✅ |
| **4** | B1 konfety + delší odjezd · B2 mapa cesty · B3 mašinka s očima | Odměna, kvůli které se dítě vrací | ⏳ B1 a B3 hotové, B2 zbývá |
| **5** | D1 pointerId · D2 PWA/fullscreen + vypnutí pull-to-refresh · D3 landscape | Tablet konečně sedne | ⏳ zbývá jen D3 |
| **6** | E volná jízda / další módy | Životnost hry | ⏳ „Který vagón?“ jako `?mode=world` |

**Co dělat dál, kdyby byl čas jen na jednu věc:** dát tablet dítěti a nechat ho vybrat
mezi `?mode=world` a `?mode=classic`. Ta odpověď rozhodne, jestli má smysl dělat D3
a s ním dotáhnout world mód, nebo jít na B1 a C2 v klasickém módu.

---

## Jak ověřovat každou fázi

- `npm run build` a `npm run lint` musí projít (`AGENTS.md`). Základ je: build čistý,
  lint hlásí **právě jedno** staré varování (`useTablet.ts:10`, chybějící `mq`).
  Dvě varování jsou chyba.
- `npm ci` musí projít. Lockfile se nemá měnit, když se nemění `package.json`.
- Emulace Android tabletu na výšku i na šířku, projít levely, ověřit tap i drag,
  min. tap target 64 px.
- **Každý dotek musí do 100 ms něco udělat, a musí se to opravdu vykreslit.** Mutace
  DOM za zamrznutým hlavním vláknem je pro dítě nevidět. Animovat `transform`
  a `opacity`, ne `background-color` a `box-shadow`.
- Ručně projít hraniční případy: `count = 1`, `count = max`, náklad `people`, plný
  špatný vlak, dvě ruce na obrazovce, ťuknutí během odjezdu a během oslavy.
- Zvuk otestovat po prvním doteku a na zařízení bez českého hlasu (fallback nesmí spadnout).
- Když se sahá do world módu, zkontrolovat i klasický. Je to kontrolní obrazovka.
- Nakonec zkusit s dítětem — jediný test, který opravdu platí.
