# Component: `Media Viewer`

## Status and approval

- Lifecycle: `APPROVED` 2026-10-04. Explored in `gallery.pen` (board `o1dRD`; the Owner chose option B, immersive, without a status chip), designed locally (COMPONENT GAP-3), then promoted (Owner: "Approve all").
- Rules: `token-usage.md` amendment 2026-10-04 lets `surface.inverse` back a full-screen media viewer. The thumbnail opacity is a G7 exception the Owner approved.
- Pencil library: `design-system.lib.pen` › **C48 — Media viewer** (`f3g3Pl`)
- Consumers: F-09 Owner photo preview. Expected: F-10 client preview (different actions), F-12 final-delivery preview.

## Purpose

A full-screen photo preview (lightbox). The photo is shown as large as it fits on a dark backdrop. A top bar holds the file name, meta and actions, with ← / → and a filmstrip to move between photos of the same list. It opens from a Photo Tile.

## Anatomy

| # | Part | Layer (Desktop / Mobile) | Required | Description |
|---|---|---|---:|---|
| 1 | Viewer | `Media Viewer/Desktop` (`rbwFa`) / `Media Viewer/Mobile` (`cLkBF`) | — | Fills the viewport, `media-viewer.backdrop`. |
| 2 | Top bar | `Top bar` | Yes | Padding `bar-padding-y` / `bar-padding-x`, gap `bar-gap`. Contains File name (body, bold) and Meta (body-sm; caption on phones), both `media-viewer.text`, then the Actions slot and *Tutup* (Icon Button Ghost, icon in `media-viewer.text`). |
| 3 | Actions | `Actions` slot (`x1fkwu` / `SeLrM`) | No | Owner: *Buka di Google Drive* (Button Secondary on desktop; an Icon Button on phones). Clients (F-10): their own actions. |
| 4 | Stage | `Stage` | Yes | The Image (`QEKsU` / `gbxP7`, image fill `contain`) with Icon Button Outline ← / → at `nav-inset` from the sides (desktop only; phones swipe). A missing file shows `image-off` and a text message instead of the image. |
| 5 | Filmstrip | `Filmstrip` slot (`FclcC` / `oLMLe`) | Yes | Filmstrip Thumbs, gap `filmstrip-gap`. Thumbs are 48 on desktop and 44 on phones. |

## Variants

| Component | ID | Notes |
|---|---|---|
| `Media Viewer/Desktop` | `rbwFa` | Desktop and tablet. |
| `Media Viewer/Mobile` | `cLkBF` | Phones; no arrows. |
| `_FilmstripThumb/Base` | `m7vpvp` | Private. Radius `thumb-radius`, clipped, with an image fill. |
| `Filmstrip Thumb/Default` | `IGxRK` | Inactive: opacity `thumb-inactive-opacity` (0.6). |
| `Filmstrip Thumb/Active` | `xyliD` | Current photo: full opacity and a 2 px `thumb-active-border`. |

## Token dependencies

| Decision | Token |
|---|---|
| Backdrop | `component.media-viewer.backdrop` → `surface.inverse` (light) / `surface.canvas` (dark). It stays dark in both modes. |
| Text, icons, active outline | `text`, `thumb-active-border` → `text.inverse` (light) / `text.primary` (dark) |
| Inactive thumbnails | `thumb-inactive-opacity` → `opacity.media-inactive` (0.6) |
| Spacing | `bar-padding-x` → `space.6`, `bar-padding-y` → `space.4`, `bar-gap` → `space.4`, `nav-inset` → `space.8`, `filmstrip-gap` → `space.2` |
| Radius | `thumb-radius` → `radius.sm` |

All tokens PERSISTED 2026-10-04 (623 tokens, checksum `c2c0a40b`).

## Accessibility

- **Dialog:** `role=dialog`, `aria-modal=true`, labelled "Preview {file name}". Focus moves to *Tutup* on open and returns to the tile on close.
- **Keyboard:** ← / → for previous and next, Esc closes, Home and End go to the first and last photo. On phones, swipe. The filmstrip is a horizontal list of buttons.
- **Contrast:** text and the active outline on the backdrop are above 15:1 in both modes.
- **State:** the current thumbnail is marked by its outline as well as its full opacity, so state is never shown by opacity alone.
- **Image:** `alt` is the file name. A missing file shows text, never an empty frame.

## Gaps

- The stage image and the arrows are absolutely positioned (literal x/y). `nav-inset` documents the 32 px side inset.
- The viewer size is the viewport (1440 × 1024 and 390 × 844 shown).
- The thumbnail placeholder fill borrows `component.photo-tile.image-background`.
