---
description: Write or refresh docs/HANDOFF.md at the end of a session, within a size budget
argument-hint: "[anything the next session must know]"
model: claude-sonnet-5-5
effort: medium
---

Use the `spec-driven-vibe-coding` skill and run its **handoff** workflow. Extra notes from the user: **$ARGUMENTS**

**Quick mode.** If the first word of the notes is `wip` or `quick` (for example `/sdv:handoff wip`), or you are told context or tokens are nearly gone while the work is unfinished, do this instead and nothing else. It must cost almost nothing, so read no docs and skip the archive:

1. Run only `git status --short` and `git log --oneline -5`. Note the branch.
2. Replace the **Current handoff** section of `docs/HANDOFF.md` with `## Current handoff — WIP: <feature> <iteration or task> (<date>)`, at most 15 lines:
   - **Resume at:** the exact next step: iteration or slice, task, file, and what is half done.
   - **Uncommitted:** the files from `git status`, and whether they pass or are known broken.
   - **Last checks:** what you ran last and the result; what has not been run.
   - **Decided but not recorded:** decisions or assumptions made this session that are in no artifact yet, one line each.
   - **Blockers / Owner:** anything waiting on the Owner.
   - **Then:** `/sdv:<command> <slug> <n>` to continue.
3. Leave the previous handoff in place under it with the heading `Previous handoff`; do not move or trim anything. A later full `/sdv:handoff` will tidy it.
4. Do not commit. If the working tree has broken, half-written code, say so in **Uncommitted** rather than committing it. Then tell the user the WIP handoff is written and stop.

A session that starts from a `WIP` handoff resumes at **Resume at**, reads only what that step needs, and replaces the WIP handoff with a normal one when the iteration is done.

Full mode follows. `docs/HANDOFF.md` is read at the start of every session, so it must stay small: **at most 12 KB and one current handoff**. It points to the artifacts; it never restates them.

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
