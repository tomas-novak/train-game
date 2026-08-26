# Vrstva 1: dokončení D2, C2, B1 a B3

Datum: 2026-08-24. Zdroj zadání: `roadmap.md`, sekce B1, B3, C2, D2.

## Co tato spec je a co není

Roadmap eviduje sedm nedokončených kusů. Tato spec pokrývá čtyři z nich, a to
právě ty, jejichž hodnota nezávisí na výsledku testu s dítětem, který si
roadmap sama staví za bránu („dát tablet dítěti a nechat ho vybrat mezi
`?mode=world` a `?mode=classic`").

**Mimo rozsah, s vlastní spec později:** D3 rozložení na šířku, B2 mapa cesty,
E další módy. D3 je nejdražší jednotlivý kus a zároveň jediný, který se může
ukázat jako zbytečný, kdyby dítě vybralo klasický mód. E je na D3 blokované.

## Sekce 1: D2 zbytek, tablet chrome

### Viewport a jazyk dokumentu

`index.html` má dnes `content="width=device-width, initial-scale=1.0"`.
Doplní se `maximum-scale=1, user-scalable=no`, čímž zmizí double-tap zoom
a s ním 300 ms prodleva na každém doteku.

Ve stejném souboru se opraví `<html lang="en">` na `lang="cs"`. Hlas si jazyk
bere explicitně z `cs-CZ` v `useSpeech.ts`, takže se tím nic funkčního nemění,
ale deklarovaný jazyk dokumentu je dnes nesprávný.

### touch-action

Do `index.css` k existujícímu bloku `overscroll-behavior: none` (řádek 1476
a dále, pravidla pro `html` a `body`) přijde `touch-action: manipulation`.

Vědomě **ne** `touch-action: none` globálně. A2 nechalo táhnutí naživu vedle
ťuknutí a globální `none` by ho zabilo. Na plochách, kde se skutečně táhne,
tedy na kartách palety (`DragPalette`) a v `TrackZone`, se nastaví
`touch-action: none` cíleně, aby prohlížeč nemohl gesto sebrat pro pan.
Dokument je už dnes připnutý na `html`, `body` i `#root` a `scrollHeight`
se rovná `clientHeight` v obou orientacích, takže cílené `none` nic
neposouvá ani nezamrzá.

### manifest.json

Nový `public/manifest.json`, odkázaný z `index.html`:

* `name` a `short_name` podle titulku hry,
* `start_url: "/"`,
* `display: "fullscreen"`,
* `background_color` a `theme_color` z `SKY.skyTop` (`#e6f1fa`) v `theme.ts`,
  aby úvodní obrazovka nebliknula bílou,
* `icons`: odkaz na existující `public/favicon.svg` se `"sizes": "any"`
  a `"type": "image/svg+xml"`.

**Proč SVG a ne PNG:** repo nemá žádný image toolchain a kvůli dvěma bitmapám
se nebude přidávat závislost. Chrome na Androidu jednu SVG ikonu se
`sizes: "any"` pro instalovatelnost přijímá.

**Otevřené riziko, nezastírá se:** jestli Chrome na cílovém tabletu skutečně
nabídne „Instalovat aplikaci", nelze ověřit z vývojového prostředí. Když
nenabídne, doplní se `icon-192.png` a `icon-512.png` jako samostatný druhý
krok. Spec netvrdí, že první varianta vyjde.

### Co se vědomě nedělá

**Service worker není součástí.** Bez něj hra nebude fungovat offline. Cíl
tohoto bodu je fullscreen a ikona na ploše, ne offline režim. Service worker je
vlastní subsystém s vlastní pastí na invalidaci cache u hry, která se bude dál
měnit, a patří do samostatného rozhodnutí.

**`screen.orientation.lock()` se nepoužije.** Je to odchylka od roadmapy,
která ho vede jako volitelný, a má jediný důvod: zamknout na šířku nelze,
protože D3 není hotové a zámek by hru připnul do rozložení, které roadmap
sama označuje za nedodělané. Zamknout na výšku nelze, protože to je přesně ta
orientace, ve které se world mód v referenční velikosti nevejde. Zámek
orientace patří do D3.

### Wake Lock

`navigator.wakeLock.request('screen')` s feature-detectem, znovuzískáním na
`visibilitychange` (prohlížeč zámek při skrytí stránky uvolní) a s odchycením
každé výjimky. Selhání nesmí nikdy shodit hru. Zhasínající displej v půlce
kola je reálná otrava a tohle je nejlevnější věc, která ji řeší.

## Sekce 2: C2 adaptivní obtížnost

### Změna schématu postupu

`GameProgress` dnes nese `level` a `correctInLevel`, kde `correctInLevel`
je kumulativní počet. Roadmap chce počítat správné odpovědi **za sebou**, ne
kumulativně, takže:

* `correctInLevel` mění význam na streak. Nuluje se při chybě.
* přidává se `wrongStreak`.

Protože jde o změnu významu uloženého pole, `STORAGE_KEY` v `useGameState.ts`
se bumpne z `trainGameProgress.sky` na `trainGameProgress.v2`. Postup se tím
zahodí a hra začne od levelu 1. To je čistší než migrovat data, jejichž
význam se změnil, a repo pro tohle má precedens v komentáři u dosavadního
klíče.

### Čisté kolo je jednotka, ne odeslání

Tohle je jádro C2 a je nutné to říct přesně, protože naivní čtení roadmapy
(„počítat správné odpovědi za sebou") vede k logice, která nikdy nevystřelí.

Kolo dnes končí **jedině úspěchem**. `nextRound` se volá z časovače fáze
`celebrating` a nikde jinde; po chybě zůstává hra ve fázi `wrong` a dítě
opravuje ten samý vlak, dokud neuspěje. Kdyby tedy `wrongStreak` nuloval
úspěch, nedosáhl by nikdy dvojky a level by se nesnížil ani jednou.

Jednotkou obou streaků je proto **kolo**, ne odeslání, a kolo má jen dva
možné výsledky:

* **čisté kolo** = dítě odeslalo správný vlak, aniž by během něj jednou
  odeslalo špatný,
* **kolo s chybou** = dítě během něj aspoň jednou odeslalo špatný vlak
  (a nakonec, jako vždy, uspělo).

Vyhodnocuje se v `nextRound`, kde už dnes postup roste:

* čisté kolo: `correctInLevel + 1`, `wrongStreak = 0`,
* kolo s chybou: `correctInLevel = 0`, `wrongStreak + 1`.

Povýšení zůstává na `correctInLevel >= CORRECT_PER_LEVEL` (dnes 3), ale teď
to znamená tři čistá kola za sebou, ne tři úspěchy vůbec. To je přesně ta
změna, kterou roadmap chce: dřív level rostl každé třetí kolo bez ohledu na
to, kolik chyb v nich bylo.

### Snížení levelu

Při `wrongStreak >= WRONG_TO_DEMOTE` se `level` sníží o jeden, minimálně na 1,
a oba streaky se nulují. Konstanta `WRONG_TO_DEMOTE = 2` vedle stávajícího
`DEPART_MS` v `useGameState.ts`.

Roadmap navrhuje 2 až 3. Bere se 2, protože čtyřletý je po třech kolech
s chybou za sebou už mimo hru a snížení, které přijde až potom, přichází
pozdě. Konstanta je pojmenovaná právě proto, aby se dala otočit bez hledání
v logice.

Snížení se aplikuje v `nextRound`, tedy před `generateTask`, aby se lehčí
level projevil hned na dalším zadání a ne až o kolo později.

### Jedna chyba za kolo, nejvýš

`submit()` může na tomtéž nezměněném špatném vlaku vystřelit vícekrát, protože
dítě zmáčkne odjezd dvakrát. Dvě zmáčknutí jedné chyby nesmí být dvě chyby.

Řešení plyne z definice výše: kolo je „s chybou" jako **booleovský** příznak,
ne počítadlo. `submit()` ho na špatném vlaku nastaví na `true`, opakované
zmáčknutí ho nastaví na `true` znovu a nic se nezmění. Nuluje se v `nextRound`
spolu s vyhodnocením.

Drží ho ref, ne stav, protože se nastavuje uvnitř obsluhy doteku, kde `phase`
v uzávěru renderu může být o snímek zpět. Je to stejný vzor, jaký v souboru už
používají `phaseRef`, `trainRef` a `pendingKeyRef`, a ze stejného důvodu.

### Strop levelu 3

`LEVELS[2].maxNumber` z `10` na `5`.

Práce z A4 (tečky pod číslicí se zlomem po pěti, prázdná lůžka u koleje) tím
nezmizí a zůstává správná, jen se přestane používat pro počty 6 až 10.
`COUNT_WORDS` v `phrases.ts` pokrývá do deseti dál, takže se nic nerozbije,
kdyby se strop vracel nahoru.

### World mód se nemění v počtu

`WORLD_MAX_COUNT = 2` v `data/world.ts` zůstává. Není to knoflík obtížnosti,
je to kresba: komentář na řádku 707 a okolí to odvozuje z toho, že při třech
vagónech vypadne z rámu tvář lokomotivy, a tvář je ve world módu jediná velká
tvář na obrazovce.

**Oprava po whole-branch review:** tahle sekce dřív tvrdila, že snížení levelu
se ve world módu projeví „na typech vagónů a na nápovědě nákladu, na počtu ne".
Nápověda nákladu je nepravdivá polovina té věty — `App.tsx` drží
`cargoHints = true` ve world módu na každém levelu, takže se snížením nemění.
A dopad na typy vagónů je menší, než věta naznačuje: ve world módu se špatný
typ odmítne přímo při výběru (`pickWanted`), takže se tam nikdy nedostane do
fáze `wrong`, a `WORLD_MAX_COUNT` drží počet na 2 na každém levelu — takže
snížení z levelu 3 na 2 reálně ubere jen náklad `people` (fond
`wagonTypeIds` je na levelech 2 a 3 stejný). Jestli má world mód vůbec něco,
co je při snížení levelu cítit, je otevřená otázka zapsaná v `roadmap.md`
pod C2 — tahle spec ji neřeší.

## Sekce 3: B1 dokončení

### CelebrationScreen se maže

Smaže se `src/components/CelebrationScreen.tsx` a s ním `canvas-confetti`
i `@types/canvas-confetti` z `package.json`.

Roadmap nabízela obojí, zapojit nebo smazat. Repo si na to ale už odpovědělo:
ten soubor je fullscreen overlay s `bg-yellow-100` a emoji, tedy přesně ten
„wash", proti kterému se `WorldCheer.tsx` vymezuje v celém odstavci
dokumentace opřeném o měření referenčních snímků. Oba módy dnes oslavu mají
(`Celebration` v klasickém, `WorldCheer` ve world) a obě byly navržené proti
referenci. Zapojit konfety by znamenalo vrátit rozhodnutí, které někdo udělal
vědomě a zdůvodnil.

`package-lock.json` se tím změní. To je v pořádku a neporušuje pravidlo
z `AGENTS.md`: lockfile se nemá měnit, když se nemění `package.json`, a tady se
`package.json` mění.

### Tlačítko „další"

Nové tlačítko, renderované ve fázi `celebrating` v obou módech:

* ikona bez textu, žádné čitelné slovo,
* velikost podle konvence `MuteButton`: 88 px na tabletu, 72 px jinde,
* vlastní barva, kterou nepoužívá semafor ani tlačítko odjezdu. A5 dalo
  tlačítku odjezdu barvu, kterou nic jiného na obrazovce nemá, a zelená patří
  výhradně `isRight`. „Další" si tedy bere třetí barvu, ne vypůjčenou,
* z-index nad `WorldCheer` a `Celebration`, aby na něj šlo ťuknout během
  oslavy,
* ťuknutí volá `nextRound()`.

### Pojistka místo auto-advance

`CELEBRATE_MS = 2200` se **přejmenuje** na `CELEBRATE_FALLBACK_MS` a zvedne
na `8000`. Nezůstává vedle nové konstanty: dnes je to jediný spotřebitel té
hodnoty (časovač na řádku 384) a oslavné zvuky se spouštějí na přechodu fáze
v `useGameAudio.ts:182`, ne touto konstantou, takže ponechat ji by znamenalo
nechat v souboru mrtvou konstantu s názvem, který slibuje něco jiného.

Tempo tedy určuje dítě, ale hra nikdy netrčí: když do osmi sekund neťukne,
přejde sama. Ťuknutí na tlačítko časovač ruší.

Aby ťuknutí a časovač nepřeskočily kolo dvakrát, `nextRound` zafunguje jen
tehdy, když `phaseRef.current === 'celebrating'`. Bez toho by dotek v tom
samém snímku, kdy dobíhá pojistka, sebral dítěti jedno celé kolo.

## Sekce 4: B3, jen world mód

Rozsah je záměrně omezený na world mód. Klasický mód zůstává nedotčený,
protože je to kontrolní obrazovka: roadmap i `WorldCheer.tsx` na tom staví
srovnání, které má rozhodnout o D3, a postava na obou obrazovkách by z toho
srovnání udělala měření dvou proměnných místo jedné.

### Jméno

Konstanta `ENGINE_NAME = 'Bafík'` v `data/world.ts`, protože obsah patří do
`data/` a nikdy do komponenty.

Jméno se používá **výhradně v prvním pádě**. To je návrhové rozhodnutí, ne
detail: „Bafík chce dva vagony s uhlím!" drží celé jméno na jedné konstantě
a jeho výměna je změna jednoho řádku. Tvary jako „Pomoz Bafíkovi" by
vyžadovaly skloňování a jméno by se rozlilo do `phrases.ts` jako vzor, který
by každé další jméno musel někdo znovu doplnit.

Zadání na začátku kola se ve world módu skládá v `phrases.ts` novou funkcí,
která vezme stávající `taskPhrase` a předřadí jméno. Klasický mód dál používá
`taskPhrase` bez jména.

### Smutná tvář

Ve fázi `wrong` dostane tvář lokomotivy ve world scéně na přibližně jednu
sekundu stažená ústa, pak se vrátí do úsměvu. Kreslí se v `WorldScene`
z tvarů, které `data/world.ts` už popisuje.

**Bez barvy.** Červená je rezervovaná pro odmítnutí odjezdu (třes a červená na
odeslání špatného vlaku) a rozmělnit ji o druhý význam by porušilo pravidlo
„pravda v signálech", které si repo v posledním kole vydobylo.

### Mikro-příběh u cíle

Jedna krátká vyslovená věta ve fázi `celebrating`, ve world módu, položená na
existující balónky. Přidá se do `phrases.ts` a vyvolá v `useGameAudio.ts`
tam, kde se dnes na přechodu do `celebrating` přehrává `playCheer()`
a `PRAISE_PHRASES`.

Žádná nová grafika a žádný text na obrazovce. Věta říká, co Bafík s nákladem
udělal, tedy uzavírá kolo příběhem místo skóre.

### Tichý fallback

Jméno, příběh i pochvala jdou přes stávající `useSpeech`. Když v zařízení není
český hlas, hra zmlkne a hraje se dál. Tohle chování už existuje a nová
sekce ho nesmí obejít.

## Ověřování

Po každé sekci zvlášť, ne až na konci:

* `npm run build` čistý,
* `npm run lint` hlásí **právě jedno** staré varování (`useTablet.ts:10`,
  chybějící `mq` v závislostech). Dvě varování jsou chyba,
* `npm ci` projde.

Hraniční případy, které se projdou ručně:

* dvojí zmáčknutí odjezdu na tomtéž špatném vlaku označí kolo za chybové jen
  jednou, tedy `wrongStreak` se za jedno kolo zvýší nejvýš o jeden (sekce 2),
* dvě kola s chybou za sebou level skutečně sníží, a tři čistá kola za sebou
  ho zvýší. Kolo s chybou, po němž přijde čisté, `wrongStreak` nuluje
  (sekce 2),
* ťuknutí na „další" ve stejném snímku, kdy dobíhá osmisekundová pojistka,
  nepřeskočí dvě kola (sekce 3),
* snížení levelu na levelu 1 nespadne pod 1,
* po každém zásahu do world módu kontrola, že klasický mód zůstal nedotčený,
* `count = 1` a `count = max` na novém stropu 5,
* zvuk po prvním doteku a na zařízení bez českého hlasu.

Na tabletu: emulace i skutečné zařízení, obě orientace, minimální cíl doteku
64 px, každý dotek musí do 100 ms něco vykreslit.

Nakonec test s dítětem, jediný, který opravdu platí, a zároveň brána
pro rozhodnutí o D3.

## Co tím nedostanete

* D3, B2 a E zůstávají nezačaté,
* hra nebude fungovat offline,
* orientace se nezamkne,
* jestli Chrome nabídne instalaci, se ukáže až na cílovém tabletu.
