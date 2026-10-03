---
description: Write or refresh docs/HANDOFF.md at the end of a session, within a size budget
argument-hint: "[anything the next session must know]"
model: claude-sonnet-5-5
effort: medium
---

Use the `spec-driven-vibe-coding` skill and run its **handoff** workflow. Extra notes from the user: **$ARGUMENTS**

`docs/HANDOFF.md` is read at the start of every session, so it must stay small: **at most 12 KB and one current handoff**. It points to the artifacts; it never restates them.

1. Gather facts, do not guess: `git status`, `git log` since the previous handoff, the current branch, open PR if any, and the feature status in `docs/product/feature-map.md`. Read the existing `HANDOFF.md` and `docs/HANDOFF-archive.md` heading list only.
2. Move the old **Current handoff** section to the top of `docs/HANDOFF-archive.md` as a summary of at most 8 lines: date, feature, outcome, and links to its artifacts. Do not paste it whole.
3. Write the new **Current handoff — <feature> <status> (<date>)** in `HANDOFF.md`, at most 40 lines, with only these parts:
   - **State:** feature, status, branch, PR, whether anything is unpushed or uncommitted.
   - **Done this session:** what was built or decided, one line each, linking the spec, plan or record.
   - **Checks:** which gates ran and their results, plus what was not run.
   - **Owner actions:** what only the Owner can do or decide, one line each.
   - **Open items:** deferred work and known failures, with where each is tracked.
   - **Next:** the exact next command (`/sdv:...`) and why.
4. Keep the durable sections current instead of adding new ones: **Key decisions (Owner)**, **Open gaps**, **Working notes / gotchas**. Add a line only for a decision, gap or gotcha from this session. A decision that changes a business rule, scope or the stack belongs in its owning document (`docs/domain/`, `docs/product/`, `docs/architecture/`): put it there first and link it.
5. Never put in the handoff: code, diffs, test output, restated acceptance criteria, or anything the git log or the feature folder already says. Link instead.
6. Check the size (`wc -c docs/HANDOFF.md`). If it is over 12 KB, move the oldest durable-section entries to the archive until it fits, and say so.
7. Update the `Last updated` and `Branch` lines. Do not commit; show the diff summary and let the Owner commit.

Finish with the completion report: sections changed, final size, what moved to the archive, and the next recommended command.
