---
name: ux-task-effectiveness
description: Use when you need to measure how effectively a user interface helps people complete a task or reach a goal. Works from recorded usability sessions, product analytics events, or a walkthrough where an agent acts as a first-time user in the app through the harness's built-in browser. Before a walkthrough, it asks which task to test, offering candidates drawn from the project's docs. Produces task success, time on task, efficiency, error recovery, step drop-off, and evidence-linked findings ranked by impact on the goal. Not for visual styling review; use a heuristic UI review for that.
---

# UX Task Effectiveness

Measure whether a flow gets people to a goal, where it fails, and how much each failure costs. The skill reports numbers with their evidence and sample size. It does not give a single "UX score".

## Core rules

1. **Define the goal before looking at data or running anything.** Write the goal, the success criterion (an observable end state, not a feeling), the optimal path, and the persona. Changing these after seeing results is not allowed. Record any change as a documented amendment.
1a. **Ask for choices, not for free-form input.** The user should not have to write the goal, criterion, or path from scratch. Draft them from the project's docs, then ask the user to pick or confirm (see Intake).
1b. **Walkthrough persona is a new user.** The agent knows only what the app shows on screen and the task it was given. It must not read the codebase, design files, or docs while acting. Docs are used only during intake, before the run starts.
1c. **Use the harness's built-in browser for walkthroughs.** Use the built-in browser tools (`mcp__Claude_Browser__*`), not a separate browser tool or a third-party extension.
2. **Every number has an evidence link.** Each metric and finding cites its source: session ID, event, step number, screenshot, element, or network log. Anything without a source is labelled as an assumption.
3. **Separate observed from predicted.** Session data and analytics are *observed*. A walkthrough by an agent or reviewer is *predicted*. Never present a predicted result as observed.
4. **Report sample size with every rate.** Show `k/n` next to each percentage. Show a 95% Wilson interval when n ≥ 5. For n < 5, show counts only.
5. **Use medians for time.** Time on task is skewed. Report the median and the IQR of successful attempts. Report failed attempts separately.
6. **No composite score.** Do not combine metrics into one number. Rank findings by impact on the goal instead.
7. **Do not complete irreversible actions.** During a walkthrough, do not send messages, pay, publish, delete, or submit real forms. Use test data on local or staging hosts. Ask before any action that changes shared state.
8. **Do not include personal data.** Redact names, phone numbers, emails, and addresses from quotes and screenshots in the report.

## Inputs

| Input | Required | Notes |
|---|---|---|
| Goal statement | yes | One sentence, from the user's point of view. Drafted from docs, then confirmed. |
| Success criterion | yes | Observable end state. Drafted from docs, then confirmed. |
| Optimal path | yes | Ordered steps with expected screens. Drafted from docs (for example the journey steps), then confirmed. |
| Mode | yes | `sessions`, `analytics`, or `walkthrough`. Chosen by the user from the data they have. |
| Data | depends on mode | Session notes, event export (CSV/JSON), or app URL plus test account. |
| Questionnaire data | optional | SEQ per task (1–7) and SUS (10 items). |

If a required input is missing and the docs do not cover it, ask one question for that input only. Do not infer a success criterion from the UI.

## Intake (before any walkthrough)

Run this intake before the first browser action. It is required for `walkthrough` and recommended for the other modes.

1. **Find task candidates in the docs.** Look for user journeys, feature acceptance criteria, and goals. Common locations: `docs/product/user-journeys.md`, `docs/features/*/acceptance-criteria.md`, and `docs/product/scope.md`. Each candidate becomes one option: a goal, its success criterion, and its optimal path, all taken from the doc.
2. **Ask which task to test.** Offer 2–4 candidates in one question, with the recommended one first and a short description of each. Include an "other" option. Example candidates from this project's docs: "J-04 Proofing and selection (client picks photos)", "J-02 Catalog setup", "J-03 Booking a project".
3. **Confirm the details.** After the task is chosen, show the goal, success criterion, optimal path, and persona as a short list. Ask the user to confirm or adjust. Keep it to one question with a yes/adjust choice.
4. **Ask about the test setup.** Ask only what the docs do not answer: which environment to use (local or staging), which test account or role to start from, and whether the session may create test data. Offer the recommended default for each.
5. **Ask about the persona.** Offer the persona from the docs (for example Owner, Client) and whether the agent should play a new user with no prior knowledge of the app. The default is a first-time user.
6. **Write the intake to the report.** Record the answers and the date before starting. These cannot change during the run.

Ask these questions with the question tool available in the harness. If the question tool is unavailable, ask in plain text with numbered options and wait for the answer.

## Modes

### `sessions` (moderated or unmoderated usability tests)

For each attempt, record one row:

`attempt_id, participant, task, outcome (success | failure | abandoned), start_ts, end_ts, steps_taken, errors, error_recovered, hints_used, notes`

- **Outcome:** `success` only if the success criterion is met without facilitator help. `abandoned` means the participant gave up. `failure` means the participant finished with the wrong end state.
- **Errors:** an error is any action that does not move toward the goal (wrong field, wrong screen, validation failure, dead click). Count each occurrence.
- **Hints:** count every facilitator intervention and every help-text or tooltip view the participant triggers.

### `analytics` (event data from the product)

Input needs a user or session ID, timestamps, and named events for each step on the optimal path. If events are missing for a step, report the gap instead of guessing.

- Attempt = one session that starts the goal's first event.
- Success = the success event fires within the session.
- Time on task = success event minus start event.
- Drop-off = sessions that reached step *i* but not step *i+1*.

Analytics shows *what* happens, not *why*. Pair each drop-off with a hypothesis, and label it as a hypothesis.

### `walkthrough` (agent acts as a new user, through the built-in browser)

Use this when no session data exists. Results are **predicted**, not observed. Run the Intake first.

**Setup**
1. Open the app in the harness's built-in browser (`mcp__Claude_Browser__preview_start` with the URL, or `navigate`). Use a local or staging host with test data only.
2. Give the agent the task in the words a user would see, for example "Create a project for a new client and send the gallery link." Do not give it the optimal path, the success criterion, or the docs.
3. Start from the state the intake chose: empty, or with the seed data the docs name.

**Acting as a new user**
4. Act only on what the screen shows. Read the page with the built-in browser's page-reading tool, then choose the next action from the visible labels, buttons, and fields. Do not guess hidden routes or URLs.
5. Think aloud at each step in one line: what the user expects to see next, what they will click, and why.
6. If the user would ask for help, record the moment as a hint. Do not open help pages or docs to solve it. Note whether the app offers help on that screen.
7. Record a dead end when no visible action moves toward the goal within two attempts. Then stop the attempt and mark it as failed or abandoned, following the rules in `sessions`.

**Recording**
8. At each step, take a page read and a screenshot. Record: the screen name, the candidate actions the agent saw, the action taken, and whether the next screen matches the optimal path (the path is used for scoring only, never shown to the agent).
9. Judge each step on three questions:
   - **Visibility:** is the next action visible without searching?
   - **Labelling:** does the label say what will happen?
   - **Feedback:** does the system confirm the result?
10. Repeat for each attempt the intake set (for example 3 attempts, or one attempt per persona). Keep attempts independent: reset to the starting state between them. If a reset is not possible, record the leftover data in the report and name every attempt that started from a changed state.
11. **Run log (required). Copy `run-log-template.md` to a new file for each attempt, fill the header before the first browser action, and update the file during the run.**
    - `start_ts` and `end_ts` come from `date -u +%FT%TZ` run through Bash, not from memory.
    - `steps` has one row per browser action that changed state or revealed a control. Reads do not count.
    - `docs_read_during_run` must be `none`. If anything was read from docs, code, or design files after the intake, set `attempt_valid: no` and re-run the attempt.
    - `errors and anomalies` lists every server or UI error with its time and whether it was recovered.
    - An attempt without a run log is invalid and must not be reported as a result.
    The report uses these values directly. Do not estimate times or step counts after the fact.

**Guardrails**
- Stop before any action that is irreversible or sends something outside the app: sending WhatsApp messages, real payments, publishing to real clients, deleting data, or submitting forms with real data. Use test data, and ask the user before going past such a step.
- If the built-in browser cannot reach the host, or a login is required that the intake did not cover, stop and report the blocker. Do not work around it.

Walkthrough findings must be confirmed with at least one real user session before they are rated above *major*.

## Metrics

Let `N` be the number of attempts, `S` the successful attempts, `F` the failures, `A` the abandoned attempts.

| Metric | Formula | Notes |
|---|---|---|
| Task success rate | `S / N` | Report `S/N` and the 95% Wilson interval (n ≥ 5). |
| Time on task | median of `end_ts − start_ts` over `S` | Also report IQR. Failures are reported separately, never mixed in. |
| Efficiency ratio | `steps_taken / optimal_steps`, median over `S` | 1.0 means the optimal path was followed. Above 1.5 is worth a finding. |
| Error rate | total errors / N | Also report errors per successful attempt. |
| Error recovery rate | recovered errors / total errors | "Recovered" means the participant reached the goal after the error without help. |
| Hint dependence | attempts with ≥1 hint / N | High values mean the flow is not self-explanatory. |
| Abandonment rate | `A / N` | Track the step where abandonment happened. |
| Step drop-off | `1 − reached(i+1)/reached(i)` for each step *i* | Shows the funnel. The largest drop is the first candidate for a finding. |
| SEQ | mean of single-ease-question scores (1–7) per task | Report n and the spread, not only the mean. |
| SUS | per respondent: odd items `score − 1`, even items `5 − score`, sum × 2.5 (range 0–100) | Report the mean and n. SUS is a whole-product measure, not per task. |

Wilson interval for a proportion `p = S/N` at z = 1.96:

```
center = (p + z²/(2N)) / (1 + z²/N)
half   = z · sqrt(p(1−p)/N + z²/(4N²)) / (1 + z²/N)
interval = [center − half, center + half]
```

Always compute with a script or tool. Do not estimate by hand.

## Findings

Each finding has this shape:

- **ID** (`F-01`, `F-02`, …)
- **Step** (step number and screen name from the optimal path)
- **What happened** (observed or predicted, with evidence link)
- **Heuristic** (Nielsen's 10 heuristics, one or two)
- **Effect on goal** (which metric it moves: success, time, efficiency, drop-off)
- **Severity**, from the matrix below
- **Recommendation** (one concrete change, plus how to check it)

### Severity matrix

Severity combines impact on the goal and frequency.

| | Affects ≥ 50% of attempts | Affects 20–49% | Affects < 20% |
|---|---|---|---|
| **Blocks goal completion** | Blocker | Blocker | Major |
| **Causes error or wrong outcome** | Major | Major | Minor |
| **Adds time or steps** | Major | Minor | Minor |
| **Cosmetic or wording only** | Minor | Minor | Cosmetic |

Walkthrough (predicted) findings are capped at *major* until a real session confirms them.

### Ranking

Order findings by `severity`, then by the drop-off or error count they explain. Put the first blocker at the top of the report.

## Output

Write the report in the language the user uses. Use this structure:

```markdown
# UX task effectiveness: <goal>

**Mode:** sessions | analytics | walkthrough (observed | predicted)
**Data:** <source, date range, n>
**Goal and success criterion:** <as defined before analysis>

## Summary
| Metric | Value | n | Notes |
|---|---|---|---|
| Task success | k/N (x%, CI a–b) | N | |
| Median time (success) | mm:ss (IQR a–b) | S | |
| Efficiency ratio | x.x | S | |
| Error rate | x.x per attempt | N | |
| Abandonment | k/N | N | at step <n> most often |

## Step funnel
| Step | Screen | Reached | Completed | Drop-off |
|---|---|---|---|---|

## Findings
| ID | Step | Heuristic | Effect | Severity | Evidence |
|---|---|---|---|---|---|

### F-01 <title>
- What happened:
- Evidence:
- Recommendation:
- How to verify:

## Limitations
- Sample size and who the participants were
- Predicted vs observed claims
- Anything not measured

## Appendix
- Raw attempt table (redacted)
- Calculation notes
```

## Quality checks before reporting

- [ ] Goal, success criterion, and optimal path were recorded before analysis, with the date.
- [ ] Every metric shows its numerator, denominator, and n.
- [ ] Time metrics use medians of successful attempts only.
- [ ] Every finding has an evidence link and is labelled observed or predicted.
- [ ] Walkthrough findings above *major* are confirmed by at least one real session, or are marked unconfirmed.
- [ ] No composite score appears anywhere.
- [ ] Personal data is redacted.
- [ ] Recommendations are concrete and each has a verification step.

## Validation of the skill itself

Before trusting the skill on a real project, test it on data with known answers:

1. Create a synthetic dataset of 10 attempts with known success count, times, and errors. Check that the metrics match the hand calculation.
2. Run `walkthrough` mode on a flow where a known dead end exists. Check that the dead end is found.
3. Run `analytics` mode on a funnel with a known drop-off step. Check that the step is identified.

## Differences from the public references

This skill builds on two public skills, `usability-tester` (oakoss/agent-skills) and `usability-test-plan` (Owl-Listener/designer-skills). Changes:

- Metric formulas, sample-size rules, and intervals are defined here. The references list metrics without formulas.
- Adds analytics and walkthrough modes, with the observed/predicted split.
- Walkthrough runs as a new user through the harness's built-in browser. The intake drafts tasks from the project's docs, so the user picks options instead of writing fields.
- Replaces a severity list with a matrix based on impact and frequency.
- Requires evidence links and a verification step for each recommendation.
- Adds guardrails for irreversible actions and personal data.
