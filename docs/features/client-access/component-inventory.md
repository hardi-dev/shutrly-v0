# F-10 Client access — component inventory

Read from the code on 2026-10-06 (plan Slice 0.4). Status: **exists** (use as is), **extend** (small change to a `src/ui` component), **new**.

| Component | Spec | Status | Path | Needed change | First used in |
|---|---|---|---|---|---|
| Stepper (C08) | `components/stepper.md` | new | `src/ui/primitives/stepper/` | Build from the spec: Decrement (neutral), Value, Increment (primary); states default, focus, at-minimum, disabled; `stepper.*` tokens already in `tokens.css` | Slice 4 (Foto cetak) |
| PhotoTile selectable | `components/photo-tile.md`, local *Pick Tile* `j1xyVG` | extend | `src/ui/patterns/photo-tile/` | Optional `selection` prop: select control (checked / unchecked / disabled), quantity chip, note marker on `surface.on-media`; the tile stays a plain PhotoTile without it | Slice 4 |
| MediaViewer actions slot | `components/media-viewer.md` | exists | `src/ui/patterns/media-viewer/` | `renderActions(item)` already exists; Pilih / quantity / Catatan go there | Slice 4 |
| PageHeader breadcrumb on a public layout | `components/page-header.md` | exists | `src/ui/patterns/page-header/` | `breadcrumbs` with `href` items already supported; `parent`/`current` are required props, pass the breadcrumb ends | Slice 3 |
| MobileHeader without workspace bar | `components/mobile-shell.md` | extend | `src/ui/patterns/mobile-header/` | Make `workspace` optional; render a `leading` slot (back button) instead of the WorkspacePill when absent | Slice 3 |
| Client Header / Client Shell (local `gloCE`, `Qk0C6`, `a7uMtC`, `BhBua`) | design.md › B board | new (feature) | `src/features/gallery/ui/client-shell/` | Brand bar + PageHeader / MobileHeader + content; stays in the feature until F-14 | Slice 2 (gate), Slice 3 |
| Modal SM / MD | `components/modal.md` | exists | `src/ui/patterns/modal/` | — | Slice 5 |
| BottomSheet Form / Actions / Menu | `components/bottom-sheet.md` | exists | `src/ui/patterns/bottom-sheet/` | — | Slice 4 |
| Menu + MenuItem with icons | `components/menu.md`, `menu-item.md` | exists | `src/ui/patterns/menu/` | `icon` prop exists | Slice 4, 9 |
| SegmentedControl (+ full width) | `components/segmented-control.md` | exists | `src/ui/patterns/segmented-control/` | `isFullWidth` exists | Slice 3 |
| StatusChip variants | `components/status-chip.md` | exists | `src/ui/primitives/status-chip/` | info, neutral, success, warning, danger tones exist | Slice 3 |
| Alert Info / Warning / Danger | `components/alert.md` | exists | `src/ui/patterns/alert/` | — | Slice 2 |
| Toast | `components/toast.md` | exists | `src/ui/patterns/toast/` | — | Slice 4 |
| EmptyState in card | `components/empty-state.md` | exists | `src/ui/patterns/empty-state/` | `placement="in-card"` exists | Slice 3 |
| SectionCard variants | `components/section-card.md` | exists | `src/ui/patterns/section-card/` | padded / flush / bleed exist | Slice 6 |
| ListCardItem two-line | `components/list-card.md` | exists | `src/ui/patterns/list-card-item/` | title + meta exist | Slice 6 |
| Switch | `components/switch.md` | exists | `src/ui/primitives/switch/` | — | Slice 1 |
| Radio / OptionCard | `components/radio.md`, `option-card.md` | exists | `src/ui/primitives/radio/`, `src/ui/patterns/option-card/` | — | Slice 1 |
| Textarea with counter | `components/textarea.md` | exists | `src/ui/primitives/textarea/` | `trailingMeta` shows the *n/500* counter | Slice 4 |
| Group Summary (local `SBwD1`) | design.md › B board | new (feature) | `src/features/gallery/ui/group-summary/` | Group name, status chip, usage bar, Tinjau / Kirim | Slice 3 |
| Pick Row (local `Xig4E`) | design.md › B board | new (feature) | `src/features/gallery/ui/pick-row/` | Thumbnail, name, folder, trailing slot, note | Slice 5 |
