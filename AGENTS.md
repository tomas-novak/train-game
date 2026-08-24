# train-game – AI Agent Instructions

Main source of truth for all AI coding agents working on this repository.

Kids educational train-building game. Fully client-side, no backend.

The real player is a **four-year-old who cannot read**, on an Android tablet. The game was
originally designed for a five-year-old; `roadmap.md` records why that stopped working and what
changed. Where this file and `roadmap.md` disagree, `roadmap.md` is the later decision.

---

## Tech Stack

- **Framework**: React (functional components + hooks), TypeScript
- **Styling**: Tailwind CSS only — no shadcn/ui, no component libraries
- **Build**: Vite
- **Hosting**: Vercel (static)
- **Packages**: canvas-confetti (celebration effect)

---

## Project Structure

```
/src
  /components        # Reusable UI components (Locomotive, Wagon, TaskDisplay, etc.)
  /data              # Game content: locomotives, wagons, cargo, levels (JSON/TS)
  /hooks             # Custom hooks (useGameState, useLevel, etc.)
  /types             # Shared TypeScript types
  /utils             # Helper functions (validation, scoring)
  /assets            # Images, sounds (if any)
  App.tsx            # Root component
  main.tsx           # Entry point
```

---

## Git Workflow

- **Branch naming**: `feature/nazev-funkce` (Czech feature names OK)
- **Commit messages**: in English
- **Never push directly to `main`** — always use feature branches
- Every feature branch pushed to GitHub triggers a Vercel Preview Deployment — review before merging
- Treat `main` as production-ready at all times

---

## Vercel Deployment

- Static site — no server, no API routes
- Deploy automatically on merge to `main`
- Preview deployments on every feature branch

---

## Game Rules & Logic

### Task format
Each round shows the child: **[number 1–10] + [cargo icon]**
Child must assemble: correct locomotive + correct wagon type + correct number of wagons.

### Cargo → Wagon mapping
| Cargo | Wagon type |
|---|---|
| 🪨 Coal, 🏖️ Sand | Hopper |
| 🥛 Milk, ⛽ Fuel | Tank |
| 🍎 Apples, 📫 Parcels | Box |
| 🚙 Cars, 📦 Containers | Flatcar |
| 👨👩👧👦 People | Passenger |

### Levels
| Level | Numbers | Cargo | Wagon choices offered | Cargo drawn on wagons |
|---|---|---|---|---|
| ⭐ 1 | 1–2 | Coal, Sand, Milk, Apples | 2 (the right one + 1 distractor) | yes |
| ⭐⭐ 2 | 1–5 | All cargo | 4 | yes |
| ⭐⭐⭐ 3 | 1–10 | All cargo including people | all 6 | no |

Level 1 is deliberately 1–2, not 1–3 (`roadmap.md` A3): guessing a wagon type blind out of six was
1 in 6, and the cargo-to-wagon mapping is abstract categorisation a four-year-old does not have yet.
The offered wagon types are generated from the current task, and the cargo is drawn inside the wagon
shells on levels 1–2 so the mapping explains itself, then removed at level 3 so it is learned.

Advance after 3 correct answers per level. Progress saved in `localStorage`.

### Validation
Correct = locomotive selected + correct wagon type + correct wagon count.
On success: confetti + star animation, auto-advance after 2.5s.
On failure: shake animation + highlight incorrect element, no game over.

---

## Coding Conventions

- Functional components only, no class components
- TypeScript everywhere, no `any`
- `camelCase` for variables/functions, `PascalCase` for types/components
- All game content (locomotives, wagons, cargo, levels) defined in `/src/data/` — never hardcoded in components
- No text labels in UI — icons, emojis, and numbers only (child cannot read)
- Minimum tap target size: 64px
- Every touch must produce a visible or audible reaction within 100 ms, and it must be **painted**:
  a DOM mutation behind a main-thread freeze is invisible to the child. Animate compositor
  properties (`transform`, `opacity`), not `background-color` or `box-shadow`.
- Sound is generated in code (Web Audio) and speech via `speechSynthesis` in `cs-CZ`. No audio
  files, no new dependencies. Phrase content lives in `/src/data/phrases.ts`.
- Green means "the train is correct" and nothing else. Placement feedback is hue-free — see
  `roadmap.md` C1 and the signal lamp.
- Keep components dumb — game logic belongs in hooks or utils

---

## Before Every Commit

- `npm run build` must pass
- `npm run lint` must pass — no new warnings

---

## What Is NOT Built Yet

- Multiple languages
- Parent/stats dashboard
- Backend / user accounts
- Level editor
