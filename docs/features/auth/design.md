# F-01 Auth — Visual design

> Localization amendment (Owner 2026-10-06): [product policy](../../product/localization.md), BR-L10N-* and [ADR-021](../../architecture/decisions/ADR-021-next-intl-bilingual-localization.md) supersede language-only instructions in this document. English is the default; EN/ID switching and complete localized copy are required. Earlier Indonesian labels/defaults remain reference examples, not an approved single-language implementation. Feature business behavior is unchanged. Update reviewed copy and approved Pencil exports before implementation; legacy data and recipient-language policies remain pending.

Status: DESIGNED (Owner approved 2026-09-26). Remaining review items below are follow-ups, not blockers. Pencil source: [auth.pen](auth.pen). The Owner chose a split layout. The frames were drawn in English, but the UI language is **Indonesian** (CONFLICT-1, Owner 2026-09-27), so the frame text is translated before implementation (see *HTML exports for implementation*). Desktop right panels use the chosen editorial panel (see *Editorial panel decision*).

## Direction

- Desktop: a quiet form panel beside the editorial panel (tilted photo mosaic). The form remains the sole task focus.
- Mobile: one column with the editorial panel omitted. Every desktop state has a mobile counterpart.
- Owner profile: use the approved App Shell and form components. Profile and Password sections are centered as one 720-wide column inside Page Content, following the approved [Centered narrow content layout](../../design-system/layouts/centered-narrow-content.md).
- Reuse the linked Studio Lime library components and semantic tokens. The new `size.content-narrow` token defines only the layout container width; the controls inside it are unchanged.

## Screen and state map

The canvas places each 1440 px desktop frame immediately left of its 390 px mobile frame. Two pairs sit on each row with 80 px within a pair and 160 px between pairs. Row starts are 1060 px apart, leaving at least 100 px below the taller profile frames.

| State | Desktop | Mobile | Notes |
|---|---|---|---|
| Login | `amp4Y` | `IOC5i` | Editorial panel on desktop |
| Register | `m3QGM` | `UryLp` | Name, email, password, Google |
| Verification pending | `p3NbDB` | `TXoQI` | Generic confirmation, resend, cooldown |
| Forgot password | `o9WtCo` | `e091S` | Email entry |
| Reset request sent | `DccPx` | `NkvJG` | Same confirmation regardless of account existence |
| Set new password | `RFaNT` | `vHZGg` | New password and confirmation |
| Invalid verification link | `TIvfA` | `ifV1Z` | New verification link action |
| Invalid reset link | `x5ds7` | `Hf3VK` | New reset request action |
| Account unavailable | `kXr5x` | `FFue5` | No Owner data |
| Login invalid credentials | `q8b0R9` | `n4KUP` | Generic error, no account disclosure |
| Register field errors | `hTP6i` | `aIY0r` | Message and icon accompany error colour |
| Login processing | `U9laqq` | `QIIvK` | Disabled action with progress copy; loading component remains a design-system gap |
| Login keyboard focus | `u9HFU` | `g0ghE` | Visible focus ring |
| Profile and password | `t7CXVK` | `vEZsy` | Owner App Shell on desktop, Mobile Shell on phone; email read only |
| Google-only profile | `TInkk` | `Vygzt` | Password section hidden |

## Copy and behavior

- The UI language is Indonesian (CONFLICT-1 resolved 2026-09-27). The implementation's `*.copy.ts` files hold the Indonesian strings, translated from these frames. Update the frame text to match them before exporting.
- Password and verification rules remain in [spec.md](spec.md) and [acceptance-criteria.md](acceptance-criteria.md). The visual design does not alter the server-authoritative flows.
- Generic registration, recovery, and login errors avoid revealing whether an account exists.
- The editorial panel is visual context only; it must not contain auth controls or required instructions.

## Review items

1. Replace the placeholder Unsplash photos in the editorial panel with licensed or commissioned photos.
2. Confirm the Alert copy in the notice table below.
3. Resolve the design-system loading-state gap and confirm final copy before implementation.
4. Translate the frame text to Indonesian, using the strings in plan.md's `*.copy.ts` blocks (approved 2026-09-27). Export every state to HTML when implementation reaches the UI (see below).
5. **Approved (Owner 2026-09-27):** add DESIGN TOKEN GAPs T1–T4 through the design-system pipeline before plan Task 25: `size.auth-panel` 600, `size.auth-form` 420, `font.size.hero` 44 and `space.16` 64. The editorial body text is 15 in `Z5xhk`, but no 15 token exists; the plan uses `font.size.body` (14). Adjust the frame, or add a token (technical-design.md › Risks).
6. Confirm the copy not drawn in Pencil: validation and error messages, processing states, password-visibility labels, profile-save messages, resend confirmation, and auth email templates. These remain listed for Owner review; they are marked `// not in Pencil` in the source.

## Inline notices (Alert)

Every auth notice is a linked library [Alert](../../design-system/components/alert.md) instance (`width: fill_container`, Close off, icon fixed by tone). The hand-built notice panels and the six exploration studies (A–D, Toast with/without close) were removed on 2026-09-26.

| State | Tone | Desktop | Mobile | Title / body |
|---|---|---|---|---|
| Verification pending | Info | `tbePZ` | `neYhl` | Link expires in 24 hours / spam folder |
| Reset request sent | Info | `pxkZH` | `rwp8v` | Link expires in one hour / spam folder |
| Invalid verification link | Danger | `lwMnR` | `SMOip` | Links work only once / single-use reason |
| Invalid reset link | Danger | `yQnyb` | `olTZD` | Links work only once / single-use reason |
| Account unavailable | Danger | `L7qHA` | `C3MNV` | Workspace data is hidden / reason |
| Login invalid credentials | Danger | `DjUek` | `L6IURm` | Generic error, title only (Body off) |

Alert titles do not repeat the screen heading. Actions (resend, request new link, sign out) stay outside the Alert.

## Library link

`auth.pen` links `design-system.lib.pen` (prefix `a:`). The in-file copy of the library still showed the pre-rename state (`Toast/*` names, `component/toast/*` variables, 478 vars) when these instances were placed; instances link by the unchanged IDs, so they resolve to Alert after Pen reloads the library.

## Editorial panel decision (2026-09-26)

**Owner chose R5.1b · Tilted mosaic.** It is a local reusable component in `auth.pen`, **Auth / Editorial panel** (`Z5xhk`, 840 × 900): dark `surface.inverse` panel; square tiles in half-offset columns, the whole mosaic rotated −15° (Owner reference); client photos on the visible tiles, lime `accent.highlight` aperture tiles, neutral icon tiles; bottom scrim with the headline "Every photo you take, exactly where it belongs." Every desktop split screen (13) uses an instance named `Editorial side`; Profile screens use the App Shell and have no editorial panel. Mobile omits it.

Kept for reference (Owner): `M3WMS` R2 · Product showcase, `umFqj` R2.3 · Desktop + client phone, `u6hvV` R5.1b · Tilted mosaic (the source exploration). Rounds 1–4 and the device-mockup row were otherwise deleted; a Gemini device-mockup attempt did not meet expectations.

Open items: photos are Unsplash placeholders (licensed or commissioned photos needed); literal colours in the scrim gradient; the panel is decorative (`aria-hidden`, no auth content), per *Copy and behavior*.

**Implementation (Owner 2026-09-27):** the mosaic, with its scrim but without the headline and body, is exported as an image (`public/auth/editorial/mosaic.webp`, plus `@2x`). The headline and body stay live text in code. The scrim's literal colours therefore never reach the code.

## HTML exports for implementation

Owner request, 2026-09-27: the front end is built from **HTML exports** of these frames, so that it is pixel-perfect. After translating the frame text (review item 4), export each state to `docs/features/auth/exports/<state>-<frameId>.html`:

| Export (desktop · mobile) | State |
|---|---|
| `login-amp4Y` · `login-IOC5i` | Login |
| `login-invalid-q8b0R9` · `login-invalid-n4KUP` | Login invalid credentials |
| `login-processing-U9laqq` · `login-processing-QIIvK` | Login processing |
| `login-focus-u9HFU` · `login-focus-g0ghE` | Login keyboard focus |
| `register-m3QGM` · `register-UryLp` | Register |
| `register-errors-hTP6i` · `register-errors-aIY0r` | Register field errors |
| `verify-pending-p3NbDB` · `verify-pending-TXoQI` | Verification pending |
| `invalid-verify-link-TIvfA` · `invalid-verify-link-ifV1Z` | Invalid verification link |
| `forgot-password-o9WtCo` · `forgot-password-e091S` | Forgot password |
| `reset-sent-DccPx` · `reset-sent-NkvJG` | Reset request sent |
| `reset-password-RFaNT` · `reset-password-vHZGg` | Set new password |
| `invalid-reset-link-x5ds7` · `invalid-reset-link-Hf3VK` | Invalid reset link |
| `account-unavailable-kXr5x` · `account-unavailable-FFue5` | Account unavailable |
| `profile-t7CXVK` · `profile-vEZsy` | Profile and password |
| `profile-google-TInkk` · `profile-google-Vygzt` | Google-only profile |

Also export `public/auth/editorial/mosaic.webp` (and `@2x`) from `Z5xhk`. Each UI task in [plan.md](plan.md) stops until its exports exist, then finishes with a fidelity pass against them. The automated Playwright pixel comparison was removed by Owner decision after the remaining differences were recorded in `technical-design.md`.
