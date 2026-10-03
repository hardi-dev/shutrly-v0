#!/bin/bash
# SessionStart (compact): stdout is added to Claude's context after a compaction.
cat <<'MSG'
Context was just compacted, so this session is near its context limit. If the work in progress is unfinished, run `/sdv:handoff wip` now (it reads only git status and git log), then continue the task. If you are between tasks or the work is finished, skip it.
MSG
