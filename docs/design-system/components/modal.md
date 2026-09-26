# Component: `Modal`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (tier 4, Owner review)
- Direction/token approval: `APPROVED`. The Owner picked option A, *Sectioned*, from exploration board 04 (`exploration.pen` › **04 — Modal & overlay study**) and approved its tokens on 2026-09-26:
  - new primitives `red.300`, `alpha.neutral-950-a50` and `alpha.black-a60`;
  - new semantics `overlay.scrim` and `status.danger.solid-hover`;
  - 18 `modal.*` tokens;
  - 3 `button.danger.*` tokens.
- Pencil library: `design-system.lib.pen` › **C31 — Modal** (`ukLqT`)
- Evidence: none in the legacy frames. It's built only from existing foundations (`elevation.2` "Dialog/sheet", `opacity.scrim`, `radius.lg`, the spacing scale and Button).

## Purpose

A dialog shown over a scrim. Use it for a focused task that must be finished or cancelled before the page continues: creating or editing something short, or confirming a destructive action. In screens it lives in the App Shell's **Overlay** layer (C30).

## Anatomy (`_Modal/Base` `G9VQuU`, private)

| # | Part | Layer | Tokens / nested |
|---|---|---|---|
| 1 | Container | root | `modal.background`, 1 px `modal.border` (inner), `modal.radius` (16), clipped, shadow `elevation.2` (`elevation.2.color`, offset-y 16, blur 40) |
| 2 | Header | `VpbJF` | Padding `modal.header.padding-y/-x` (20 / 24), gap `modal.header.gap` (12), bottom border `modal.header.border` |
| 3 | Heading | `fOsAM` | Vertical, gap `modal.header.text-gap` (4) |
| 4 | Title | `V8uAA` | title 18 / 700 / −0.4, `modal.title`. Text property. |
| 5 | Description | `PPg3y` | body-sm 13, line height 1.5, `modal.description`. Boolean (on). |
| 6 | Close | `M80T4e` | Icon Button / Ghost / SM (`VA96y`), icon `x`. Boolean (on). |
| 7 | Body | `c5Prsw` (slot) | Padding `modal.body.padding` (24), gap `modal.body.gap` (16). Accepts Text Field, Select, Multi-select, Textarea, Checkbox, Radio, Switch, Table and Toast. |
| 8 | Footer | `Pp1eX` | `modal.footer.background` (`surface.subtle`), top border `modal.footer.border`, padding `modal.footer.padding-y/-x` (16 / 24), right-aligned |
| 9 | Actions | `I7e8yh` (slot) | Gap `modal.footer.gap` (12). Accepts Button Secondary, Primary and Danger. Default: *Batal* + *Simpan*. |

## Variants

| Component | ID | Width | Use |
|---|---|---|---|
| `Modal/SM` | `cdSbf` | 400 | Confirmations |
| `Modal/MD` | `f8ym9` | 560 | Short forms (≤ 5 fields) |
| `Modal/LG` | `yAPhv` | 720 | Read-mostly detail, such as a table |

Widths are literal, because Pencil can't bind width. In code they are max-widths: `min(100% − 32px, 400/560/720px)`.

**Fill (top-level instance only).** Pencil can't fill a slot on an instance that is nested inside another master.

```js
const m = Insert(parent, {type:"ref", ref:"cdSbf", descendants:{V8uAA:{content:"Hapus proyek?"}, PPg3y:{enabled:false}}})
const b = Replace(m+"/c5Prsw", {type:"frame", name:"Body", layout:"vertical", width:"fill_container", padding:"$component/modal/body/padding", gap:"$component/modal/body/gap"})
const a = Replace(m+"/I7e8yh", {type:"frame", name:"Actions", gap:"$component/modal/footer/gap", alignItems:"center"})
Insert(a, {type:"ref", ref:"JmfmZ", descendants:{xnhuK:{content:"Batal"}}})
Insert(a, {type:"ref", ref:"z3mR7", descendants:{xnhuK:{content:"Hapus proyek"}}})
```

**In the App Shell:**
1. Turn the overlay on: `Update(<shell>, {descendants:{fwm7P:{enabled:true}}})`.
2. Fill `<shell>/fwm7P/hnTfu/nRbAO/c5Prsw` and `…/I7e8yh`.
3. To use another size, replace `…/hnTfu/nRbAO` with an SM or LG ref.

The masters never include the scrim; the App Shell Overlay owns it.

## Rules

- One modal at a time. Never open a modal from a modal.
- Actions are right-aligned: Cancel (Secondary) first, then the confirming action. Use at most one Primary **or** one Danger.
- **Confirm** (SM):
  - The title is the question (*Hapus proyek?*). There's no description.
  - The body states the consequence.
  - Danger confirms, and its label repeats the verb.
- **Form** (MD): title + description; fields stack at 16. Longer flows get a page.
- Don't put a Table with row actions, a toast or a menu over the scrim.
- On mobile (the client gallery, GAP-04), use the Bottom Sheet (C32, planned) instead.

## Accessibility

- `role=dialog` with `aria-modal=true`. `aria-labelledby` points to the Title and `aria-describedby` to the Description or the confirm body. Destructive confirms use `role=alertdialog`.
- Focus moves in on open (to the first field, or to Cancel for a destructive confirm) and is trapped inside. On close, focus returns to the trigger.
- Esc and Close (`aria-label` *Tutup*) cancel. Clicking the scrim cancels a form only when nothing has been typed.
- The page behind is `inert` and its scroll is locked.
- Contrast: Danger label 4.83 : 1 (light) and about 7 : 1 (dark). Title and description use `text.primary` / `text.secondary` on `surface.panel`.

## Gaps

- No max-height or scrolling-body spec yet. For now the body scrolls inside the modal, and the header and footer stay fixed.
- No loading state on the confirming button (GAP-02).
- No legacy evidence.

## Implementation references

- Pencil: `C31 — Modal` (`ukLqT`); `C30 — App shell` › *Modal overlay*
- Exploration: `exploration.pen` › 04 (options A / B, decision)
- Rules: token-usage.md §2 *Surfaces*, §5, §6, §7, §8
