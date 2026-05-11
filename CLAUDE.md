# Claude Code – Instructions

Read and follow `AGENTS.md` as the main source of truth for this project.

---

## Claude-Specific Workflow

1. **Read `AGENTS.md` first** before making any changes.
2. **Inspect relevant files** before editing — understand existing code, don't assume.
3. **Explain the plan briefly** before making edits when the change is non-trivial.
4. **Keep changes small and focused** — one concern per commit, no unrelated cleanup.
5. **Never push directly to `main`** — always use a feature branch.
6. **After changes**, run `npm run build` and `npm run lint` and confirm they pass.
7. **Summarize** changed files, commands run, any risks, and suggested follow-ups.

---

## Game-Specific Notes

- All game content lives in `/src/data/` — when adding new cargo, wagons, or levels, edit data files only, not components.
- UI must work without any text labels — the child cannot read. Use emojis and numbers only.
- When changing validation logic, always test all 3 levels mentally (edge cases: count=1, count=10, people cargo).
- `localStorage` key: `trainGameProgress` — structure: `{ level: number, correctInLevel: number }`.
