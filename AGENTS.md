# train-game – AI Agent Instructions

Main source of truth for all AI coding agents working on this repository.

Kids educational train-building game for a 5-year-old. Fully client-side, no backend.

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
| Level | Numbers | Cargo |
|---|---|---|
| ⭐ 1 | 1–3 | Coal, Sand, Milk, Apples |
| ⭐⭐ 2 | 1–5 | All cargo |
| ⭐⭐⭐ 3 | 1–10 | All cargo including people |

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
- Keep components dumb — game logic belongs in hooks or utils

---

## Before Every Commit

- `npm run build` must pass
- `npm run lint` must pass — no new warnings

---

## What Is NOT Built Yet

- Sound effects
- Multiple languages
- Parent/stats dashboard
- Backend / user accounts
- Level editor
