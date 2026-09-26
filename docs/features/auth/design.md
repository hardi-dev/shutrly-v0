# F-01 Auth — Visual design

Status: EXPLORING (2026-09-26). Pencil source: [auth.pen](auth.pen). The Owner chose a split layout and English as the primary UI language. All auth right panels are intentionally empty and dark while their imagery is reconsidered.

## Direction

- Desktop: a quiet form panel beside a dark right panel. The form remains the sole task focus.
- Mobile: one column with the editorial panel omitted. Every desktop state has a mobile counterpart.
- Owner profile: use the approved App Shell and form components. Profile and Password sections are centered as one 720-wide column inside Page Content, following the approved [Centered narrow content layout](../../design-system/layouts/centered-narrow-content.md).
- Reuse the linked Studio Lime library components and semantic tokens. The new `size.content-narrow` token defines only the layout container width; the controls inside it are unchanged.

All auth right panels are deliberately blank. The Owner rejected the photo compositions and will explore this area later. References reviewed during this exploration:

- [KROMA — photography studio hero](https://dribbble.com/shots/27029340-KROMA-Premium-Photography-Studio-Website-UI-Hero): layered photography and editorial composition.
- [Photographer About Section](https://dribbble.com/shots/27277121-Photographer-About-Section-Editorial-Portfolio-Layout): strong typographic hierarchy and a portrait-led spread.
- [Photography Portfolio Website Design](https://dribbble.com/shots/27697249-Photography-Portfolio-Website-Design): cinematic imagery and structured contrast.

## Screen and state map

The canvas places each 1440 px desktop frame immediately left of its 390 px mobile frame. Two pairs sit on each row with 80 px within a pair and 160 px between pairs. Row starts are 1060 px apart, leaving at least 100 px below the taller profile frames.

| State | Desktop | Mobile | Notes |
|---|---|---|---|
| Login | `amp4Y` | `IOC5i` | Blank dark desktop right panel |
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

- English is primary for these auth screens. Localisation fallback and workspace language policy in `docs/coding-rules.md` need reconciliation before implementation.
- Password and verification rules remain in [spec.md](spec.md) and [acceptance-criteria.md](acceptance-criteria.md). The visual design does not alter the server-authoritative flows.
- Generic registration, recovery, and login errors avoid revealing whether an account exists.
- The editorial panel is visual context only; it must not contain auth controls or required instructions.

## Review items

1. Explore the auth right panels again before applying any imagery to the desktop auth screens.
2. Resolve the design-system loading-state gap and confirm final copy before implementation.

## Verification notice exploration

The selected verification instruction panel (`OIDUp`) was duplicated into four isolated, provisional component studies on the auth canvas. They are not reusable library components and do not replace the notice in any auth screen.

| Study | Pencil node | Treatment |
|---|---|---|
| A · current | `oFKrs` | Original vertical icon and guidance |
| B · compact | `q7q2D` | Icon and guidance in a compact row |
| C · accent rail | `U9O7VU` | Side accent and short heading |
| D · quiet outline | `dKiOc` | Neutral outline for lower emphasis |

Choose a direction before adapting it to other notice states or promoting a reusable component to the design library.

The former library `Toast/Info` was tested as two provisional linked instances: with its close control (`NtgVc`) and with the `Close align` layer disabled (`wRfLD`). The Owner then directed the library component to become [Alert](../../design-system/components/alert.md), with persistent inline behavior and Close off by default. The library rename is saved; replacing the verification instruction panels on desktop (`OIDUp`) and mobile (`JYf3F`) with linked `Alert/Info` instances is the next design step.
