# Component: `Photo Tile`

## Status and approval

- Lifecycle: `APPROVED` 2026-10-04. Designed locally in F-09 (`gallery.pen`, COMPONENT GAP-1), then promoted (Owner: "Approve all").
- Pencil library: `design-system.lib.pen` › **C46 — Photo tile** (`vxJaC`)
- Consumers: F-09 gallery (*Foto* card preview, *Semua foto* grid). Expected: F-10 client gallery, F-11 selection.

## Purpose

One photo in a grid: a cropped thumbnail and its file name, with an optional meta line (the folder path in search results). Opening a tile opens the Media Viewer (C48). Folders in the same grid use Folder Tile (C47), which has the same footprint.

## Anatomy

| # | Part | Layer | Required | Description |
|---|---|---|---:|---|
| 1 | Base | `_PhotoTile/Base` (`En7KF`) | — | Private. Vertical stack, gap `photo-tile.gap`. |
| 2 | Image | `Image` (`vnyor`) | Yes | Image fill (`cover`). Radius `photo-tile.image-radius`; while loading, `photo-tile.image-background`. Its height follows the grid: 220 on desktop (4 per row), 104 on phones (3 per row). |
| 3 | Badge | `Badge` (`gj2DD`) | No | Status Chip/Warning *Hilang*, 8 px from the top-left (`photo-tile.badge-inset`). |
| 4 | File name | `File name` (`dTxmf`) | Yes | body-sm, medium, `photo-tile.name`. |
| 5 | Meta | `Meta` (`erGMi`) | No | caption, `photo-tile.meta`. Off in folder views; on in search results (*Rina-Wisuda › Akad · edited*). |

## Variants

| Component | ID | Notes |
|---|---|---|
| `Photo Tile/Default` | `AzJU9` | Badge off. |
| `Photo Tile/Missing` | `HEwJS` | Badge on (*Hilang*). The file is gone from Drive; the photo is kept and hidden from the client (BR-GAL-006). |
| `Photo Tile/Skeleton` | `e0pYUm` | Image and bar placeholders in `photo-tile.image-background`. Used while infinite scroll loads the next page. |

### Selectable (F-10, code only until the library promotion)

Built in `src/ui/patterns/photo-tile` from the local *Pick Tile* (`client-access.pen` `j1xyVG`) ahead of the planned library component *Photo Tile/Selectable*. Props `selection` (`isSelected`, `isDisabled`, `onChange`), `badge` (`label`, `tone` `info` for the own group's quantity, `neutral` for another group's marker) and `note` (*Catatan* button over the image, `surface.on-media`).
- The whole tile is a toggle button (`aria-pressed`); the select control top-right is decorative. A full group disables unpicked tiles (`opacity.disabled` on the control); a picked tile stays enabled so it can be un-picked.
- The *Catatan* button is a separate button over the top-left corner: ＋ when empty, `message-square-text` when filled.

## Token dependencies

| Decision | Token |
|---|---|
| Image placeholder | `component.photo-tile.image-background` → `surface.sunken` |
| Text | `component.photo-tile.name` → `text.primary`, `meta` → `text.secondary` |
| Spacing | `gap` → `space.2`, `text-gap` → `space.0-5`, `badge-inset` → `space.2` |
| Radius | `image-radius` → `radius.md` |

All tokens PERSISTED 2026-10-04 (623 tokens, checksum `c2c0a40b`).

## Accessibility

- The tile is one button that opens the preview. Its name is the file name, plus "hilang" when the file is missing.
- The image is decorative inside the button (`alt=""`), because the name is already in the label. Thumbnails load lazily and keep their box while loading.
- *Hilang* is text, never colour alone. Name and meta meet AA on `surface.panel` in both modes.

## Gaps

- The badge offset is a literal x/y of 8, because absolute positions take no variables. `photo-tile.badge-inset` documents the value.
- The image height is a literal per grid (220 / 104), like list-row heights.
