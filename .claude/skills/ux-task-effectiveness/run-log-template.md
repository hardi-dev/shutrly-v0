# Run log: <goal name>, attempt <n>

Fill this in before the first browser action of the attempt. Update it during the run. Do not estimate times or step counts after the attempt ends.

## Header (set before the run)

- **Goal / task:** <one sentence from the intake>
- **Success criterion:** <observable end state from the intake>
- **Optimal path:** <ordered steps from the intake>
- **Persona:** <from the intake>
- **Environment and URL:** <local or staging, host name>
- **Starting state:** <what data exists before attempt 1, and any leftovers from earlier attempts>
- **Intake recorded at:** <UTC timestamp, from `date -u +%FT%TZ`>

## Attempt record

- **attempt:** <n>
- **start_ts:** <UTC, from `date -u +%FT%TZ` via Bash, before the first browser action>
- **end_ts:** <UTC, same method, after the last browser action>
- **end_state:** success | failure | abandoned | blocked
- **docs_read_during_run:** none | <list each file read after the intake, and mark the attempt invalid>
- **attempt_valid:** yes | no (no if docs_read_during_run is not none, or if the starting state changed in a way not recorded above)

## Steps

One line per browser action that changed state or revealed a control. Reads do not count.

| n | screen | action | result |
|---|---|---|---|
| 1 | | | |

- **steps_total:** <count of rows above>
- **optimal_steps:** <from the header>

## Errors and anomalies

| time (UTC) | screen | what was seen | recovered? |
|---|---|---|---|

Include server errors, UI errors, and anything that needed a retry.

## Outcome

- **outcome_evidence:** <the screen text or state that proves the end state, or the blocker>
