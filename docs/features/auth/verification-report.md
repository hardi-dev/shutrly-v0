# Verification Report — F-01 Auth & Account

Date: 2026-09-27 · Verified on `main` at `3c55d0b` · Verdict: **PASS, feature → DONE** (nothing blocks DONE; the follow-ups and ship blockers are listed below)

## Scope

Checked against:
- constitution C-002 to C-004, C-006 to C-009, C-012 and C-103;
- coding rules v2.0;
- BR-AUTH-001 to BR-AUTH-008, BR-WS-003 (hand-off) and BR-SRC-001;
- ADR-001, 002, 003, 008, 009, 010, 011, 012 and 013;
- [spec.md](spec.md), [acceptance-criteria.md](acceptance-criteria.md) (AC-AUTH-001 to 031), [diagrams/](diagrams/), [design.md](design.md) and [technical-design.md](technical-design.md);
- `docs/design-system/token-usage.md` (APPROVED 2026-09-26), so token findings are binding, not advisory.

**Not checked: visual fidelity against the HTML exports.** The Owner said on 2026-09-27 that no fidelity check is needed. D-2 (the automated fidelity test was removed, with 11 known differences of 2–8 %) remains the recorded, Owner-accepted deviation.

## Quality gate (run 2026-09-27)

| Check | Command | Result |
|---|---|---|
| Typecheck | `pnpm typecheck` | PASS |
| Lint (Prettier, ESLint, token drift) | `pnpm lint` | PASS; `tokens.css is up to date (485 tokens)` |
| Unit + DOM tests | `pnpm test` | PASS: 63 files, 210 tests |
| Build | `pnpm build` | PASS; every auth route plus `ƒ Proxy (Middleware)` |
| Integration (shared non-prod Neon) | `pnpm test:integration` | PASS: 7 files, 38 tests |
| E2E (single worker, D-4) | `pnpm e2e` | PASS: 23 tests (21 auth, 2 F-00 smoke) |

## Acceptance criteria

Test titles start with their AC ID. The counts are the test files that reference each AC (unit / integration / E2E).

| AC | Evidence (unit / int / E2E) | Result |
|---|---|---|
| AC-AUTH-001 Register creates one unverified identity | 4 / 2 / 1 (J-01 register → verify → hand-off) | PASS |
| AC-AUTH-002 Registration validated on the server | 9 / 0 / 0: use-case schema re-parse over fakes | PASS |
| AC-AUTH-003 Existing email not revealed | 3 / 1 / 0 | PASS |
| AC-AUTH-004 Verification link verifies and signs in | 3 / 3 / 1 | PASS |
| AC-AUTH-005 Invalid verification link | 4 / 3 / 1 | PASS |
| AC-AUTH-006 Resend verification | 3 / 1 / 0 | PASS |
| AC-AUTH-007 Verified active Owner logs in | 5 / 0 / 0; the login journey is also exercised by E2E 16, 19 and 20 | PASS |
| AC-AUTH-008 One generic credentials error | 4 / 1 / 1 | PASS |
| AC-AUTH-009 Unverified session confined | 6 / 2 / 1 | PASS |
| AC-AUTH-010 Login rate limit | 4 / 1 / 0 (atomic counter, ADR-013) | PASS |
| AC-AUTH-011 Signed-in Owner skips auth pages | 1 / 0 / 1 | PASS |
| AC-AUTH-012 Logout ends the current session | 2 / 0 / 0 | PASS |
| AC-AUTH-013 Non-active Owner blocked at login | 5 / 0 / 0 | PASS |
| AC-AUTH-014 Status enforced on every owner request | 4 / 1 / 0; the cookie cache is disabled (`create-auth.ts:155`) | PASS |
| AC-AUTH-015 Operator status change revokes sessions | 1 / 1 / 0 | PASS |
| AC-AUTH-016 Forgot password never reveals accounts | 4 / 0 / 1 (the unknown email gets the same confirmation) | PASS |
| AC-AUTH-017 Reset revokes all sessions | 2 / 1 / 1 | PASS |
| AC-AUTH-018 Invalid reset link | 3 / 3 / 0 | PASS |
| AC-AUTH-019 Change password requires the current one | 2 / 1 / 1 | PASS |
| AC-AUTH-020 Update display name | 2 / 0 / 1 | PASS |
| AC-AUTH-021 Secrets never logged | 7 / 1 / 0; no `console.*` in `src` outside the redacting logger, and no `process.env` in `src` | PASS |
| AC-AUTH-022 Email failure is recoverable | 5 / 0 / 0 | PASS |
| AC-AUTH-023 Accessible forms | 7 / 0 / 1; axe finds no AA violations on 6 routes × 2 widths; keyboard focus (`u9HFU`) | PASS (gap F-5) |
| AC-AUTH-024 Google sign-up creates a verified account | 2 / 1 / 0 | PASS |
| AC-AUTH-025 Identity scopes only | 0 / 1 / 0: the generated authorization URL requests exactly `openid email profile`, and no provider tokens are stored | PASS (smoke test S-2) |
| AC-AUTH-026 Google links to a verified account | 2 / 1 / 0 | PASS |
| AC-AUTH-027 Takeover guard on an unverified account | 2 / 2 / 0 | PASS |
| AC-AUTH-028 Unverified Google email refused | 4 / 1 / 0 | PASS |
| AC-AUTH-029 Cancelled or invalid callback | 3 / 1 / 1 | PASS |
| AC-AUTH-030 Google-only account has no password paths | 3 / 0 / 0 | PASS |
| AC-AUTH-031 Non-active Owner blocked via Google | 0 / 1 / 0 | PASS |

## Business rules and constitution

| Item | Evidence | Result |
|---|---|---|
| BR-AUTH-002: single identity | `lower(email)` unique index; no domain user table | PASS |
| BR-AUTH-005: status on every request | `requireOwner` in pages, actions and use cases; the Proxy only checks that a cookie exists | PASS |
| BR-AUTH-006/007: Google | `trustedProviders: []`, the guard runs in `mapProfileToUser`, and the takeover is one transaction (ADR-012 as amended) | PASS |
| BR-SRC-001: no Drive scopes | AC-025; no Drive or `googleapis` code in `src` | PASS |
| C-004: server authority | Every action re-parses its input with the use-case schema; redirect targets are constants | PASS |
| C-103: client secrets never logged | `authLog` allow-list plus logger redaction | PASS |
| UML (`state.md`, `sequence/`) | `accessDecision` checks status first, then verification, as the request-access state model does; flows match the sequence files | PASS (advisory A-1) |

## Design system (token-usage.md, APPROVED)

| Rule | Check | Result |
|---|---|---|
| G2: no primitives | No `primitive`/`alpha` variables in the auth UI, Alert, primitives, `(auth)` or `(owner)` | PASS |
| G4: no hard-coded values | No hex, `rgb()` or arbitrary `[…px]` in the auth UI; the one arbitrary grid template uses `var(--size-auth-panel)` | PASS |
| G3: component tokens in components | Alert, Button and Input bind `--component-*`; screens bind semantic, space and size tokens | PASS |
| G5: fg/bg pairing | Only paired semantic and component tokens are used (e.g. `text-inverse` only on the inverse editorial panel); axe contrast checks pass | PASS |
| Every token used is defined | All 84 CSS variables used resolve in `src/ui/theme/tokens.css` | PASS |
| SP7: no margins | One `mx-auto` in `account-sections.tsx:22`, which centres the 720 column (centered narrow layout). It's centring, not spacing. | PASS (advisory A-2) |
| **G8: pipeline** | T1–T4 (`space.16`, `size.auth-panel`, `size.auth-form`, `font.size.hero`) are in `tokens.json` and `tokens.css`, but **not in `pencil-mapping.json`**: `validate_tokens.py --mapping` reports 4 unmapped tokens and a count of 481 ≠ 485 | **FAIL, drift F-6** |

## Deviations

| ID | Deviation | Status |
|---|---|---|
| D-2 | The automated fidelity E2E was removed. 11 export/route pairs differ by 2–8 % | Accepted by the Owner (2026-09-27); not re-checked here |
| D-3 | 22 `// not in Pencil` strings plus the auth email templates are awaiting Owner copy review | Open; must be done before ship (S-3) |
| D-4 | Playwright runs on one worker because scrypt is CPU-bound | Accepted |
| D-5 (new) | Three mobile exports listed in design.md are missing: `login-invalid-n4KUP`, `login-processing-QIIvK`, `login-focus-g0ghE` | Non-blocking (F-7) |
| D-6 (new) | The iteration checkboxes for 1–7 in technical-design.md were unticked although the work is implemented | Fixed in this verification |

## Follow-ups (non-blocking for DONE)

- **F-5:** add axe scans for `/verify`, `/verify?state=invalid`, `/reset-password?state=invalid` and `/profile`. DOM tests already cover their labels and error linkage, so AC-023 holds.
- **F-6:** sync T1–T4 to Pencil: run `/sdv:sync-pencil`, then `/sdv:verify-design-system`. That report is already stale.
- **F-7:** the Owner exports the three missing mobile states, or removes them from design.md.
- **F-8:** the empty, untracked `tests/e2e/auth/auth-fidelity.spec.ts-snapshots/` folder was removed during this verification.
- **A-1 (advisory):** `state.md` doesn't draw the operator suspending an unverified account (`ActiveUnverified → Suspended/Disabled`). The code allows it, as BR-AUTH-005 says.
- **A-2 (advisory):** the Owner may want `mx-auto` for centring named explicitly as an exception in SP7.

## Ship blockers (for `/sdv:ship`, not for DONE)

- **S-1:** CI (GitHub Actions) and Cloudflare deploy don't exist yet (feature map, F-00 scope).
- **S-2:** a manual smoke test with the real Google client on staging: the consent screen shows only name, email and profile, and the callback succeeds.
- **S-3:** the Owner reviews the D-3 copy.
- **S-4 (R-5):** replace the Unsplash placeholder photos in the editorial mosaic with licensed photos.
- **S-5 (R-1):** schedule `auth:purge-rate-limits`.
- ~~**S-6:** J-01 can't complete end-to-end until F-02 exists.~~ **Resolved 2026-09-28:** F-02 implements `WorkspaceDestinationPort`, `/onboarding/workspace` and the `/profile` App Shell. Dedicated workspace E2E covers the continuation.
