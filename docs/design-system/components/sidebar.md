# Component: `Sidebar`

The same component renders the expanded desktop navigation and the 72 px
compact rail. Compact mode hides labels, uses compact Nav Items with Tooltips,
and turns the logo into the expand control.

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (tier 3, Owner review)
- Direction/token approval: `APPROVED`, amended by shell v3 on 2026-09-28: the root is L1 `surface.muted`, dividers use `border.input`, and the workspace switcher has no decorative mark.
- Pencil library: `design-system.lib.pen` › **C29 — Sidebar** (`nSDgz`)
- Evidence: legacy dashboard › Sidebar

## Anatomy (`vB50q`, 252 × fill; drawn at 936)

| # | Part | Tokens / nested |
|---|---|---|
| 1 | Root | `surface.muted` (L1 shell); vertical; gap `space.3`; padding `space.2` / `space.3` |
| 2 | Logo row | padding-x `space.2`. Mark (aperture 22) and wordmark (title 18/700) in `text.primary`, then collapse (Icon Button/Ghost/SM `panel-left`) |
| 3 | Divider | 1 px `sidebar.divider` → `border.input` |
| 4 | Workspace switcher | `sidebar.workspace.background/border/radius` (`surface.panel` / `border.default` / `radius.sm`), padding 8/12, gap 8. It contains the Name (`Workspace` `rAUNw`) and muted chevrons only—no decorative workspace mark. Compact rail keeps its dedicated workspace icon control. |
| 5 | Nav | slot `tilEo`: groups gap 12, items gap 4 (Nav Item, Nav Group Label) |
| 6 | Spacer | the one allowed flexible spacer (SP7) |
| 7 | Nav bottom | slot `pRu41`: settings-type destinations |
| 8 | Account | padding `space.1` / `space.2`, gap `space.2-5` (avatar ↔ name, §4.4). Avatar MD (`aXcVC/DloPs`), Name `EpYE1` (body-sm 600), Email `pMF7b` (caption, muted), log out (Icon Button/Ghost/SM `log-out`) |

## Decisions and snaps

- Legacy logo mark blue → `text.primary` (monochrome). `action.primary` isn't decoration (§2), and brand rules are GAP-03.
- Legacy red log-out icon → neutral ghost button. Logging out isn't destructive.
- Legacy bottom-pad frame → root padding-bottom `space.2` (SP7: no spacer elements).

## Accessibility

- `<nav aria-label="Utama">` wraps both nav slots. The Active item has `aria-current=page`.
- The workspace switcher is a button (`aria-haspopup=menu`) that opens a Menu of workspaces.
- Collapse and log out need `aria-label`s (*Ciutkan sidebar*, *Keluar*).
- In compact mode, the logo is the *Buka sidebar* button. On desktop it changes
  from the brand mark to the expand icon on hover/focus; on tablet it opens the
  expanded Sidebar overlay.

## Tokens (added 2026-09-26)

The Owner promoted the layout region to component aliases. Shell v3 keeps `sidebar.padding-y/-x` (8 / 12), `sidebar.gap` (12), `sidebar.logo` (`text.primary`), `sidebar.workspace.background/border/radius` (`surface.panel` / `border.default` / `radius.sm`) and `sidebar.account.gap` (10), while retargeting `sidebar.divider` to `border.input`. `sidebar.workspace.mark` remains in the token set for compatibility but is not rendered by the v3 switcher. Bottom Sheet/Menu uses the same mark-free switcher.

## Gaps

- Compact mode is the `Sidebar/Rail` layout (C37) rendered by this component.
  Mobile uses the Bottom Nav + Menu sheet (C34/C32) instead of a drawer.

## F-17 update — PROMOTED 2026-09-29

Promoted to `design-system.lib.pen` by `/sdv:save-design-system` (F-17, Owner-approved design; rules v3.1). Library: via Nav Item tokens and `CInVy` (label semibold). Details: [F-17 design.md](../../features/app-shell-revamp/design.md).

- Active and hover Nav Items change through C22.
- The switcher Menu has the same content as the phone sheet: no icons, dividers, and a primary *Buat workspace* button.

## Implementation references

- Pencil: `C29 — Sidebar` (`nSDgz`)
- Rules: token-usage.md G3, SP7, §2 *Accent*, §4.5 layout map
