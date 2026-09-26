# Component: `Toast`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (Owner: "approved" — review of C02–C26). Previously `PROPOSED` (tier 2, 2026-09-26)
- Direction/token approval: `APPROVED`. Style **B** is the Owner's decision. `toast.<tone>.action` was added on 2026-09-26. SP6 was amended the same day so `toast.text-gap` (2) is a sanctioned half-step.
- Pencil library: `design-system.lib.pen` › **C24 — Toast** (`NFr0T`)
- Evidence: `exploration.pen` › Feedback — Toast study › Variant B (light and dark)

## Purpose

Short, non-blocking feedback after an action, or a background event.

## Anatomy

| # | Part | Layer name | Description |
|---|---|---|---|
| 1 | Container | root | 360 wide; fill `toast.<tone>.background`; 1 px `toast.<tone>.border`; `toast.radius`; `elevation.1` shadow; padding 12/12 (legacy 12/14 → 12); gap 12; top-aligned. |
| 2 | Icon | `Icon` (`k7lq2`) | 16 px, `toast.<tone>.icon`. Fixed per tone: circle-check, info, triangle-alert, circle-alert, sparkles. |
| 3 | Title | `Title` (`m0dqT6`) | body-sm 13/600, `toast.<tone>.title`. |
| 4 | Body | `Body` (`fhch4`) | label 12/400, `toast.body`. On by default. |
| 5 | Action | `Action` (`M54Ca`) | label 12/600, `toast.<tone>.action`. Off by default. |
| 6 | Close | `Close` (`F4Fv5K`) | Nested **Icon Button/Ghost/SM/Default** with the `x` icon (32 px). |

Title ↔ body ↔ action gap is `toast.text-gap` (2), per SP6 as amended on 2026-09-26.

## Variants

The private base is `_Toast/Base` (`B50hT`).

| Tone | ID | Use |
|---|---|---|
| Success | `E4PkTw` | Completed: *Pembayaran dicatat* |
| Info | `S5bhVn` | Background event: *Sinkron galeri berjalan* |
| Warning | `pt1q7` | Needs attention soon: *Kuota pilihan hampir penuh* |
| Danger | `F3GrC5` | Failed or blocked: *Folder Drive tidak dapat diakses* |
| Highlight | `ef21N` | Happening now: *Sesi hari ini dimulai* (`accent.soft`) |

In dark mode, the title and action switch to `text.primary` on the tinted surface; the icon keeps its status colour.

## Content

- The title says what happened, in 6 words or fewer, with no period. The body is one sentence of detail. The action is one verb (*Batalkan*, *Lihat invoice*, *Coba lagi*).
- Success and info dismiss themselves after about 5 s; warning and danger stay until closed.
- Toasts stack at the bottom-right of the app panel, newest on top, gap 12 (`space.3`), with at most 3 visible.

## Accessibility

- Success, info and highlight use `role=status` (polite). Danger and warning use `role=alert` (assertive).
- Close has `aria-label="Tutup"`. Esc dismisses the newest toast. Auto-dismiss pauses on hover or focus.
- The toast is never the only way to reach its action.
- Contrast: the title and action (`status.*.fg`) on the tone's `.bg` are ≥ 4.5 : 1 in light mode; `text.primary` on the dark tint in dark mode.

## Close alignment (resolved 2026-09-26)

The close button (32 px) sits in a `Close align` frame (`IXhZl`) that is 18 px high, the height of the title line (13 × 1.4). The frame centres the button, which overflows it without clipping, so the × lines up with the title's centre. Code: `align-self: start; margin-block: -7px` on the 32 px button (a §4.6 optical exception, approved by the Owner). No new token.

## Implementation references

- Pencil: `C24 — Toast` (`NFr0T`), base `B50hT`
- Rules: token-usage.md G3, SP6 (amended), §2 *Status*, §6, §8
