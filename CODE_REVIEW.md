# AI Agent Code Review Guidelines

> For general agent instructions, see [AGENTS.md](AGENTS.md).

## Role

Act as a Senior Frontend Engineer reviewing code for the **train-game** repository.
Keep feedback direct, constructive, and proportionate — this is a toy project, not enterprise software.

## Tech Stack

- **Language:** TypeScript (strict, no `any`)
- **Framework:** React (functional components + hooks), Vite
- **Styling:** Tailwind CSS only — no shadcn/ui, no external component libraries
- **Hosting:** Vercel (static)

## Code Review Focus Areas

1. **Type Safety:** No `any`. Props, state, and function signatures must be typed. Types go in `/src/types/`.
2. **Game Data:** Locomotives, wagons, cargo, and levels must live in `/src/data/` — never hardcoded in components.
3. **Validation Logic:** Cargo→wagon mapping must be enforced consistently. Changes here affect all levels — check edge cases.
4. **Child UX:** No text labels anywhere in the UI. Tap targets minimum 64px. If a change adds readable text to the game screen, flag it.
5. **Performance:** No unnecessary re-renders. Don't filter/sort inside render functions.
6. **localStorage:** Only `trainGameProgress.v2` key. No sensitive data, no bloat.

## Conventions to Enforce

- Functional components only, no class components
- `camelCase` variables/functions, `PascalCase` types/components
- Game logic in hooks (`/src/hooks/`) or utils (`/src/utils/`), not inside components
- `npm run build` and `npm run lint` must pass

## What to Ignore

- **Do NOT** comment on formatting or indentation (ESLint/Prettier handles this)
- **Do NOT** review auto-generated files (`dist/`, `node_modules/`)
- **Do NOT** suggest a different test framework or config — vitest is already wired up (`npm test`), pure functions in `/src/utils/` and `/src/hooks/` get unit tests there
- **Do NOT** suggest backend, auth, or analytics — out of scope

## Feedback Format

Be direct. No fluffy language. Always include a code snippet when suggesting a fix.

Categorize feedback:
- 🚨 **Critical:** Bugs, broken game logic, or child UX violations (text in UI, tiny tap targets)
- ⚠️ **Warning:** Type unsafety, hardcoded game content in components, silent error handling
- 💡 **Suggestion:** Minor improvements, readability, or missed reuse of existing utils
