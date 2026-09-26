# Component: `Sidebar`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (tier 3, Owner review)
- Direction/token approval: `APPROVED` tokens. It adds no new tokens: the sidebar is a **layout region**, so it binds semantic and scale tokens per the board 08 layout map (padding 8·12, section gap 12), following G3's "screens and layouts" clause. The Owner may promote these to `sidebar.*` component aliases.
- Pencil library: `design-system.lib.pen` › **C29 — Sidebar** (`nSDgz`)
- Evidence: legacy dashboard › Sidebar

## Anatomy (`vB50q`, 252 × fill; drawn at 936)

| # | Part | Tokens / nested |
|---|---|---|
| 1 | Root | No fill (canvas shows through); vertical; gap `space.3`; padding `space.2` / `space.3` |
| 2 | Logo row | padding-x `space.2`. Mark (aperture 22) and wordmark (title 18/700) in `text.primary`, then collapse (Icon Button/Ghost/SM `panel-left`) |
| 3 | Divider | 1 px `border.default` |
| 4 | Workspace switcher | `surface.panel` + `border.default`, `radius.sm`, padding 8/12 (legacy 9/10 → 8/12, aligned with nav items), gap 8. Mark 20 × 20 `accent.highlight` with a `radius.xs` corner and a camera icon in `accent.on-highlight`; name (body 14/500, text `Workspace` `rAUNw`); chevrons in `text.muted` |
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

## Tokens (added 2026-09-26)

The Owner promoted the layout region to component aliases. The values didn't change: `sidebar.padding-y/-x` (8 / 12), `sidebar.gap` (12), `sidebar.logo` (`text.primary`), `sidebar.divider` (`border.default`), `sidebar.workspace.background/border/radius/mark` (`surface.panel` / `border.default` / `radius.sm` / `accent.highlight`) and `sidebar.account.gap` (10). The Bottom Sheet/Menu logo, workspace switcher and account bind the same aliases.

## Gaps

- Collapsed = `Sidebar/Rail` (C37, tablet). Mobile uses the Bottom Nav + Menu sheet (C34/C32) instead of a drawer.

## Implementation references

- Pencil: `C29 — Sidebar` (`nSDgz`)
- Rules: token-usage.md G3, SP7, §2 *Accent*, §4.5 layout map
