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
| B1 konfety, delší odjezd, tempo dítěte | ⏳ částečně | odjezd hotový, konfety pořád mrtvý kód, auto-advance zůstal |
| B2 mapa cesty / sbírání | ☐ nezačato | pořád hvězdičky a tečky |
| B3 mašinka s očima, příběh | ⏳ částečně | oči a úsměv jen ve world módu, jméno a příběh nikde |
| C1 semafor zezelená sám | ✅ hotovo | `hooks/useGameState.ts` (`isRight`), `components/TrackZone.tsx` |
| C2 adaptivní obtížnost | ☐ nezačato | level jde pořád jen nahoru |
| C3 zámek resetu | ✅ hotovo | `App.tsx` (`RESET_HOLD_MS`), podržení 900 ms |
| D1 pointerId | ✅ hotovo | `App.tsx`, vyřešeno spolu s A2 |
| D2 PWA / fullscreen / gesta | ⏳ částečně | pull-to-refresh vypnutý, zbytek ne |
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

**✅ Hotovo.** Ťuknutí položí vagón, rozhodnutí ano/ne padne synchronně už při stisknutí,
takže jeden dotek nikdy nedostane „ano“ a hned po něm „ne“. Táhnutí zůstalo, drop je
odpouštivý a druhý prst nebo dlaň už táhnutí nerozbije (tím je hotové i D1).

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

**⏳ Částečně.** Odjezd už je skutečný: houkačka, kouř, vlak se rozjede po kolejích.
Zbývá ale to hlavní z tohohle bodu:

- **Konfety jsou pořád mrtvý kód.** `components/CelebrationScreen.tsx` používá
  `canvas-confetti`, ale nikdo ji nevolá; `App.tsx` renderuje `Celebration` (SVG hvězdy)
  a ve world módu `WorldCheer`. Buď zapojit, nebo ten soubor smazat.
- **Auto-advance zůstal.** `CELEBRATE_MS = 2200` v `hooks/useGameState.ts` a hra se
  přepne sama. Velké zelené tlačítko „další“, aby si tempo určilo dítě, není.

### B2. Postup je zobrazený abstraktně

**☐ Nezačato.** Pořád hvězdičky a tečky vpravo nahoře. Mapa cesty ani sbírání zvířátek
nejsou.

### B3. Hra nemá postavu ani příběh

**⏳ Částečně.** Ve world módu má lokomotiva oči a úsměv a ve vagónech i na nádraží sedí
zvířátka. V klasickém módu je vlak schválně nezměněný, je to kontrolní obrazovka pro
srovnání. Jméno mašinky, smutná tvář při chybě a mikro-příběh u cíle nejsou.

---

## C. Férovost a adaptivita

### C1. Zpětná vazba je „všechno nebo nic“

**✅ Hotovo.** Semafor u koleje zezelená sám, jakmile je vlak správně, ještě před
odesláním, a zelenou nedostane vlak, který tlačítko odmítne. Chyba je rozdělená: špatný
typ dostane odmítnutí na kartě a ukázání na to, co jde, špatný počet se odmítne na
kapacitě. Třes obrazovky a červená zůstaly jen na odeslání špatného vlaku.

### C2. Obtížnost jde jen nahoru

**☐ Nezačato.** `nextRound` v `hooks/useGameState.ts` pořád jen přičítá a level se
zvyšuje `Math.min(level + 1, …)`. Chybí:

- snížit level (nebo aspoň `maxNumber`) po 2–3 chybách za sebou,
- počítat správné odpovědi za sebou, ne kumulativně,
- strop levelu 3 stáhnout z 10 na ~5. World mód má vlastní strop 2
  (`WORLD_MAX_COUNT` v `data/world.ts`), klasický mód má pořád 1–10.

### C3. Tlačítko resetu je past

**✅ Hotovo.** Reset je za podržením, `RESET_HOLD_MS = 900` v `App.tsx`. Roadmapa
navrhovala ~3 s; 900 ms stačí na to, aby to nešlo omylem, ale klidně to zvyšte, jestli
se na to dítě prokliká.

---

## D. Tablet — technické věci, které kazí dojem

### D1. Multi-touch rozbíjí táhnutí

**✅ Hotovo.** Vyřešeno spolu s A2: startovní `pointerId` se uloží a ostatní se ignorují.

### D2. Chybí fullscreen / PWA (Android Chrome)

**⏳ Částečně.** Hotové je vypnutí pull-to-refresh (`overscroll-behavior: none`
v `index.css`) a stránka se neposouvá, `scrollHeight` se rovná `clientHeight` v obou
orientacích.

Zbývá:

- `public/manifest.json` + `display: "fullscreen"`, aby Chrome nabídl „Instalovat aplikaci“,
- `touch-action: manipulation` globálně (double-tap zoom a 300ms delay),
- `user-scalable=no, maximum-scale=1` ve viewport meta v `index.html`, ta je pořád
  v původním stavu,
- volitelně `screen.orientation.lock()` a Wake Lock.

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
| **3** | C1 průběžný semafor · C2 adaptivní obtížnost · C3 zámek resetu | Hra přestane trestat | ⏳ C1 a C3 hotové, C2 zbývá |
| **4** | B1 konfety + delší odjezd · B2 mapa cesty · B3 mašinka s očima | Odměna, kvůli které se dítě vrací | ⏳ odjezd a oči (world) hotové, zbytek zbývá |
| **5** | D1 pointerId · D2 PWA/fullscreen + vypnutí pull-to-refresh · D3 landscape | Tablet konečně sedne | ⏳ D1 a pull-to-refresh hotové |
| **6** | E volná jízda / další módy | Životnost hry | ⏳ „Který vagón?“ jako `?mode=world` |

**Co dělat dál, kdyby byl čas jen na jednu věc:** dát tablet dítěti a nechat ho vybrat
mezi `?mode=world` a `?mode=classic`. Ta odpověď rozhodne, jestli má smysl dělat D3
a s ním dotáhnout world mód, nebo jít na B1 a C2 v klasickém módu.

**Nejlevnější drobnost s velkým efektem, která pořád leží:** dopsat `touch-action`
a viewport meta z D2. Je to pár řádků a double-tap zoom umí kolo rozbít.

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
