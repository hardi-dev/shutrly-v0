# Review: ux-task-effectiveness

Reference for improving this skill. Each entry says what was seen, what changed, and what is still open.

## 1. Test results so far

| Area | Test | Data | Result | Limit |
|---|---|---|---|---|
| Metric formulas | Hand-computed 10-attempt set | Synthetic | Pass: success 7/10, Wilson 0.3968–0.8922, median 140 s, IQR 115–170, efficiency 1.125, error rate 1.4, recovery 0.5, hint dependence 0.3, abandonment 0.1 | Synthetic only |
| SUS | All-3, best, worst answers | Synthetic | Pass: 50, 100, 0 | Synthetic only |
| Analytics mode | Funnel with known drop at step 3 to 4 | Synthetic event log, 100 sessions | Pass: counts 100/90/80/40/38, largest drop pick_photos to submit_selection = 0.5 | Synthetic only, one funnel |
| Walkthrough mode | J-03, 3 attempts to Dibooking | Real app, localhost | Ran, found real issues | See item 3 below: run logs were not kept properly |
| Walkthrough dead end | Share step after BOOKED needs a gallery | Real app | Found the known dead end | Confirms the dead end, does not test the drop-off formula |
| Sessions mode | Not run | None | Not tested | No real moderated sessions yet |
| Drop-off on real data | Not run | One client session on J-04 | Not tested | One session gives 0% drop everywhere, which says nothing |

## 2. Problems found

1. **Run log was not kept as the skill requires.** Step counts and timings were estimated after the fact. Attempt 1 of the first J-03 run also read docs during the run. Those runs cannot be used as valid evidence for step counts.
2. **Persona was not clean.** Docs and earlier context were visible during the run. Walkthrough findings were not labelled strongly enough as predicted.
3. **Skill had no template.** The run-log rules were in prose, so they were easy to skip.
4. **Drop-off was never tested on real data.** The core question of the skill is still unanswered for a real flow.
5. **Reset between attempts was not possible.** Data from attempt 1 stayed in the database, so later attempts did not start clean. The skill only said to record it.

## 3. Changes made

- Added `run-log-template.md` with a header, attempt record, step table, error table, and outcome.
- Rewrote rule 11 in `SKILL.md` to require the template, Bash timestamps, `docs_read_during_run`, and `attempt_valid`. An attempt without a run log is invalid.
- Added this review file.

## 4. Still open

- **Fix the J-03 record.** The first J-03 run should be marked `attempt_valid: no` (docs were read). The second run has timestamps but no full step log, so its step counts should be marked estimated.
- **Real drop-off test.** Needs more real client sessions on one gallery, or an approved synthetic funnel that is labelled as synthetic in the report.
- **Test sessions mode** on a real moderated session.
- **Test the new run-log template** on the next walkthrough, and confirm that the step table is filled while the run happens.
- **Reset rule.** Decide whether the skill should require a fresh starting state (for example a new workspace) or accept leftover data with a note. Currently it does neither automatically.
- **Unlogged Drive and gallery issues** found while testing J-04 are not part of this skill. They should go to the app's own issue list:
  - The gallery *Buat galeri* dialog stalled about 10 seconds on first click, and the dev server had to be restarted before it worked.
  - The folder linked to a gallery can also be linked to other clients' galleries, and the app only warns about it.
  - The header search still says "Segera hadir".
  - React reports a missing `key` in `DetailCards` on the project page.
