# Component: `Folder Tile`

## Status and approval

- Lifecycle: `APPROVED` 2026-10-04. Designed locally in F-09 (COMPONENT GAP-2), then promoted (Owner: "Approve all").
- Pencil library: `design-system.lib.pen` › **C47 — Folder tile** (`FSfkL`)
- Consumers: F-09 *Semua foto* (Drive-like folder browsing, BR-GAL-007). Expected: F-10 client gallery, if folders are shown to clients.

## Purpose

A folder in a photo grid. It has the same footprint as Photo Tile (C46), so folders and photos share one Drive-like grid, with folders first. It shows the folder name and its photo count for the active kind tab.

## Anatomy

| # | Part | Layer | Required | Description |
|---|---|---|---:|---|
| 1 | Tile | `Folder Tile` (`NWvmt`) | — | Vertical stack, gap `folder-tile.gap`. |
| 2 | Icon wrap | `Icon wrap` (`gvT5W`) | Yes | `folder-tile.background`, 1 px `folder-tile.border`, radius `folder-tile.radius`, icon centred. Its height matches the photo grid: 220 on desktop, 104 on phones. |
| 3 | Icon | `Icon` (`mWqBB`) | Yes | lucide `folder`: 48 on desktop, 32 on phones; `folder-tile.icon`. |
| 4 | Name | `Name` (`rkS3D`) | Yes | body-sm, medium, `folder-tile.name`. |
| 5 | Count | `Count` (`tll3W`) | Yes | caption, `folder-tile.count`, for example *64 foto*. |

## Behaviour

- **Placement:** in a folder, subfolders come first and then photos, both in name order. At the top level with several sources, one tile per source. With a single source, its folder opens directly.
- **Opening a folder** updates the breadcrumb (*Semua folder › Rina-Wisuda › Akad*). In *Edited* and *Print*, the `edited` / `print` level is folded into its parent folder.
- **Hidden folders:** empty folders, and folders without photos of the active kind, are not shown.

## Token dependencies

| Decision | Token |
|---|---|
| Surface | `component.folder-tile.background` → `surface.subtle`, `border` → `border.default` |
| Icon and text | `icon` → `text.secondary`, `name` → `text.primary`, `count` → `text.secondary` |
| Spacing | `gap` → `space.2`, `text-gap` → `space.0-5` |
| Radius | `radius` → `radius.md` |

All tokens PERSISTED 2026-10-04 (623 tokens, checksum `c2c0a40b`).

## Accessibility

- The whole tile is one button or link named "{folder}, {n} foto"; the icon is decorative.
- Grid items follow reading order. Enter or Space opens the folder, and the breadcrumb leads back.
- Text meets AA on `surface.panel` in both modes.

## Gaps

- The icon size (48 / 32) and the wrap height (220 / 104) are literals, like other icon and row sizes.
