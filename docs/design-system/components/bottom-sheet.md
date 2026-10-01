# Component: `Bottom Sheet` (+ `Sheet Item`)

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (tier 4, Owner review)
- Direction/token approval: `APPROVED`.
  - The Owner compared two options on exploration board 05 (`exploration.pen` › **05 — Bottom sheet study**). The pick is option A *Docked* with option B's header ("A is better, but I like header of B").
  - 25 `sheet.*` tokens were approved on 2026-09-26. There are no new primitives or semantics.
- Pencil library: `design-system.lib.pen` › **C32 — Bottom sheet** (`m6YUOs`)
- Evidence: none in the legacy frames. It pairs with the Modal (C31).

## Purpose

The mobile counterpart of the Modal: a sheet docked to the bottom edge over `overlay.scrim`. Use it below 768 px, in the client gallery and on any Owner screen shown on a phone. On desktop the same task uses the Modal.

## Components

| Component | ID | Structure |
|---|---|---|
| `_SheetItem/Base` (private) | `hHxAm` | 375 × 52; padding-x `sheet.item.padding-x` (20); gap `sheet.item.gap` (10, `space.2-5`; SP6 amended 2026-09-26); top border `sheet.item.border`. Icon `MLkPM` (lucide 20, `sheet.item.icon`); Label `elAPX` (subtitle 16 / 500, `sheet.item.text`, fill). Count `bZ2Ux`: a Count Badge, boolean (off). Selected mark `W5pLC`: decorative trailing checkmark, boolean (off). |
| `Sheet Item/Default` | `FRtU1` | |
| `Sheet Item/Destructive` | `FAObX` | Icon `trash-2` and label in `sheet.item.text-destructive` |
| `Sheet Item/Selected` | `E7RrIj` | Current selection; Count off and trailing checkmark on. Used by the workspace switcher on mobile. |
| `Bottom Sheet/Actions` | `U0wHw` | Grabber → Header, centred: Title `bEyU3` (body 14 / 600) and Meta `GyfP0` (label 12, `sheet.meta`, boolean) → **Items** slot `CLpYz` (Sheet Items) → Safe area |
| `Bottom Sheet/Menu` | `oWJw2` | The Bottom Nav *Lainnya* menu. It **inherits the desktop Sidebar**: Grabber → Header `VsQBD` with the **Sidebar logo** (`o5FI3`: aperture mark + *shutrly* wordmark, title 18 / 700) and a round Close `mt8sl` (as in the Form sheet; the desktop collapse button has no mobile meaning) → **Items** slot `MfblZ`, which starts with the Workspace switcher (`yurxA` › `Gf9J9`, the Sidebar's, inset 20, with a separator line on top like the Sidebar divider) → Account (Avatar, name, email, Log out as Icon Button Ghost MD `JVVIR`) → Safe area. The Items slot holds Sheet Items and Nav Group Labels: Invoice (count 3) · KATALOG: Layanan, Tim · Template pesan, Sumber foto, Pengaturan. It follows the Sidebar's groups and labels exactly, and adds no labels the Sidebar lacks (Owner 2026-09-26). |
| `Bottom Sheet/Form` | `vSBbR` | Grabber → Header, leading: Title `di5Wv` (title 18 / 700), Description `fmisv` (body-sm, boolean) and Close `P9kIA4` (Icon Button Ghost SM, round, `sheet.close.background`, boolean) → **Body** slot `XCxn4` → Footer (`sheet.footer.background`, top border `sheet.footer.border`, padding 16 / 20) with the **Actions** slot `x5l7Wq` (full-width LG Buttons) → Safe area |

**Shared parts**

- **Container:** `sheet.background`, `sheet.radius` (24) on the top corners only, clipped. The shadow uses `elevation.2` colour and blur, with an upward offset of −8 (literal).
- **Grabber:** 36 × 4 in `sheet.grabber`, 8 from the top.
- **Header:** padding `sheet.header.padding-y/-x` (8 / 20); gap 12; title ↔ description 4; **no divider** (option B).
- **Safe area:** 34 px, showing the device home indicator. In code it is `env(safe-area-inset-bottom)`.
- **Width:** 375 is the design frame. In code the sheet is 100 % of the viewport (max 560 on tablets).
- **Height:** hugs its content up to 90 % of the viewport. Past that the Body scrolls and the header stays fixed.

**Fill slots.** This works on top-level instances only.

- Items: `Replace(<sheet>/CLpYz, {type:"frame", name:"Items", layout:"vertical", width:"fill_container"})`, then insert Sheet Items with `width:"fill_container"`.
- Body: `Replace(<sheet>/XCxn4, {type:"frame", name:"Body", layout:"vertical", width:"fill_container", padding:["$component/sheet/body/padding-y","$component/sheet/body/padding-x"], gap:"$component/sheet/body/gap"})`.
- Actions: `Replace(<sheet>/x5l7Wq, {type:"frame", name:"Actions", layout:"vertical", width:"fill_container", gap:"$component/sheet/body/gap"})`, then insert LG Buttons (`aBT7T`, `c3U6N`, `ZDOwL`) with `width:"fill_container"`.

## Rules

- **Actions sheet:**
  - 2–6 items; the title names the object and the meta gives one line of context.
  - The destructive item goes last and opens a Form-sheet confirm.
- **Form sheet:**
  - One short task: a choice, or 1–3 fields, with one full-width primary.
  - For a destructive confirm, put Danger on top and Batal below, with no Close and no Body.
- Never nest a sheet in a sheet. Long forms get a page.
- Dismiss by dragging down on the grabber, tapping the scrim, or using Close / Batal.

## Accessibility

- `role=dialog` with `aria-modal=true` and `aria-labelledby` = Title. The grabber is decorative (`aria-hidden`), and dragging is never the only way to close.
- Focus moves to the first item or field on open, is trapped, and returns to the trigger on close. The page behind is `inert` and scroll-locked.
- Items are buttons 52 px high (a target of at least 44 × 44). Icons are `aria-hidden`. Destructive items keep their text label, so meaning never relies on colour alone.
- With reduced motion, the sheet fades in instead of sliding.

## Gaps

- The exhibits sit on the Mobile Shell (C33), which added the missing mobile frame from GAP-04.
- Item height, sheet width and the upward shadow offset are literal, because Pencil can't bind size or negative offsets.
- The max-height and scrolling states are documented but not drawn.

## F-17 update — PROMOTED 2026-09-29

Promoted to `design-system.lib.pen` by `/sdv:save-design-system` (F-17, Owner-approved design; rules v3.1). Library: Bottom Sheet/Menu `oWJw2` — `yurxA` (workspace) and `HdCxv` (Invoice) disabled; Sheet Item/Selected `E7RrIj` — label semibold, check `component.sheet.item.check`. Details: [F-17 design.md](../../features/app-shell-revamp/design.md).

- Bottom Sheet/Menu drops the workspace switcher row and Invoice.
- Sheet Item/Selected gets a `semibold` label and a check in a new `component.sheet.item.check` → `action.primary`, to match Menu Item/Selected (DESIGN TOKEN GAP).
- The switcher sheet lists workspaces without icons and ends with a Button Primary LG *Buat workspace*.

## F-17 validation update — PROMOTED 2026-09-29

D-3 (Owner 2026-09-29): the Sheet Item label (`elAPX` on `_SheetItem/Base`) is `font.size.body` 14 medium, matching Sidebar Nav Item labels (was `font.size.subtitle` 16). Selected rows are semibold with the `sheet.item.check` mark.

## Implementation references

- Pencil: `C32 — Bottom sheet` (`m6YUOs`); tokens on board 06 › *Sheet*
- Exploration: `exploration.pen` › 05 (options A, B, and A + B header)
- Related: Modal (C31), Mobile Shell (C33), Radio (C06), Button LG (C01)
- Rules: token-usage.md §2 *Surfaces* (`overlay.scrim`), §5, §6, §8
