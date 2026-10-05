@AGENTS.md

# Mistakes to avoid

Add one line here every time Claude gets something wrong that a future session could repeat. Say what to do instead. Remove a line once a hook, test or lint rule enforces it.

- `head` on this machine isn't coreutils; use `sed -n '1,20p'`. Repeated three times in one session (2026-10-05, F-09 R1) even though this line existed: never type `head` or `head -n`, not even in a pipe, and don't rely on the rule being read; check each command for `head` before sending it.
- Don't run the full suite (`pnpm test`, full e2e, full integration) to verify a slice. Run only the related tests (`npx vitest run <paths>`, one integration file, the slice's e2e spec) plus typecheck and lint on what changed; the Owner asked for this (2026-10-05, F-09 R1).
- In a git worktree, a Pen library import can silently point at the main checkout's `design-system.lib.pen`. Right after the Owner imports, check through MCP that `GetVariables()` count and a newest library node match the worktree library. Never remove an import that instances use: Pen re-imports under a new alias (`0`, `b`, `r`…) and every `s:` ref/`$s:` token breaks. To move a consumer to another library, import it alongside, remap refs/tokens to the new alias via MCP (`Replace` per top-level frame), then remove the old import and save (F-09, 2026-10-04).
