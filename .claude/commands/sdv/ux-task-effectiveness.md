---
description: Measure how effectively a flow helps users complete a goal (task success, time, efficiency, step drop-off) from sessions, analytics events, or a walkthrough
argument-hint: "<goal or flow name> [sessions|analytics|walkthrough]"
model: claude-opus-5-5
effort: high
context: fork
agent: general-purpose
background: false
---

Use the `ux-task-effectiveness` skill in `.claude/skills/ux-task-effectiveness/` and run its workflow for: **$ARGUMENTS**

1. Read `.claude/skills/ux-task-effectiveness/SKILL.md` and follow it. Do the intake first: draft the goal, success criterion, and optimal path from `docs/product/user-journeys.md` and the feature's acceptance criteria, then ask the user to choose.
2. For `walkthrough`, use the built-in browser (`mcp__Claude_Browser__*`) and act as a first-time user. Keep a run log for each attempt from `run-log-template.md`. An attempt without a run log is invalid.
3. For `sessions` and `analytics`, use only the data the user provides. Do not create sessions or events.
4. Write the report to `docs/features/<slug>/ux-task-effectiveness-report.md` if a feature slug is given, otherwise to the chat.
5. Do not change product code. Do not send messages, publish, or submit real data.

Report the metrics with their numerators, denominators, and sample size. Mark walkthrough findings as predicted.
