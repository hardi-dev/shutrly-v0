@AGENTS.md

# Mistakes to avoid

Add one line here every time Claude gets something wrong that a future session could repeat. Say what to do instead. Remove a line once a hook, test or lint rule enforces it.

- `head` on this machine isn't coreutils; use `sed -n '1,20p'`.
- In a git worktree, a Pen library import can silently point at the main checkout's `design-system.lib.pen`. Right after the Owner imports, check through MCP that `GetVariables()` count and a newest library node match the worktree library. Never remove an import that instances use: Pen re-imports under a new alias (`0`, `b`, `r`…) and every `s:` ref/`$s:` token breaks. To move a consumer to another library, import it alongside, remap refs/tokens to the new alias via MCP (`Replace` per top-level frame), then remove the old import and save (F-09, 2026-10-04).
